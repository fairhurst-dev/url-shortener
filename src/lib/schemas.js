import Joi from "joi";

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(16)
    .required()
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?`~]/)
    .message('"password" must contain at least one special character'),
});

export const confirmOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
  deviceKey: Joi.string().optional(),
});

export const shortenURLSchema = Joi.object({
  fullURL: Joi.string()
    .uri({
      scheme: ["https", "http"],
      allowRelative: false,
      relativeOnly: false,
    })
    .required(),
});
