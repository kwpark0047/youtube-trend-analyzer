import { validateApiKey, validateRegionCode, validateMaxResults, ApiError, YouTubeApiError, ValidationError } from '../lib/errors';

describe('Error Utils', () => {
  describe('validateApiKey', () => {
    it('does not throw for valid API key', () => {
      expect(() => validateApiKey('valid-api-key-12345')).not.toThrow();
    });

    it('throws for null API key', () => {
      expect(() => validateApiKey(null)).toThrow('API 키가 필요합니다.');
    });

    it('throws for empty API key', () => {
      expect(() => validateApiKey('')).toThrow('API 키가 필요합니다.');
    });

    it('throws for short API key', () => {
      expect(() => validateApiKey('short')).toThrow('API 키가 유효하지 않습니다.');
    });
  });

  describe('validateRegionCode', () => {
    it('returns true for valid region codes', () => {
      expect(validateRegionCode('KR')).toBe(true);
      expect(validateRegionCode('US')).toBe(true);
      expect(validateRegionCode('JP')).toBe(true);
    });

    it('returns false for invalid region codes', () => {
      expect(validateRegionCode('XX')).toBe(false);
      expect(validateRegionCode('')).toBe(false);
      expect(validateRegionCode('korea')).toBe(false);
    });
  });

  describe('validateMaxResults', () => {
    it('returns default value for null input', () => {
      expect(validateMaxResults(null)).toBe(100);
    });

    it('parses valid number', () => {
      expect(validateMaxResults('50')).toBe(50);
      expect(validateMaxResults('100')).toBe(100);
    });

    it('caps at max value', () => {
      expect(validateMaxResults('200', 100)).toBe(100);
      expect(validateMaxResults('50', 30)).toBe(30);
    });

    it('returns default for invalid input', () => {
      expect(validateMaxResults('invalid')).toBe(100);
      expect(validateMaxResults('0')).toBe(100);
      expect(validateMaxResults('-1')).toBe(100);
    });
  });

  describe('Error Classes', () => {
    it('creates ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400, 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('creates YouTubeApiError with quota exceeded flag', () => {
      const error = new YouTubeApiError('Quota exceeded', true);
      expect(error.message).toBe('Quota exceeded');
      expect(error.quotaExceeded).toBe(true);
      expect(error.code).toBe('YOUTUBE_API_ERROR');
    });

    it('creates ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });
});
