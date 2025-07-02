import { middyfy } from "#lib/middleware.js";
import { handleError, badRequest } from "#routes/utils.js";
import {
  hasUserReachedRequestLimit,
  getUserUUID,
  doesUserOwnShortCode,
} from "#lib/authorizer.js";
import { deleteShortCode } from "#lib/services/dynamo/index.js";

const deleteCode = async (event) => {
  try {
    const shortCode = path(["pathParameters", "shortCode"], event);
    if (!shortCode) {
      return badRequest("Missing shortCode");
    }
    const userUUID = getUserUUID(event);

    await hasUserReachedRequestLimit(event);
    await doesUserOwnShortCode({
      userUUID,
      shortCode,
    });

    await deleteShortCode(shortCode);

    return {
      statusCode: 204,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(deleteCode);
