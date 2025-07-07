// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server-express');

const TaskTypeDefs = gql`
  enum EnumTaskType {
    assign_corrector
    enter_marks
    validate_marks
  }

  enum EnumTaskStatus {
    pending
    in_progress
    completed
  }

  type Task {
    _id: ID!
    test_id: ID!
    user_id: ID!
    task_type: EnumTaskType!
    task_status: EnumTaskStatus!
    due_date: Date
    created_at: Date!
    updated_at: Date!
    deleted_at: Date!
  }

  input CreateTaskInput {
    test_id: ID!
    user_id: ID!
    task_type: EnumTaskType!
    task_status: EnumTaskStatus!
    due_date: Date
  }

  input UpdateTaskInput {
    test_id: ID!
    user_id: ID!
    task_type: EnumTaskType!
    task_status: EnumTaskStatus!
    due_date: Date
  }

  input AssignCorrectorInput {
    user_id: ID!
    due_date: Daye
  }

  type Query {
    GetOneTask(_id: ID!): Task
    GetAllTasks: [Task!]!
  }

  type Mutation {
    CreateTask(input: CreateTaskInput!): Task!
    UpdateTask(_id: ID!, input: UpdateTaskInput!): Task!
    AssignCorrector(_id: ID!, input: AssignCorrectorInput!): Task!
    Deletetask(_id: ID!): ID!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TaskTypeDefs;
