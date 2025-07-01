import { middyfy } from "#lib/middleware.js";

const redirect = async (event) => {
  //if no pathParameters, return 400
  //fetch URL object from DDB
  //if URL does not exist, return 404
  //if URL exists, return 301 redirect to the original URL
  //publish sns event to increment click count
};

export const handler = middyfy(redirect);
