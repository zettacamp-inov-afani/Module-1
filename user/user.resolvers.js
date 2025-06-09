// *************** IMPORT CORE ***************
const User = require("./user.model");

// Dummy user login
const dummyUser = {
  _id: "dummy_user_id",
  role: "operator", // Change for access simulations
};

// *************** QUERY ***************
async function GetUser(_, { id }) {
  return await User.findOne({ _id: id, status: "is_active" });
}

async function GetAllUsers() {
  return await User.find({ status: "is_active" });
}

// *************** MUTATION ***************
async function CreateUser(_, { input }) {
  const user = new User({
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    password: input.password,
    role: input.role || "operator",
    status: "is_active",
  });

  return await user.save();
}

async function UpdateUser(_, { input }) {
  const { id, first_name, last_name, email, password, role } = input;

  await User.findOneAndUpdate(
    { _id: id, status: "is_active" },
    {
      first_name,
      last_name,
      email,
      password,
      role,
    }
  );

  return await User.findById(id);
}

async function SoftDeleteUser(_, { id }) {
  if (dummyUser.role !== "operator" && dummyUser.role !== "acadir") {
    throw new Error("Unauthorized: Only operator or acadir can delete users.");
  }

  const user = await User.findOne({ _id: id, status: "is_active" });

  if (!user) {
    throw new Error("User not found or already deleted.");
  }

  user.status = "deleted";
  await user.save();

  return user;
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetUser,
    GetAllUsers,
  },
  Mutation: {
    CreateUser,
    UpdateUser,
    SoftDeleteUser,
  },
};
