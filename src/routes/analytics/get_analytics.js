import { getUserUUID } from "#lib/authorizer.js";
import { middyfy } from "#lib/middleware.js";
import { bodyFormatter, handleError } from "#routes/utils.js";
import { getAnalyticsForUser } from "#lib/services/dynamo/index.js";

const getAnalytics = async (event) => {
  try {
    const userUUID = getUserUUID(event);

    await hasUserReachedRequestLimit(event);

    const analyticsData = await getAnalyticsForUser(userUUID);

    return bodyFormatter(analyticsData);
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(getAnalytics);
