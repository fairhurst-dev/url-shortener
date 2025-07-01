import { andThen, pipe } from "ramda";
import {
  SignUpCommand,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  authRespForClient,
  makeSignupInput,
  makeLoginInput,
  makeRefreshInput,
  makeConfirmSignupInput,
} from "./utils.js";

const cognitoClient = new CognitoIdentityProviderClient({});

const send = async (cmd) => cognitoClient.send(cmd);

const signUpCommand = (opts) => new SignUpCommand(opts);
const initiateAuthCommand = (opts) => new InitiateAuthCommand(opts);
const confirmSignUpCommand = (opts) => new ConfirmSignUpCommand(opts);

export const signup = pipe(makeSignupInput, signUpCommand, send);

export const login = pipe(
  makeLoginInput,
  initiateAuthCommand,
  send,
  andThen(authRespForClient)
);

export const refresh = pipe(
  makeRefreshInput,
  initiateAuthCommand,
  send,
  andThen(authRespForClient)
);

export const confirmSignUp = pipe(
  makeConfirmSignupInput,
  confirmSignUpCommand,
  send
);
