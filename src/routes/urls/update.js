import { middyfy } from "#lib/middleware.js";
import { updateURLValidator } from "#lib/validators.js";
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
import { isSafeURL } from "#lib/services/safe_browsing/index.js";
import { updateFullURLByShortCode } from "#lib/services/dynamo/index.js";

const updateURL = async (event) => {
  try {
    const { error, value } = updateURLValidator.validate(event.body);
    if (error) {
      return badRequest(error);
    }
    const userUUID = getUserUUID(event);

    if (!userUUID) {
      return unauthorized();
    }

    await hasUserReachedRequestLimit(event);
    await doesUserOwnShortCode({
      userUUID,
      shortCode: value.shortCode,
    });

    const isSafeFlag = await isSafeURL(value.fullURL);
    if (isSafeFlag) {
      await updateFullURLByShortCode({
        shortCode: value.shortCode,
        fullURL: value.fullURL,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          shortCode: shortCode,
          fullURL: value.fullURL,
        }),
      };
    }
  } catch (error) {
    if (error.name === "TooManyRequestsException") {
      return tooManyRequests();
    }
    if (error.name === "UserNotFoundException") {
      return unauthorized();
    }

    if (error.name === "OwnershipCheckFailedException") {
      return unauthorized();
    }

    if (error.name === "URLSafetyCheckFailedException") {
      return badRequest("This URL is not safe");
    } else {
      return defaultError();
    }
  }
};

export const handler = middyfy(updateURL);
