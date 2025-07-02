import { middyfy } from "#lib/middleware.js";
import { getUserUUID } from "#lib/authorizer.js";
import { handleError } from "#routes/utils.js";
import { getURLSForUser } from "#lib/services/dynamo/index.js";
import { bodyFormatter } from "#routes/utils.js";

const listURLs = async (event) => {
  try {
    const userUUID = getUserUUID(event);

    const urls = await getURLSForUser(userUUID);

    return bodyFormatter(urls);
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(listURLs);
