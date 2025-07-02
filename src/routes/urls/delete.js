import { middyfy } from "#lib/middleware.js";
import {
  tooManyRequests,
  badRequest,
  unauthorized,
  defaultError,
} from "#routes/utils.js";
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

    if (!userUUID) {
      return unauthorized();
    }

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
    if (error.name === "TooManyRequestsException") {
      return tooManyRequests();
    }
    if (error.name === "UserNotFoundException") {
      return unauthorized();
    }

    if (error.name === "OwnershipCheckFailedException") {
      return unauthorized();
    } else {
      return defaultError();
    }
  }
};

export const handler = middyfy(deleteCode);
