// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODELS ***************
const StudentTestResultModel = require('../student_test_result/student_test_result.model');
const TestModel = require('../test/test.model');
const SubjectModel = require('../subject/subject.model');
const BlockModel = require('../block/block.model');

async function CalculateTranscript(student_id) {
  try {
    CommonValidator.ValidateObjectId(student_id, 'Student ID');

    const studentTestResults = await StudentTestResultModel.find({
      student_id,
    });
    if (!studentTestResults.length) {
      throw new ApolloError(
        'No StudentTestResult found for the student',
        'NO_RESULT'
      );
    }

    const test_results = await CalculateTestResult(studentTestResults);
    const subject_results = await CalculateSubjectResult(test_results);
    const block_results = await CalculateBlockResult(subject_results);

    const overall_result = block_results.every(
      (block) => block.block_result === 'PASS'
    )
      ? 'PASS'
      : 'FAIL';

    const final_result = {
      student_id,
      overall_result,
      results: block_results,
      created_at: new Date(),
    };

    await CalculationResultModel.updateOne(
      { student_id },
      { $set: final_result },
      { upsert: true }
    );

    return final_result;
  } catch (error) {
    throw new ApolloError(error.message, 'TRANSCRIPT_CALCULATION_FAILED');
  }
}

// *************** TEST LEVEL ***************
async function CalculateTestResult(studentTestResults) {
  const test_ids = studentTestResults.map((r) => r.test_id);
  const tests = await TestModel.find({ _id: { $in: test_ids } });

  const test_results = studentTestResults
    .map((result) => {
      const test = tests.find(
        (t) => t._id.toString() === result.test_id.toString()
      );
      if (!test) return null;

      const average_mark = result.average_mark;
      const weighted_mark = average_mark * test.weight;

      const context = {
        test_score_1: result.test_score_1,
        average_mark,
        weighted_mark,
      };

      const outcome = EvaluateCriteria(
        test.passing_criteria,
        weighted_mark,
        context
      );

      return {
        test_id: test._id,
        subject_id: test.subject_id,
        weighted_mark,
        test_result: outcome,
      };
    })
    .filter(Boolean);

  return test_results;
}

// *************** SUBJECT LEVEL ***************
async function CalculateSubjectResult(test_results) {
  const groupedBySubject = {};

  test_results.forEach((test) => {
    const subject_id = test.subject_id.toString();
    if (!groupedBySubject[subject_id]) groupedBySubject[subject_id] = [];
    groupedBySubject[subject_id].push(test);
  });

  const subject_ids = Object.keys(groupedBySubject);
  const subjects = await SubjectModel.find({ _id: { $in: subject_ids } });

  const subject_results = subject_ids.map((subject_id) => {
    const tests = groupedBySubject[subject_id];
    const subject = subjects.find((s) => s._id.toString() === subject_id);

    const weighted_sum = tests.reduce((sum, t) => sum + t.weighted_mark, 0);
    const avg_weighted = weighted_sum / tests.length;
    const total_mark = avg_weighted * subject.coefficient;

    const context = {
      total_mark,
      test_results: tests.map((t) => t.test_result),
    };

    const outcome = EvaluateCriteria(
      subject.passing_criteria,
      total_mark,
      context
    );

    return {
      subject_id: subject._id,
      block_id: subject.block_id,
      total_mark,
      subject_result: outcome,
    };
  });

  return subject_results;
}

// *************** BLOCK LEVEL ***************
async function CalculateBlockResult(subject_results) {
  const groupedByBlock = {};

  subject_results.forEach((subject) => {
    const block_id = subject.block_id.toString();
    if (!groupedByBlock[block_id]) groupedByBlock[block_id] = [];
    groupedByBlock[block_id].push(subject);
  });

  const block_ids = Object.keys(groupedByBlock);
  const blocks = await BlockModel.find({ _id: { $in: block_ids } });

  const block_results = block_ids.map((block_id) => {
    const subjects = groupedByBlock[block_id];
    const block = blocks.find((b) => b._id.toString() === block_id);

    const total_mark =
      subjects.reduce((sum, s) => sum + s.total_mark, 0) / subjects.length;

    const context = {
      total_mark,
      subject_results: subjects.map((s) => s.subject_result),
    };

    const outcome = EvaluateCriteria(
      block.passing_criteria,
      total_mark,
      context
    );

    return {
      block_id: block._id,
      total_mark,
      block_result: outcome,
      subjects,
    };
  });

  return block_results;
}

// *************** EXPORT MODULE ***************
module.exports = {
  CalculateTranscript,
  CalculateTestResult,
  CalculateSubjectResult,
  CalculateBlockResult,
};
