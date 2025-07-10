import { getUserUUID } from "#lib/authorizer.js";
import { middyfy } from "#lib/middleware.js";
import { bodyFormatter, handleError } from "#routes/utils.js";
import {
  getAnalyticsForUser,
  getUserByUUID,
} from "#lib/services/dynamo/index.js";
import { hasUserReachedRequestLimit } from "#lib/authorizer.js";

const getAnalytics = async (event) => {
  try {
    const userUUID = getUserUUID(event);
    const user = await getUserByUUID(userUUID);

    await hasUserReachedRequestLimit(user);

    const analyticsData = await getAnalyticsForUser(userUUID);

    return bodyFormatter(analyticsData);
  } catch (error) {
    return handleError(error);
  }
};

export const handler = middyfy(getAnalytics);
