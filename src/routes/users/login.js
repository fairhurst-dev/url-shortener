import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { login } from "#lib/services/cognito/index.js";
import { userValidator } from "#lib/validators.js";
import {
  badRequest,
  handleCognitoError,
  bodyFormatter,
} from "#routes/utils.js";

const loginHandler = async (event) => {
  try {
    const { error, value } = userValidator(event.body);
    if (error) {
      return badRequest(error);
    }

    const resp = await login(value);

    return bodyFormatter(resp);
  } catch (error) {
    return handleCognitoError(error);
  }
};

export const handler = middyfy(loginHandler).use(httpJsonBodyParser());
