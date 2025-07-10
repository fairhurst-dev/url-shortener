import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { signup } from "#lib/services/cognito/index.js";
import { userValidator } from "#lib/validators.js";
import {
  badRequest,
  handleCognitoError,
  successResponse,
} from "#routes/utils.js";

const registerHandler = async (event) => {
  try {
    const { error, value } = userValidator(event.body);
    if (error) {
      return badRequest(error);
    }

    await signup(value);

    return successResponse();
  } catch (error) {
    return handleCognitoError(error);
  }
};

export const handler = middyfy(registerHandler).use(httpJsonBodyParser());
