import { applySpec, prop, always } from "ramda";

export const authRespForClient = prop("AuthenticationResult");

const makeUserAttrs = (input) => [{ Name: "email", Value: input.email }];

export const makeSignupInput = applySpec({
  ClientId: always(process.env.USER_POOL_CLIENT_ID),
  Username: prop("email"),
  Password: prop("password"),
  UserAttributes: makeUserAttrs,
});

export const makeLoginInput = applySpec({
  AuthFlow: always("USER_PASSWORD_AUTH"),
  ClientId: always(process.env.USER_POOL_CLIENT_ID),
  UserPoolId: always(process.env.USER_POOL_ID),
  AuthParameters: applySpec({
    USERNAME: prop("email"),
    PASSWORD: prop("password"),
  }),
});

export const makeRefreshInput = applySpec({
  AuthFlow: always("REFRESH_TOKEN_AUTH"),
  ClientId: always(process.env.USER_POOL_CLIENT_ID),
  AuthParameters: applySpec({
    REFRESH_TOKEN: prop("refreshToken"),
  }),
});

export const makeConfirmSignupInput = applySpec({
  ClientId: always(process.env.USER_POOL_CLIENT_ID),
  Username: prop("email"),
  ConfirmationCode: prop("otp"),
});

export const makeAdminGetUserInput = applySpec({
  UserPoolId: always(process.env.USER_POOL_ID),
  Username: prop("email"),
});
