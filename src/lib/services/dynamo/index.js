import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import {
  makeGetUserInput,
  makeUpsertUserInput,
  makeURLSforUserInput,
  makeCreateShortCodeInput,
  makeAnalyticsEntryInput,
  makeGetFullURLByShortCodeInput,
  makeIncrementAnalyticsInput,
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

export const upsertUser = pipe(makeUpsertUserInput, put);

export const getURLSForUser = pipe(
  makeURLSforUserInput,
  query,
  andThen(path(["Items"]))
);

export const createShortCode = pipe(makeCreateShortCodeInput, put);

export const getFullURLByShortCode = pipe(
  makeGetFullURLByShortCodeInput,
  get,
  andThen(path(["Item", "data", "fullURL"]))
);

export const createAnalyticsEntry = pipe(makeAnalyticsEntryInput, put);

export const incrementAnalytics = pipe(makeIncrementAnalyticsInput, update);
