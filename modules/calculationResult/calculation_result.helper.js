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

    await CalculationResultModel.updateOne({ student_id }, final_result, {
      upsert: true,
    });

    return final_result;
  } catch (error) {
    throw new ApolloError(error.message, 'TRANSCRIPT_CALCULATION_FAILED');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { CalculateTranscript };
