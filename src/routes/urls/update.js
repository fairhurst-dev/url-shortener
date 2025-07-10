import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { fullURLValidator } from "#lib/validators.js";
import { badRequest, bodyFormatter, handleError } from "#routes/utils.js";
import {
  hasUserReachedRequestLimit,
  getUserUUID,
  doesUserOwnShortCode,
} from "#lib/authorizer.js";
import { isSafeURL } from "#lib/services/safe_browsing/index.js";
import {
  updateFullURLByShortCode,
  getUserByUUID,
} from "#lib/services/dynamo/index.js";
import { path } from "ramda";

const updateURL = async (event) => {
  try {
    const shortCode = path(["pathParameters", "shortCode"], event);
    if (!shortCode) {
      return badRequest("missing shortCode");
    }

    const { error, value } = fullURLValidator(event.body);
    if (error) {
      return badRequest(error);
    }
    const userUUID = getUserUUID(event);
    const user = await getUserByUUID(userUUID);

    await hasUserReachedRequestLimit(user);
    await doesUserOwnShortCode({
      user,
      shortCode,
    });

    const isSafeFlag = await isSafeURL(value.fullURL);
    if (isSafeFlag) {
      await updateFullURLByShortCode({
        shortCode,
        fullURL: value.fullURL,
      });

      return bodyFormatter({
        shortCode,
        fullURL: value.fullURL,
      });
    } else {
      throw new Error("URLSafetyCheckFailedException");
    }
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(updateURL).use(httpJsonBodyParser());
