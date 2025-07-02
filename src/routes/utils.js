import {
  always,
  applySpec,
  identity,
  cond,
  propEq,
  T,
  prop,
  pathOr,
} from "ramda";

const stringify = (input) => JSON.stringify(input);

export const handleError = (error) => {
  console.error(error);
  if (error.name === "TooManyRequestsException") {
    return tooManyRequests();
  }
  if (error.name === "UserNotFoundException") {
    return unauthorized();
  }
  if (error.name === "OwnershipCheckFailedException") {
    return unauthorized();
  }
  if (error.name === "TooManyResourcesException") {
    return tooManyResources();
  }
  if (error.name === "URLSafetyCheckFailedException") {
    return badRequest("This URL is not safe");
  }
  if (error.name === "EntryNotFoundException") {
    return notFound();
  } else {
    return defaultError();
  }
};

export const bodyFormatter = applySpec({
  statusCode: always(200),
  body: stringify,
});

export const successResponse = applySpec({
  statusCode: always(201),
});

export const badRequest = applySpec({
  statusCode: always(400),
  body: identity,
});

const unauthorized = applySpec({
  statusCode: always(401),
  body: always("UnauthorizedException"),
});

const tooManyResources = applySpec({
  statusCode: always(403),
  body: always("You have reached the limit of 10 short URLs."),
});

const notFound = applySpec({
  statusCode: always(404),
  body: always("Not Found"),
});

const tooManyRequests = applySpec({
  statusCode: always(429),
  body: always(
    "You have made too many requests in the last 5 minutes. Please try again later"
  ),
});

const defaultError = applySpec({
  statusCode: always(500),
  body: always("Internal server error"),
});

export const handleCognitoError = (error) => {
  console.error("Cognito error:", error);

  const getErrorConfig = cond([
    [
      propEq("UsernameExistsException", "name"),
      always({
        statusCode: 409,
        message: "User with this email already exists",
      }),
    ],
    [
      propEq("TooManyRequestsException", "name"),
      always({
        statusCode: 429,
        message: "Too many requests. Please try again later",
      }),
    ],
    [T, always({ statusCode: 500, message: "Internal server error" })],
  ]);

  const errorConfig = getErrorConfig(error);

  return applySpec({
    statusCode: always(errorConfig.statusCode),
    body: applySpec({
      error: pathOr("CognitoError", ["name"]),
      message: always(errorConfig.message),
      details: prop("message"),
    }),
  })(error);
};
