import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import {
  makeGetUsersInput,
  makeUpsertUserInput,
  makeURLSforUserInput,
  makeCreateShortCodeInput,
} from "./utils.js";
import { andThen, path, pipe } from "ramda";

const client = new DynamoDB({});
const docClient = DynamoDBDocument.from(client);

const get = (params) => docClient.get(params);
const put = (params) => docClient.put(params);
const remove = (params) => docClient.delete(params);
const query = (params) => docClient.query(params);

export const getUserByUUID = pipe(
  makeGetUsersInput,
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
