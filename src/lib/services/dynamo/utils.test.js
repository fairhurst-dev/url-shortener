import { describe, it, expect } from "vitest";
import { makeCreateShortCodeInput } from "./utils.js";

describe("Dynamodb utils", () => {
  it("makes createShortCode input ", () => {
    const actual = makeCreateShortCodeInput({
      userUUID: "test-user-uuid",
      shortCode: "abcdef",
      fullURL: "https://example.com",
    });
    expect(actual).toHaveProperty("TableName");
    expect(actual.Item.PK).toBe("abcdef");
    expect(actual.Item.GSI1PK).toBe("https://example.com");
    expect(actual.Item.GSI2PK).toBe("test-user-uuid");
    expect(actual.Item).toHaveProperty("ttl");
  });
});
