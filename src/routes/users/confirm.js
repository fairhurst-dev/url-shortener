import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { confirmSignUp } from "#lib/services/cognito.js";
import { confirmOTPValidator } from "#lib/validators.js";
import {
  badRequest,
  handleCognitoError,
  successResponse,
} from "#routes/utils.js";

const confirmHandler = async (event) => {
  try {
    const { error, value } = confirmOTPValidator.validate(event.body);
    if (error) {
      return badRequest({
        error,
      });
    }

    await confirmSignUp(value);

    return successResponse();
  } catch (error) {
    return handleCognitoError(error);
  }
};

export const handler = middyfy(confirmHandler).use(httpJsonBodyParser());
