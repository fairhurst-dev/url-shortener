import {
  getUserByUUID,
  getURLSForUser,
  upsertUser,
} from "#lib/services/dynamo/index.js";

export const getUserUUID = path([
  "requestContext",
  "authorizer",
  "jwt",
  "claims",
  "username",
]);

const hasMadeRequestInLast5Minutes = (user) => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  return (
    user.timeOfLastRequest > fiveMinutesAgo && user.timeOfLastRequest <= now
  );
};

export const hasUserReachedRequestLimit = async (event) => {
  const userUUID = getUserUUID(event);

  const user = await getUserByUUID(userUUID);

  if (!user) {
    throw new Error("UserNotFoundException");
  }

  if (hasMadeRequestInLast5Minutes(user)) {
    user.requestsInLast5Minutes += 1;
    if (user.requestsInLast5Minutes > 10) {
      throw new Error("TooManyRequestsException");
    }
  } else {
    user.requestsInLast5Minutes = 1;
  }
  user.timeOfLastRequest = new Date().toISOString();

  await upsertUser(user);
  return true;
};

export const hasUserReachedCodeLimit = async (event) => {
  const userUUID = getUserUUID(event);

  const user = await getUserByUUID(userUUID);

  if (!user) {
    throw new Error("UserNotFoundException");
  }

  const urlsForUser = await getURLSForUser(userUUID);
  if (urlsForUser.length >= 10) {
    throw new Error("TooManyResourcesException");
  }
  return true;
};
