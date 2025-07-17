// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const CalculationResultModel = require('./calculation_result.model');

// *************** QUERY ***************

/**
 * Retrieves all active calculation results from the CalculationResult collection.
 *
 * This function queries the database for documents with `calculation_result_status`
 * set to `'active'`, and returns the results as plain JavaScript objects.
 *
 * @async
 * @function GetCalculationResult
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of active calculation result documents.
 * @throws {ApolloError} If any error occurs during the database query.
 */
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
