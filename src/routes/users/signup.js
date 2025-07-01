import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { signup } from "#lib/services/cognito.js";
import { userValidator } from "#lib/validators.js";
import {
  badRequest,
  handleCognitoError,
  successResponse,
} from "#routes/utils.js";

const signupHandler = async (event) => {
  try {
    const { error, value } = userValidator.validate(event.body);
    if (error) {
      return badRequest(error);
    }

    await signup(value);

    return successResponse();
  } catch (error) {
    return handleCognitoError(error);
  }
};

export const handler = middyfy(signupHandler).use(httpJsonBodyParser());
