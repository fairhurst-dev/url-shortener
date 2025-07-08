import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  handleError,
  bodyFormatter,
  successResponse,
  badRequest,
  notFound,
  handleCognitoError,
} from './utils.js';

describe('routes/utils', () => {
  describe('handleError', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should handle TooManyRequestsException', () => {
      const error = { message: 'TooManyRequestsException' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 429,
        body: 'You have made too many requests in the last 5 minutes. Please try again later'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle UserNotFoundException', () => {
      const error = { message: 'UserNotFoundException' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 401,
        body: 'UnauthorizedException'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle OwnershipCheckFailedException', () => {
      const error = { message: 'OwnershipCheckFailedException' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 401,
        body: 'UnauthorizedException'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle TooManyResourcesException', () => {
      const error = { message: 'TooManyResourcesException' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 403,
        body: 'You have reached the limit of 10 short URLs.'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle URLSafetyCheckFailedException', () => {
      const error = { message: 'URLSafetyCheckFailedException' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 400,
        body: 'This URL is not safe'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle EntryNotFoundException', () => {
      const error = { message: 'EntryNotFoundException' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 404,
        body: 'Not Found'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle unknown errors with default error response', () => {
      const error = { message: 'SomeUnknownError' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 500,
        body: 'Internal server error'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle errors without a message property', () => {
      const error = { name: 'SomeError' };
      const result = handleError(error);
      
      expect(result).toEqual({
        statusCode: 500,
        body: 'Internal server error'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle null error', () => {
      const result = handleError(null);
      
      expect(result).toEqual({
        statusCode: 500,
        body: 'Internal server error'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('bodyFormatter', () => {
    it('should format response with statusCode 200 and stringified body', () => {
      const input = { message: 'success', data: [1, 2, 3] };
      const result = bodyFormatter(input);
      
      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(input)
      });
    });

    it('should handle null input', () => {
      const result = bodyFormatter(null);
      
      expect(result).toEqual({
        statusCode: 200,
        body: 'null'
      });
    });

    it('should handle undefined input', () => {
      const result = bodyFormatter(undefined);
      
      expect(result).toEqual({
        statusCode: 200,
        body: undefined
      });
    });

    it('should handle string input', () => {
      const input = 'test string';
      const result = bodyFormatter(input);
      
      expect(result).toEqual({
        statusCode: 200,
        body: '"test string"'
      });
    });

    it('should handle number input', () => {
      const input = 42;
      const result = bodyFormatter(input);
      
      expect(result).toEqual({
        statusCode: 200,
        body: '42'
      });
    });

    it('should handle array input', () => {
      const input = [1, 'test', { key: 'value' }];
      const result = bodyFormatter(input);
      
      expect(result).toEqual({
        statusCode: 200,
        body: '[1,"test",{"key":"value"}]'
      });
    });
  });

  describe('successResponse', () => {
    it('should return statusCode 201', () => {
      const result = successResponse('any input');
      
      expect(result).toEqual({
        statusCode: 201
      });
    });

    it('should return statusCode 201 regardless of input', () => {
      const result1 = successResponse();
      const result2 = successResponse(null);
      const result3 = successResponse({ data: 'test' });
      
      expect(result1).toEqual({ statusCode: 201 });
      expect(result2).toEqual({ statusCode: 201 });
      expect(result3).toEqual({ statusCode: 201 });
    });
  });

  describe('badRequest', () => {
    it('should return statusCode 400 with the provided message', () => {
      const message = 'Invalid input';
      const result = badRequest(message);
      
      expect(result).toEqual({
        statusCode: 400,
        body: message
      });
    });

    it('should handle null message', () => {
      const result = badRequest(null);
      
      expect(result).toEqual({
        statusCode: 400,
        body: null
      });
    });

    it('should handle undefined message', () => {
      const result = badRequest(undefined);
      
      expect(result).toEqual({
        statusCode: 400,
        body: undefined
      });
    });

    it('should handle object message', () => {
      const message = { error: 'validation failed', field: 'email' };
      const result = badRequest(message);
      
      expect(result).toEqual({
        statusCode: 400,
        body: message
      });
    });
  });

  describe('notFound', () => {
    it('should return statusCode 404 with "Not Found" message', () => {
      const result = notFound('any input');
      
      expect(result).toEqual({
        statusCode: 404,
        body: 'Not Found'
      });
    });

    it('should return the same response regardless of input', () => {
      const result1 = notFound();
      const result2 = notFound(null);
      const result3 = notFound({ data: 'test' });
      
      expect(result1).toEqual({ statusCode: 404, body: 'Not Found' });
      expect(result2).toEqual({ statusCode: 404, body: 'Not Found' });
      expect(result3).toEqual({ statusCode: 404, body: 'Not Found' });
    });
  });

  describe('handleCognitoError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('should handle UsernameExistsException', () => {
      const error = {
        name: 'UsernameExistsException',
        message: 'User already exists'
      };
      const result = handleCognitoError(error);
      
      expect(result).toEqual({
        statusCode: 409,
        body: {
          error: 'UsernameExistsException',
          message: 'User with this email already exists',
          details: 'User already exists'
        }
      });
      expect(console.error).toHaveBeenCalledWith('Cognito error:', error);
    });

    it('should handle TooManyRequestsException', () => {
      const error = {
        name: 'TooManyRequestsException',
        message: 'Too many requests made'
      };
      const result = handleCognitoError(error);
      
      expect(result).toEqual({
        statusCode: 429,
        body: {
          error: 'TooManyRequestsException',
          message: 'Too many requests. Please try again later',
          details: 'Too many requests made'
        }
      });
      expect(console.error).toHaveBeenCalledWith('Cognito error:', error);
    });

    it('should handle unknown Cognito errors', () => {
      const error = {
        name: 'SomeUnknownCognitoError',
        message: 'Unknown error occurred'
      };
      const result = handleCognitoError(error);
      
      expect(result).toEqual({
        statusCode: 500,
        body: {
          error: 'SomeUnknownCognitoError',
          message: 'Internal server error',
          details: 'Unknown error occurred'
        }
      });
      expect(console.error).toHaveBeenCalledWith('Cognito error:', error);
    });

    it('should handle errors without a name property', () => {
      const error = {
        message: 'Some error message'
      };
      const result = handleCognitoError(error);
      
      expect(result).toEqual({
        statusCode: 500,
        body: {
          error: 'CognitoError',
          message: 'Internal server error',
          details: 'Some error message'
        }
      });
      expect(console.error).toHaveBeenCalledWith('Cognito error:', error);
    });

    it('should handle errors without a message property', () => {
      const error = {
        name: 'SomeError'
      };
      const result = handleCognitoError(error);
      
      expect(result).toEqual({
        statusCode: 500,
        body: {
          error: 'SomeError',
          message: 'Internal server error',
          details: undefined
        }
      });
      expect(console.error).toHaveBeenCalledWith('Cognito error:', error);
    });

    it('should handle null error', () => {
      const result = handleCognitoError(null);
      
      expect(result).toEqual({
        statusCode: 500,
        body: {
          error: 'CognitoError',
          message: 'Internal server error',
          details: undefined
        }
      });
      expect(console.error).toHaveBeenCalledWith('Cognito error:', null);
    });
  });
});
