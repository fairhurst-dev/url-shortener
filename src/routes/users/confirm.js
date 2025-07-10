import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { confirmSignUp, getCognitoUser } from "#lib/services/cognito/index.js";
import { confirmOTPValidator } from "#lib/validators.js";
import {
  badRequest,
  handleCognitoError,
  successResponse,
} from "#routes/utils.js";
import { createUser } from "#lib/services/dynamo/index.js";

const confirmHandler = async (event) => {
  try {
    const { error, value } = confirmOTPValidator(event.body);
    if (error) {
      return badRequest(error);
    }

    await confirmSignUp(value);

    const cognitoUser = await getCognitoUser(value);

    await createUser({ userUUID: cognitoUser.Username });

    return successResponse();
  } catch (error) {
    return handleCognitoError(error);
  }
};

export const handler = middyfy(confirmHandler).use(httpJsonBodyParser());
