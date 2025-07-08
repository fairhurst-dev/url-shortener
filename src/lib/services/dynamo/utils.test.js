import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  extractDataFromResponse,
  makeGetUserInput,
  shortCodeAccessor,
  makeGetURLSforUserInput,
  makeGetAnalyticsForCodeInput,
  makeGetCodesForURLInput,
  makeGetAnalyticsForUserInput,
  makeCreateUserInput,
  makeUpsertUserInput,
  makeCreateShortCodeInput,
  updateFullURLByShortCodeInput,
  makeAnalyticsEntryInput,
  makeIncrementAnalyticsInput,
} from "./utils.js";

// Mock Date for consistent testing
const mockDate = new Date("2023-01-01T00:00:00.000Z");

describe("DynamoDB utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  describe("Helper functions", () => {
    describe("extractDataFromResponse", () => {
      it("extracts data from DynamoDB response with items", () => {
        const response = {
          Items: [
            { data: { id: 1, name: "item1" } },
            { data: { id: 2, name: "item2" } },
          ],
        };
        const result = extractDataFromResponse(response);
        expect(result).toEqual([
          { id: 1, name: "item1" },
          { id: 2, name: "item2" },
        ]);
      });

      it("returns empty array when Items is empty", () => {
        const response = { Items: [] };
        const result = extractDataFromResponse(response);
        expect(result).toEqual([]);
      });
    });
  });

  describe("Query builders", () => {
    describe("makeGetUserInput", () => {
      it("creates correct DynamoDB get user input", () => {
        const userUUID = "test-user-123";
        const result = makeGetUserInput(userUUID);

        expect(result).toEqual({
          TableName: process.env.ANALYTICS_TABLE,
          Key: {
            PK: userUUID,
          },
        });
      });
    });

    describe("shortCodeAccessor", () => {
      it("creates correct DynamoDB get item input for short code", () => {
        const shortCode = "abc123";
        const result = shortCodeAccessor(shortCode);

        expect(result).toEqual({
          TableName: process.env.URLS_TABLE,
          Key: {
            PK: shortCode,
          },
        });
      });
    });

    describe("makeGetURLSforUserInput", () => {
      it("creates correct DynamoDB query input for user URLs", () => {
        const userUUID = "test-user-123";
        const result = makeGetURLSforUserInput(userUUID);

        expect(result).toEqual({
          TableName: process.env.URLS_TABLE,
          KeyConditionExpression: "GSI2PK = :pk",
          IndexName: "GSI2",
          ExpressionAttributeValues: {
            ":pk": userUUID,
          },
        });
      });
    });

    describe("makeGetAnalyticsForCodeInput", () => {
      it("creates correct DynamoDB get analytics input", () => {
        const shortCode = "abc123";
        const result = makeGetAnalyticsForCodeInput(shortCode);

        expect(result).toEqual({
          TableName: process.env.ANALYTICS_TABLE,
          Key: {
            PK: shortCode,
          },
        });
      });
    });

    describe("makeGetCodesForURLInput", () => {
      it("creates correct DynamoDB query input for codes by URL", () => {
        const fullURL = "https://example.com";
        const result = makeGetCodesForURLInput(fullURL);

        expect(result).toEqual({
          TableName: process.env.URLS_TABLE,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :fullURL",
          ExpressionAttributeValues: {
            ":fullURL": fullURL,
          },
        });
      });
    });

    describe("makeGetAnalyticsForUserInput", () => {
      it("creates correct DynamoDB query input for user analytics", () => {
        const userUUID = "test-user-123";
        const result = makeGetAnalyticsForUserInput(userUUID);

        expect(result).toEqual({
          TableName: process.env.ANALYTICS_TABLE,
          KeyConditionExpression: "GSI1PK = :userUUID",
          ExpressionAttributeValues: {
            ":userUUID": userUUID,
          },
          IndexName: "GSI1",
        });
      });
    });
  });

  describe("Record builders", () => {
    describe("User records", () => {
      describe("makeCreateUserInput", () => {
        it("creates correct DynamoDB put user input", () => {
          const userUUID = "test-user-123";
          const result = makeCreateUserInput({ userUUID });

          expect(result).toEqual({
            TableName: process.env.ANALYTICS_TABLE,
            Item: {
              PK: userUUID,
              GSI1PK: userUUID,
              data: {
                userUUID,
                requestsInLast5Minutes: 0,
              },
            },
          });
        });
      });

      describe("makeUpsertUserInput", () => {
        it("creates correct DynamoDB upsert user input", () => {
          const userData = {
            userUUID: "test-user-123",
            requestsInLast5Minutes: 5,
            timeOfLastRequest: "2023-01-01T00:00:00.000Z",
          };
          const result = makeUpsertUserInput(userData);

          expect(result).toEqual({
            TableName: process.env.ANALYTICS_TABLE,
            Item: {
              PK: userData.userUUID,
              GSI1PK: userData.userUUID,
              data: {
                userUUID: userData.userUUID,
                requestsInLast5Minutes: userData.requestsInLast5Minutes,
                timeOfLastRequest: userData.timeOfLastRequest,
              },
            },
          });
        });
      });
    });

    describe("URL records", () => {
      describe("makeCreateShortCodeInput", () => {
        it("creates correct DynamoDB put short code input with TTL", () => {
          const shortCodeData = {
            userUUID: "test-user-uuid",
            shortCode: "abcdef",
            fullURL: "https://example.com",
          };
          const result = makeCreateShortCodeInput(shortCodeData);

          expect(result).toHaveProperty("TableName", process.env.URLS_TABLE);
          expect(result).toHaveProperty(
            "ConditionExpression",
            "attribute_not_exists(PK)"
          );
          expect(result.Item.PK).toBe("abcdef");
          expect(result.Item.GSI1PK).toBe("https://example.com");
          expect(result.Item.GSI2PK).toBe("test-user-uuid");
          expect(result.Item).toHaveProperty("ttl");
          expect(result.Item.data).toEqual({
            fullURL: "https://example.com",
            shortCode: "abcdef",
            createdAt: mockDate.toISOString(),
            userUUID: "test-user-uuid",
            ttlString: expect.any(String),
          });

          // Verify TTL is set correctly (1 year from now)
          const expectedTTL = new Date(mockDate);
          expectedTTL.setFullYear(expectedTTL.getFullYear() + 1);
          expect(result.Item.data.ttlString).toBe(expectedTTL.toISOString());
        });
      });

      describe("updateFullURLByShortCodeInput", () => {
        it("creates correct DynamoDB update input for URL", () => {
          const updateData = {
            shortCode: "abc123",
            fullURL: "https://updated-example.com",
          };
          const result = updateFullURLByShortCodeInput(updateData);

          expect(result).toEqual({
            TableName: process.env.URLS_TABLE,
            Key: {
              PK: "abc123",
            },
            UpdateExpression:
              "SET #data.#fullURL = :fullURL, GSI1PK = :fullURL",
            ExpressionAttributeNames: {
              "#data": "data",
              "#fullURL": "fullURL",
            },
            ExpressionAttributeValues: {
              ":fullURL": "https://updated-example.com",
            },
            ReturnValues: "ALL_NEW",
            ConditionExpression: "attribute_exists(PK)",
          });
        });
      });
    });

    describe("Analytics records", () => {
      describe("makeAnalyticsEntryInput", () => {
        it("creates correct DynamoDB put analytics input", () => {
          const analyticsData = {
            shortCode: "abc123",
            userUUID: "test-user-123",
            ttlString: "2024-01-01T00:00:00.000Z",
          };
          const result = makeAnalyticsEntryInput(analyticsData);

          expect(result).toEqual({
            TableName: process.env.ANALYTICS_TABLE,
            Item: {
              PK: "abc123",
              GSI1PK: "test-user-123",
              data: {
                shortCode: "abc123",
                userUUID: "test-user-123",
                totalClicks: 0,
                timeStampLastAccessed: null,
                createdAt: mockDate.toISOString(),
                ttlString: "2024-01-01T00:00:00.000Z",
              },
            },
            ConditionExpression: "attribute_not_exists(PK)",
          });
        });
      });

      describe("makeIncrementAnalyticsInput", () => {
        it("creates correct DynamoDB update input for analytics increment", () => {
          const shortCode = "abc123";
          const result = makeIncrementAnalyticsInput(shortCode);

          expect(result).toEqual({
            TableName: process.env.ANALYTICS_TABLE,
            Key: {
              PK: shortCode,
            },
            UpdateExpression:
              "SET #data.#totalClicks = #data.#totalClicks + :increment, #data.#timeStampLastAccessed = :now",
            ExpressionAttributeNames: {
              "#data": "data",
              "#totalClicks": "totalClicks",
              "#timeStampLastAccessed": "timeStampLastAccessed",
            },
            ExpressionAttributeValues: {
              ":increment": 1,
              ":now": mockDate.toISOString(),
            },
          });
        });
      });
    });
  });

  describe("Edge cases and error handling", () => {
    it("handles missing properties gracefully in makeCreateShortCodeInput", () => {
      const incompleteData = {
        shortCode: "abc123",
        // Missing userUUID and fullURL
      };
      const result = makeCreateShortCodeInput(incompleteData);

      expect(result.Item.PK).toBe("abc123");
      expect(result.Item.GSI1PK).toBeUndefined();
      expect(result.Item.GSI2PK).toBeUndefined();
      expect(result.Item.data.userUUID).toBeUndefined();
      expect(result.Item.data.fullURL).toBeUndefined();
    });

    it("handles missing properties gracefully in makeUpsertUserInput", () => {
      const incompleteData = {
        userUUID: "test-user-123",
        // Missing other properties
      };
      const result = makeUpsertUserInput(incompleteData);

      expect(result.Item.PK).toBe("test-user-123");
      expect(result.Item.data.userUUID).toBe("test-user-123");
      expect(result.Item.data.requestsInLast5Minutes).toBeUndefined();
      expect(result.Item.data.timeOfLastRequest).toBeUndefined();
    });
  });
});
