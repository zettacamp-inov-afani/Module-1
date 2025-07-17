// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const CalculationResultModel = require('./calculation_result.model');

// *************** QUERY ***************

async function GetCalculationResult() {
  try {
    // *************** Retrieve all calculation results with status 'active'
    const calculationResults = await CalculationResultModel.find({
      calculation_result_status: 'active',
    }).lean();

    // *************** return the result
    return calculationResults;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetCalculationResult,
  },
};
