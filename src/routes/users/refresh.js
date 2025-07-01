import { middyfy } from "#lib/middleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { refresh } from "#lib/services/cognito.js";
import { refreshValidator } from "#lib/validators.js";
import {
  badRequest,
  handleCognitoError,
  bodyFormatter,
} from "#routes/utils.js";

const confirmHandler = async (event) => {
  try {
    const { error, value } = refreshValidator.validate(event.body);
    if (error) {
      return badRequest(error);
    }

    const resp = await refresh(value);

    return bodyFormatter(resp);
  } catch (error) {
    return handleCognitoError(error);
  }
};

export const handler = middyfy(confirmHandler).use(httpJsonBodyParser());
