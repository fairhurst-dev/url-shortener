import { middyfy } from "#lib/middleware.js";
import { JSONBodyParser } from "@middy/http-json-body-parser";
import { updateURLValidator } from "#lib/validators.js";
import { badRequest, bodyFormatter, handleError } from "#routes/utils.js";
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

      return bodyFormatter({
        shortCode: shortCode,
        fullURL: value.fullURL,
      });
    }
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(updateURL).use(JSONBodyParser());
