import { middyfy } from "#lib/middleware.js";
import { JSONBodyParser } from "@middy/http-json-body-parser";
import { shortenURLValidator } from "#lib/validators.js";
import { badRequest, bodyFormatter, handleError } from "#routes/utils.js";
import {
  hasUserReachedRequestLimit,
  hasUserReachedCodeLimit,
  getUserUUID,
} from "#lib/authorizer.js";
import { isSafeURL } from "#lib/services/safe_browsing/index.js";
import { generateShortCode } from "#lib/services/shortener.js";
import {
  createShortCode,
  createAnalyticsEntry,
} from "#lib/services/dynamo/index.js";

const shorten = async (event) => {
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

      return bodyFormatter({
        shortCode: shortCode,
        fullURL: value.fullURL,
      });
    }
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(shorten).use(JSONBodyParser());
