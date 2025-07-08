import { middyfy } from "#lib/middleware.js";
import { badRequest, handleError, notFound } from "#routes/utils.js";
import { path } from "ramda";
import {
  getFullURLByShortCode,
  incrementAnalytics,
} from "#lib/services/dynamo/index.js";

const redirect = async (event) => {
  try {
    const shortCode = path(["pathParameters", "shortCode"], event);

    if (!shortCode) {
      return badRequest("Missing shortCode");
    }

    const fullURL = await getFullURLByShortCode(shortCode);

    if (!fullURL) {
      return notFound();
    }

    await incrementAnalytics(shortCode);

    return {
      statusCode: 302,
      headers: {
        Location: fullURL,
      },
    };
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(redirect);
