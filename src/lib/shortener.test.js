import { generateShortCode } from "./shortener.js";
import { describe, it, expect } from "vitest";

describe("generateShortCode", () => {
  it("should generate a short code of the correct length", () => {
    const fullURL = "https://example.com/some/long/url";
    const shortCode = generateShortCode(fullURL);
    console.log(shortCode);
    expect(shortCode).toHaveLength(6);
  });
});
