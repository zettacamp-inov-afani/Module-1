// *************** IMPORT CORE ***************
const User = require("./user.model");

// *************** MUTATION ***************
const UserResolvers = {
  Query: {
    GetAllUsers: async () => {
      return await User.find({ deleted_at: null });
    },
    GetOneUser: async (_, { id }) => {
      return await User.findOne({ _id: id, deleted_at: null });
    },
  },
  Mutation: {
    CreateUser: async (_, { input }) => {
      const newUser = new User(input);
      return await newUser.save();
    },
    UpdateUser: async (_, { input }) => {
      const { id, ...updateData } = input;
      return await User.findOneAndUpdate(
        { _id: id, deleted_at: null },
        updateData,
        { new: true }
      );
    },
    DeleteUser: async (_, { id }) => {
      return await User.findOneAndUpdate(
        { _id: id, deleted_at: null },
        { deleted_at: new Date() },
        { new: true }
      );
    },
  },
};

module.exports = UserResolvers;
