import { map, pipe, prop, join, curry } from "ramda";
import {
  userSchema,
  confirmOTPSchema,
  refreshSchema,
  shortenURLSchema,
  updateURLSchema,
} from "#lib/schemas.js";

const joiDefaults = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

const formatError = pipe(prop("details"), map(prop("message")), join(", "));

const baseValidator = curry((schema, data) => {
  const { error, value } = schema.validate(data, joiDefaults);
  return {
    value,
    error: error ? formatError(error) : null,
  };
});

export const userValidator = baseValidator(userSchema);

export const confirmOTPValidator = baseValidator(confirmOTPSchema);

export const refreshValidator = baseValidator(refreshSchema);

export const shortenURLValidator = baseValidator(shortenURLSchema);

export const updateURLValidator = baseValidator(updateURLSchema);
