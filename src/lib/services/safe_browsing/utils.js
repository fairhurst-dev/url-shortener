import { always, applySpec, identity } from "ramda";

export const makeURLSafetyCheckInput = applySpec({
  auth: always(process.env.GOOGLE_CLOUD_TOKEN),
  requestBody: {
    threatInfo: { threatEntries: [{ url: identity }] },
  },
});
