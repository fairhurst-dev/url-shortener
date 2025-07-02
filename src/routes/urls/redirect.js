import { middyfy } from "#lib/middleware.js";
import { badRequest, notFound } from "#routes/utils.js";
import { path } from "ramda";

const redirect = async (event) => {
  const shortCode = path(["pathParameters", "shortCode"], event);

  if (!shortCode) {
    return badRequest("Missing shortCode");
  }

  const fullURL = await getFullURLByShortCode(shortCode);

  if (!fullURL) {
    return notFound();
  }

  await incrementAnalytics({ shortCode });

  return {
    statusCode: 302,
    headers: {
      Location: fullURL,
    },
  };
};

export const handler = middyfy(redirect);
