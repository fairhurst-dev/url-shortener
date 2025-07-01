import {
  always,
  applySpec,
  assocPath,
  converge,
  evolve,
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
export const makeGetUsersInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Key: {
    PK: identity,
    SK: always("#"),
  },
});

export const makeURLSforUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
  ExpressionAttributeValues: {
    ":pk": identity,
    ":sk": always("CODE#"),
  },
});

//records
export const makeCreateUserInput = applySpec({
  TableName: always(process.env.ANALYTICS_TABLE),
  Item: {
    PK: prop("userUUID"),
    SK: always("#"),
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
    SK: always("#"),
    data: {
      userUUID: prop("userUUID"),
      requestsInLast5Minutes: prop("requestsInLast5Minutes"),
      timeOfLastRequest: prop("timeOfLastRequest"),
    },
  },
});

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
