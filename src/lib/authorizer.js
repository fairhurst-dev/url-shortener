import {
  getURLSForUser,
  upsertUser,
  getShortCodeEntry,
} from "#lib/services/dynamo/index.js";
import { ifElse, isNil, pipe, path, always, identity } from "ramda";

export const getUserUUID = pipe(
  path(["requestContext", "authorizer", "jwt", "claims", "username"]),
  ifElse(
    isNil,
    always(() => {
      throw new Error("UserNotFoundException");
    }),
    identity
  )
);

const hasMadeRequestInLast5Minutes = (user) => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  return (
    user.timeOfLastRequest > fiveMinutesAgo && user.timeOfLastRequest <= now
  );
};

export const hasUserReachedRequestLimit = async (user) => {
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

export const hasUserReachedCodeLimit = async (user) => {
  if (!user) {
    throw new Error("UserNotFoundException");
  }

  const urlsForUser = await getURLSForUser(user.userUUID);
  if (urlsForUser.length >= 10) {
    throw new Error("TooManyResourcesException");
  }
  return true;
};

export const doesUserOwnShortCode = async ({ user, shortCode }) => {
  const shortCodeEntry = await getShortCodeEntry(shortCode);

  if (!shortCodeEntry) {
    throw new Error("EntryNotFoundException");
  }

  if (shortCodeEntry.userUUID !== user.userUUID) {
    throw new Error("OwnershipCheckFailedException");
  }
  return true;
};
