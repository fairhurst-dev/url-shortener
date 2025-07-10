import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { fullURLValidator } from "#lib/validators.js";
import { badRequest, bodyFormatter, handleError } from "#routes/utils.js";
import {
  hasUserReachedRequestLimit,
  hasUserReachedCodeLimit,
  getUserUUID,
} from "#lib/authorizer.js";
import { isSafeURL } from "#lib/services/safe_browsing/index.js";
import { generateShortCode } from "#lib/shortener.js";
import {
  createShortCode,
  createAnalyticsEntry,
  getUserByUUID,
} from "#lib/services/dynamo/index.js";

const shorten = async (event) => {
  try {
    const { error, value } = fullURLValidator(event.body);
    if (error) {
      return badRequest(error);
    }
    const userUUID = getUserUUID(event);
    const user = await getUserByUUID(userUUID);

    await hasUserReachedRequestLimit(user);
    await hasUserReachedCodeLimit(user);

    const isSafeFlag = await isSafeURL(value.fullURL);
    if (isSafeFlag) {
      const shortCode = generateShortCode(value.fullURL);

      const resp = await createShortCode({
        userUUID,
        shortCode,
        fullURL: value.fullURL,
      });

      await createAnalyticsEntry({
        userUUID,
        shortCode,
        ttlString: resp.ttlString,
        fullURL: value.fullURL,
      });

      return bodyFormatter({
        shortCode,
        fullURL: value.fullURL,
        ttlString: resp.ttlString,
      });
    } else {
      throw new Error("URLSafetyCheckFailedException");
    }
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(shorten).use(httpJsonBodyParser());
