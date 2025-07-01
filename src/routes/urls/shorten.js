import { middyfy } from "#lib/middleware.js";
import { shortenURLValidator } from "#lib/validators.js";
import {
  tooManyRequests,
  badRequest,
  unauthorized,
  tooManyResources,
} from "#routes/utils.js";
import {
  hasUserReachedRequestLimit,
  hasUserReachedCodeLimit,
  getUserUUID,
} from "#lib/services/authorizer.js";
import { isSafeURL } from "#lib/services/safe_browsing/index.js";
import { generateShortCode } from "#lib/services/shortener.js";
import { createShortCode } from "#lib/services/dynamo/index.js";

const shorten = async (event) => {
  //if URL is safe, create a new short URL
  //save the short URL to the database
  //return the short URL in the response

  try {
    const { error, value } = shortenURLValidator.validate(event.body);
    if (error) {
      return badRequest(error);
    }
    const userUUID = getUserUUID(event);

    await hasUserReachedRequestLimit(event);
    await hasUserReachedCodeLimit(event);

    const isSafeFlag = await isSafeURL(value.fullURL);
    if (isSafeFlag) {
      const shortCode = generateShortCode(value.fullURL);

      await createShortCode({
        userUUID,
        shortCode,
        fullURL: value.fullURL,
      });

      await createAnalyticsEntry({
        userUUID,
        shortCode,
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

    if (error.name === "TooManyResourcesException") {
      return tooManyResources();
    }

    if (error.name === "URLSafetyCheckFailedException") {
      return badRequest("This URL is not safe");
    }
  }
};

export const handler = middyfy(shorten);
