// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.model');

// *************** IMPORT VALIDATOR ***************
const CommonValidator = require('../../utilities/validator');

function SubjectLoader() {
  // *************** Create new instance of DataLoader
  return new DataLoader(async (subject_ids) => {
    // ***************  Validate the incoming schoolIds
    CommonValidator.ValidateMongoObjectIds(subject_ids);

    // *************** Find all Schools whose id is in the schoolIds array
    const subjects = await SubjectModel.find({
      _id: { $in: subject_ids },
    }).lean();

    // *************** Create schoolMap object for dictionary
    const subjecttMap = {};
    subjects.forEach((subject) => {
      subjecttMap[String(subject._id)] = subject;
    });

    // *************** Return an array containing schools in the order of the requested schoolIds.
    const orderedSubjects = subject_ids.map((_id) => subjectMap[String(_id)]);
    return orderedSubjects;
  });
}

// *************** EXPORT MODULE ***************
module.exports = SubjectLoader;
