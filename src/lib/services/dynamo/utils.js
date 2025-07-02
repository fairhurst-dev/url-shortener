import {
  always,
  applySpec,
  assocPath,
  converge,
  identity,
  path,
  pipe,
  prop,
} from "ramda";

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

//queries
export const makeGetUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Key: {
    PK: identity,
  },
});

export const shortCodeAccessor = applySpec({
  TableName: always(process.env.URLS_TABLE),
  Key: {
    PK: identity,
  },
});

export const makeGetURLSforUserInput = applySpec({
  TableName: always(process.env.URLS_TABLE),
  KeyConditionExpression: "GSI2PK = :pk",
  IndexName: always("GSI2"),
  ExpressionAttributeValues: {
    ":pk": identity,
  },
});

export const makeGetAnalyticsForCodeInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Key: {
    PK: identity,
  },
});

export const makeGetCodesForURLInput = applySpec({
  TableName: always(process.env.URLS_TABLE),
  IndexName: "GSI1",
  KeyConditionExpression: "GSI1PK = :fullURL",
  ExpressionAttributeValues: {
    ":fullURL": identity,
  },
});

//records

//Users
export const makeCreateUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: prop("userUUID"),
    GSI1: always("#"),
    data: {
      userUUID: prop("userUUID"),
      requestsInLast5Minutes: always(0),
    },
  },
});

export const makeUpsertUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: prop("userUUID"),
    GSI1: always("#"),
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

export const updateFullURLByShortCodeInput = applySpec({
  TableName: always(process.env.URLS_TABLE),
  Key: {
    PK: prop("shortCode"),
  },
  UpdateExpression: "SET data.fullURL = :fullURL, GSI1PK = :fullURL",
  ExpressionAttributeValues: {
    ":fullURL": prop("fullURL"),
  },
  ReturnValues: "ALL_NEW",
  ConditionExpression: always("attribute_exists(PK)"),
});

//Analytics
export const makeAnalyticsEntryInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: prop("shortCode"),
    GSI1: prop("userUUID"),
    data: {
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
