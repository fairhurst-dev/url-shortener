import {
  always,
  applySpec,
  assocPath,
  concat,
  converge,
  identity,
  path,
  pipe,
  prop,
} from "ramda";

//constants
const USER_PREFIX = "#USER#";
const ANALYTICS_PREFIX = "#ANALYTICS#";

//helpers

const makeTTL = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
};

const convertTTLToSeconds = pipe(
  path(["Item", "data", "ttlString"]),
  (ttlString) => Math.floor(new Date(ttlString).getTime() / 1000)
);

const decorateTTLForDDB = converge(assocPath(["Item", "ttl"]), [
  convertTTLToSeconds,
  identity,
]);

//keys

const makeUserKey = pipe(prop("userUUID"), concat(USER_PREFIX));
const makeAnalyticsCodeKey = pipe(prop("shortCode"), concat(ANALYTICS_PREFIX));

//queries
export const makeGetUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Key: {
    PK: makeUserKey,
  },
});

export const makeURLSforUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  KeyConditionExpression: "PK = :pk",
  IndexName: "GSI1",
  ExpressionAttributeValues: {
    ":pk": makeUserKey,
  },
});

//records

//Users
export const makeCreateUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: makeUserKey,
    GSI1: makeUserKey,
    data: {
      userUUID: prop("userUUID"),
      requestsInLast5Minutes: always(0),
    },
  },
});

export const makeUpsertUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: makeUserKey,
    GSI1: makeUserKey,
    data: {
      userUUID: prop("userUUID"),
      requestsInLast5Minutes: prop("requestsInLast5Minutes"),
      timeOfLastRequest: prop("timeOfLastRequest"),
    },
  },
});

//URLs
export const makeCreateShortCodeInput = pipe(
  applySpec({
    TableName: always(process.env.URLS_TABLE),
    Item: {
      PK: prop("shortCode"),
      GSI1PK: prop("fullURL"),
      GSI2PK: prop("userUUID"),
      data: {
        fullURL: prop("fullURL"),
        shortCode: prop("shortCode"),
        createdAt: () => new Date().toISOString(),
        userUUID: prop("userUUID"),
        ttlString: makeTTL,
      },
    },
    ConditionExpression: always("attribute_not_exists(PK)"),
  }),
  decorateTTLForDDB
);

export const makeGetFullURLByShortCodeInput = applySpec({
  TableName: always(process.env.URLS_TABLE),
  Key: {
    PK: identity,
  },
});

//Analytics
export const makeAnalyticsEntryInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: makeAnalyticsCodeKey,
    GSI1: makeUserKey,
    data: {
      fullURL: prop("fullURL"),
      shortCode: prop("shortCode"),
      userUUID: prop("userUUID"),
      totalClicks: always(0),
      timeStampLastAccessed: always(null),
      createdAt: () => new Date().toISOString(),
    },
  },
  ConditionExpression: always("attribute_not_exists(PK)"),
});

export const makeIncrementAnalyticsInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Key: {
    PK: makeAnalyticsCodeKey,
  },
  UpdateExpression:
    "SET totalClicks = totalClicks + :increment, timeStampLastAccessed = :now",
  ExpressionAttributeValues: {
    ":increment": 1,
    ":now": new Date().toISOString(),
  },
});
