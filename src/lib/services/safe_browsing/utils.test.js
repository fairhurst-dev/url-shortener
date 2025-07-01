import { makeURLSafetyCheckInput } from "./utils.js";
import { describe, it, expect } from "vitest";

describe("makeURLSafetyCheckInput", () => {
  it("should create the correct input structure", () => {
    const url = "http://example.com";
    const expected = {
      auth: process.env.GOOGLE_CLOUD_TOKEN,
      requestBody: {
        threatInfo: {
          threatEntries: [{ url }],
        },
      },
    };
    const actual = makeURLSafetyCheckInput(url);
    expect(actual).toEqual(expected);
  });
});
