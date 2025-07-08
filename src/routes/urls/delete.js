import { middyfy } from "#lib/middleware.js";
import { handleError, badRequest } from "#routes/utils.js";
import {
  hasUserReachedRequestLimit,
  getUserUUID,
  doesUserOwnShortCode,
} from "#lib/authorizer.js";
import {
  deleteShortCode,
  deleteAnalyticsForShortCode,
  getUserByUUID,
} from "#lib/services/dynamo/index.js";
import { path } from "ramda";

const deleteCode = async (event) => {
  try {
    const shortCode = path(["pathParameters", "shortCode"], event);
    if (!shortCode) {
      return badRequest("Missing shortCode");
    }
    const userUUID = getUserUUID(event);
    const user = await getUserByUUID(userUUID);

    await hasUserReachedRequestLimit(user);
    await doesUserOwnShortCode({
      user,
      shortCode,
    });

    await deleteShortCode(shortCode);
    await deleteAnalyticsForShortCode(shortCode);

    return {
      statusCode: 204,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(deleteCode);
