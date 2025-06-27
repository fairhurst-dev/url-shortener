import {
  authRespForClient,
  makeSignupInput,
  makeLoginInput,
  makeRefreshInput,
  makeConfirmSignupInput,
} from "./utils.js";
import { LOGIN_COGNITO_RESP } from "#lib/samples.js";
import { describe, it, expect } from "vitest";

describe("transformers", () => {
  it("transforms login resp for client", () => {
    const actual = authRespForClient(LOGIN_COGNITO_RESP);
    expect(actual).toEqual({
      AccessToken: "eyJra456defEXAMPLE",
      ExpiresIn: 3600,
      IdToken: "eyJra789ghiEXAMPLE",
      TokenType: "Bearer",
    });
  });

  it("makes signup input", () => {
    const input = { email: "test@example.com", password: "password123" };
    const actual = makeSignupInput(input);
    expect(actual).toEqual({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: "test@example.com",
      Password: "password123",
      UserAttributes: [{ Name: "email", Value: "test@example.com" }],
    });
  });

  it("makes login input", () => {
    const input = { email: "test@example.com", password: "password123" };
    const actual = makeLoginInput(input);
    expect(actual).toEqual({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.USER_POOL_CLIENT_ID,
      UserPoolId: process.env.USER_POOL_ID,
      AuthParameters: {
        USERNAME: "test@example.com",
        PASSWORD: "password123",
      },
    });
  });

  it("makes refresh input", () => {
    const input = { refreshToken: "some-refresh-token" };
    const actual = makeRefreshInput(input);
    expect(actual).toEqual({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: "some-refresh-token",
      },
    });
  });

  it("makes confirm signup input", () => {
    const input = { email: "test@example.com", otp: "123456" };
    const actual = makeConfirmSignupInput(input);
    expect(actual).toEqual({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: "test@example.com",
      ConfirmationCode: "123456",
    });
  });
});
