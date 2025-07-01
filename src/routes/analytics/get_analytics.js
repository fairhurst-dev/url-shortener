import { middyfy } from "#lib/middleware.js";

const getAnalytics = async (event) => {
  //validate input
  //fetch user object from database
  //if user does not exist, return 401
  //if user has not reached limit, return 403
  //if user has not reached limit,
  //fetch analytics data from database
  //return analytics data in the response
};

export const handler = middyfy(getAnalytics);
