import { describe, it, expect } from "vitest";
import {
  userValidator,
  confirmOTPValidator,
  refreshValidator,
  fullURLValidator,
} from "./validators.js";

describe("Validators", () => {
  describe("userValidator", () => {
    describe("valid inputs", () => {
      it("accepts valid email and password", () => {
        const validUser = {
          email: "test@example.com",
          password: "Password123!",
        };

        const result = userValidator(validUser);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validUser);
      });

      it("accepts password with different special characters", () => {
        const specialChars = [
          "!",
          "@",
          "#",
          "$",
          "%",
          "^",
          "&",
          "*",
          "(",
          ")",
          "_",
          "+",
          "-",
          "=",
          "[",
          "]",
          "{",
          "}",
          ";",
          "'",
          ":",
          '"',
          "\\",
          "|",
          ",",
          ".",
          "<",
          ">",
          "?",
          "`",
          "~",
        ];

        specialChars.forEach((char) => {
          const validUser = {
            email: "test@example.com",
            password: `Password1${char}`,
          };

          const result = userValidator(validUser);

          expect(result.error).toBeNull();
          expect(result.value).toEqual(validUser);
        });
      });

      it("strips unknown properties", () => {
        const userWithExtra = {
          email: "test@example.com",
          password: "Password123!",
          unknownField: "should be removed",
        };

        const result = userValidator(userWithExtra);

        expect(result.error).toBeNull();
        expect(result.value).toEqual({
          email: "test@example.com",
          password: "Password123!",
        });
      });
    });

    describe("invalid inputs", () => {
      it("rejects invalid email format", () => {
        const invalidUser = {
          email: "invalid-email",
          password: "Password123!",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain("must be a valid email");
        expect(result.value).toEqual(invalidUser);
      });

      it("rejects missing email", () => {
        const invalidUser = {
          password: "Password123!",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain('"email" is required');
        expect(result.value).toEqual(invalidUser);
      });

      it("rejects missing password", () => {
        const invalidUser = {
          email: "test@example.com",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain('"password" is required');
        expect(result.value).toEqual(invalidUser);
      });

      it("rejects password shorter than 8 characters", () => {
        const invalidUser = {
          email: "test@example.com",
          password: "Pass1!",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain("at least 8 characters");
        expect(result.value).toEqual(invalidUser);
      });

      it("rejects password longer than 16 characters", () => {
        const invalidUser = {
          email: "test@example.com",
          password: "VeryLongPassword123!",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain("less than or equal to 16 characters");
        expect(result.value).toEqual(invalidUser);
      });

      it("rejects password without special characters", () => {
        const invalidUser = {
          email: "test@example.com",
          password: "Password123",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain(
          "must contain at least one special character"
        );
        expect(result.value).toEqual(invalidUser);
      });
      it("rejects password without uppercase letters", () => {
        const invalidUser = {
          email: "test@example.com",
          password: "password123!",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain(
          "must contain at least one uppercase letter"
        );
        expect(result.value).toEqual(invalidUser);
      });
      it("rejects password without lowercase letters", () => {
        const invalidUser = {
          email: "test@example.com",
          password: "PASSWORD123!",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain(
          "must contain at least one lowercase letter"
        );
        expect(result.value).toEqual(invalidUser);
      });

      it("combines multiple validation errors", () => {
        const invalidUser = {
          email: "invalid-email",
          password: "short",
        };

        const result = userValidator(invalidUser);

        expect(result.error).toContain("must be a valid email");
        expect(result.error).toContain("at least 8 characters");
        expect(result.error).toContain(
          "must contain at least one special character"
        );
        expect(result.error).toContain(
          "must contain at least one uppercase letter"
        );
      });
    });
  });

  describe("confirmOTPValidator", () => {
    describe("valid inputs", () => {
      it("accepts valid email and OTP", () => {
        const validOTP = {
          email: "test@example.com",
          otp: "123456",
        };

        const result = confirmOTPValidator(validOTP);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validOTP);
      });

      it("strips unknown properties", () => {
        const otpWithExtra = {
          email: "test@example.com",
          otp: "123456",
          unknownField: "should be removed",
        };

        const result = confirmOTPValidator(otpWithExtra);

        expect(result.error).toBeNull();
        expect(result.value).toEqual({
          email: "test@example.com",
          otp: "123456",
        });
      });
    });

    describe("invalid inputs", () => {
      it("rejects invalid email format", () => {
        const invalidOTP = {
          email: "invalid-email",
          otp: "123456",
        };

        const result = confirmOTPValidator(invalidOTP);

        expect(result.error).toContain("must be a valid email");
        expect(result.value).toEqual(invalidOTP);
      });

      it("rejects missing email", () => {
        const invalidOTP = {
          otp: "123456",
        };

        const result = confirmOTPValidator(invalidOTP);

        expect(result.error).toContain('"email" is required');
        expect(result.value).toEqual(invalidOTP);
      });

      it("rejects missing OTP", () => {
        const invalidOTP = {
          email: "test@example.com",
        };

        const result = confirmOTPValidator(invalidOTP);

        expect(result.error).toContain('"otp" is required');
        expect(result.value).toEqual(invalidOTP);
      });

      it("rejects empty OTP", () => {
        const invalidOTP = {
          email: "test@example.com",
          otp: "",
        };

        const result = confirmOTPValidator(invalidOTP);

        expect(result.error).toContain("is not allowed to be empty");
        expect(result.value).toEqual(invalidOTP);
      });
    });
  });

  describe("refreshValidator", () => {
    describe("valid inputs", () => {
      it("accepts valid refresh token", () => {
        const validRefresh = {
          refreshToken: "valid-refresh-token",
        };

        const result = refreshValidator(validRefresh);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validRefresh);
      });

      it("accepts refresh token with optional device key", () => {
        const validRefresh = {
          refreshToken: "valid-refresh-token",
          deviceKey: "device-key-123",
        };

        const result = refreshValidator(validRefresh);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validRefresh);
      });

      it("strips unknown properties", () => {
        const refreshWithExtra = {
          refreshToken: "valid-refresh-token",
          deviceKey: "device-key-123",
          unknownField: "should be removed",
        };

        const result = refreshValidator(refreshWithExtra);

        expect(result.error).toBeNull();
        expect(result.value).toEqual({
          refreshToken: "valid-refresh-token",
          deviceKey: "device-key-123",
        });
      });
    });

    describe("invalid inputs", () => {
      it("rejects missing refresh token", () => {
        const invalidRefresh = {
          deviceKey: "device-key-123",
        };

        const result = refreshValidator(invalidRefresh);

        expect(result.error).toContain('"refreshToken" is required');
        expect(result.value).toEqual(invalidRefresh);
      });

      it("rejects empty refresh token", () => {
        const invalidRefresh = {
          refreshToken: "",
        };

        const result = refreshValidator(invalidRefresh);

        expect(result.error).toContain("is not allowed to be empty");
        expect(result.value).toEqual(invalidRefresh);
      });
    });
  });

  describe("fullURLValidator", () => {
    describe("valid inputs", () => {
      it("accepts valid HTTPS URL", () => {
        const validURL = {
          fullURL: "https://example.com",
        };

        const result = fullURLValidator(validURL);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validURL);
      });

      it("accepts valid HTTP URL", () => {
        const validURL = {
          fullURL: "http://example.com",
        };

        const result = fullURLValidator(validURL);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validURL);
      });

      it("accepts URL with path", () => {
        const validURL = {
          fullURL: "https://example.com/path/to/resource",
        };

        const result = fullURLValidator(validURL);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validURL);
      });

      it("accepts URL with query parameters", () => {
        const validURL = {
          fullURL: "https://example.com/search?q=test&page=1",
        };

        const result = fullURLValidator(validURL);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validURL);
      });

      it("accepts URL with fragment", () => {
        const validURL = {
          fullURL: "https://example.com/page#section",
        };

        const result = fullURLValidator(validURL);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(validURL);
      });

      it("strips unknown properties", () => {
        const urlWithExtra = {
          fullURL: "https://example.com",
          unknownField: "should be removed",
        };

        const result = fullURLValidator(urlWithExtra);

        expect(result.error).toBeNull();
        expect(result.value).toEqual({
          fullURL: "https://example.com",
        });
      });
    });

    describe("invalid inputs", () => {
      it("rejects missing URL", () => {
        const invalidURL = {};

        const result = fullURLValidator(invalidURL);

        expect(result.error).toContain('"fullURL" is required');
        expect(result.value).toEqual(invalidURL);
      });

      it("rejects empty URL", () => {
        const invalidURL = {
          fullURL: "",
        };

        const result = fullURLValidator(invalidURL);

        expect(result.error).toContain("is not allowed to be empty");
        expect(result.value).toEqual(invalidURL);
      });

      it("rejects invalid URL format", () => {
        const invalidURL = {
          fullURL: "not-a-url",
        };

        const result = fullURLValidator(invalidURL);

        expect(result.error).toContain("must be a valid uri");
        expect(result.value).toEqual(invalidURL);
      });

      it("rejects relative URLs", () => {
        const invalidURL = {
          fullURL: "/relative/path",
        };

        const result = fullURLValidator(invalidURL);

        expect(result.error).toContain("must be a valid uri");
        expect(result.value).toEqual(invalidURL);
      });

      it("rejects URLs with unsupported schemes", () => {
        const schemes = ["ftp", "file", "mailto", "tel"];

        schemes.forEach((scheme) => {
          const invalidURL = {
            fullURL: `${scheme}://example.com`,
          };

          const result = fullURLValidator(invalidURL);

          expect(result.error).toContain("must be a valid uri");
          expect(result.value).toEqual(invalidURL);
        });
      });
    });
  });

  describe("Edge cases and type conversion", () => {
    it("converts string numbers to strings in userValidator", () => {
      const userWithNumbers = {
        email: "test@example.com",
        password: "Password123!",
        extraNumber: 123,
      };

      const result = userValidator(userWithNumbers);

      expect(result.error).toBeNull();
      // Should strip unknown properties regardless of type
      expect(result.value).toEqual({
        email: "test@example.com",
        password: "Password123!",
      });
    });

    it("handles null and undefined values gracefully", () => {
      const nullUser = {
        email: null,
        password: undefined,
      };

      const result = userValidator(nullUser);

      expect(result.error).toContain("must be a string");
      expect(result.error).toContain("is required");
    });

    it("handles empty object input", () => {
      const result = userValidator({});

      expect(result.error).toContain('"email" is required');
      expect(result.error).toContain('"password" is required');
    });

    it("handles non-object input", () => {
      const result = userValidator("not an object");

      expect(result.error).toContain("must be of type object");
    });
  });
});
