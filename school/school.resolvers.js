// *************** IMPORT CORE ***************
const School = require("./school.model");

// *************** QUERY ***************
async function GetSchool(_, { id }) {
  return await School.findOne({ _id: id, status: "is_active" });
}

async function GetAllSchools() {
  return await School.find({ status: "is_active" });
}

// *************** MUTATION ***************
async function CreateSchool(_, { input }) {
  const school = new School({
    long_name: input.name.long_name,
    short_name: input.name.short_name,
    address: input.address,
    status: "is_active",
  });

  return await school.save();
}

async function UpdateSchool(_, { input }) {
  const { id, name, address } = input;

  await School.findOneAndUpdate(
    { _id: id, status: "is_active" },
    {
      long_name: name.long_name,
      short_name: name.short_name,
      address,
    }
  );

  return await School.findById(id);
}

async function SoftDeleteSchool(_, { id }) {
  await School.findOneAndUpdate(
    { _id: id, status: "is_active" },
    { status: "deleted" }
  );

  return await School.findById(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetSchool,
    GetAllSchools,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    SoftDeleteSchool,
  },
};
