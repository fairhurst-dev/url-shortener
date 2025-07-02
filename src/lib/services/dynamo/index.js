import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import {
  makeGetUserInput,
  makeUpsertUserInput,
  makeGetURLSforUserInput,
  makeCreateShortCodeInput,
  makeAnalyticsEntryInput,
  shortCodeAccessor,
  makeIncrementAnalyticsInput,
  updateFullURLByShortCodeInput,
  makeCreateUserInput,
  makeGetCodesForURLInput,
  makeGetAnalyticsForCodeInput,
  extractDataFromResponse,
  makeGetAnalyticsForUserInput,
} from "./utils.js";
import { andThen, path, pipe } from "ramda";

const client = new DynamoDB({});
const docClient = DynamoDBDocument.from(client);

const get = (params) => docClient.get(params);
const put = (params) => docClient.put(params);
const remove = (params) => docClient.delete(params);
const query = (params) => docClient.query(params);
const update = (params) => docClient.update(params);

export const getUserByUUID = pipe(
  makeGetUserInput,
  get,
  andThen(path(["Item", "data"]))
);

export const createUser = pipe(makeCreateUserInput, put);
export const upsertUser = pipe(makeUpsertUserInput, put);

export const getURLSForUser = pipe(
  makeGetURLSforUserInput,
  query,
  andThen(extractDataFromResponse)
);

export const getCodesForURL = pipe(
  makeGetCodesForURLInput,
  query,
  andThen(extractDataFromResponse)
);

export const createShortCode = pipe(makeCreateShortCodeInput, put);

export const getShortCodeEntry = pipe(
  shortCodeAccessor,
  get,
  andThen(path(["Item", "data"]))
);

export const getFullURLByShortCode = pipe(
  shortCodeAccessor,
  get,
  andThen(path(["Item", "data", "fullURL"]))
);

export const deleteShortCode = pipe(shortCodeAccessor, remove);

export const updateFullURLByShortCode = pipe(
  updateFullURLByShortCodeInput,
  update,
  andThen(path(["Attributes", "data", "fullURL"]))
);

export const createAnalyticsEntry = pipe(makeAnalyticsEntryInput, put);

export const incrementAnalytics = pipe(makeIncrementAnalyticsInput, update);

export const getAnalyticsForCode = pipe(
  makeGetAnalyticsForCodeInput,
  get,
  andThen(path(["Item", "data"]))
);

export const getAnalyticsForUser = pipe(
  makeGetAnalyticsForUserInput,
  query,
  andThen(extractDataFromResponse)
);
