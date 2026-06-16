import { formatNumber, formatDuration, formatDate, formatRelativeDate } from '../lib/youtube';

describe('YouTube Utils', () => {
  describe('formatNumber', () => {
    it('formats numbers under 1000', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    it('formats numbers in thousands', () => {
      expect(formatNumber(1000)).toBe('1.0천');
      expect(formatNumber(1500)).toBe('1.5천');
      expect(formatNumber(9999)).toBe('10.0천');
    });

    it('formats numbers in ten thousands', () => {
      expect(formatNumber(10000)).toBe('1.0만');
      expect(formatNumber(15000)).toBe('1.5만');
      expect(formatNumber(99999)).toBe('10.0만');
    });

    it('formats numbers in hundred millions', () => {
      expect(formatNumber(100000000)).toBe('1.0억');
      expect(formatNumber(150000000)).toBe('1.5억');
    });

    it('handles string input', () => {
      expect(formatNumber('1000')).toBe('1.0천');
      expect(formatNumber('10000')).toBe('1.0만');
    });

    it('handles invalid input', () => {
      expect(formatNumber('invalid')).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatDuration('PT30S')).toBe('0:30');
      expect(formatDuration('PT59S')).toBe('0:59');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration('PT1M30S')).toBe('1:30');
      expect(formatDuration('PT10M30S')).toBe('10:30');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatDuration('PT1H30M15S')).toBe('1:30:15');
      expect(formatDuration('PT2H0M0S')).toBe('2:00:00');
    });

    it('handles invalid format', () => {
      expect(formatDuration('invalid')).toBe('0:00');
      expect(formatDuration('')).toBe('0:00');
    });
  });

  describe('formatDate', () => {
    it('formats date to Korean format', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toMatch(/\d{4}/);
    });
  });

  describe('formatRelativeDate', () => {
    it('returns today for current date', () => {
      const today = new Date().toISOString();
      expect(formatRelativeDate(today)).toBe('오늘');
    });

    it('returns yesterday for previous day', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      expect(formatRelativeDate(yesterday)).toBe('어제');
    });

    it('returns days ago for recent dates', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
      expect(formatRelativeDate(threeDaysAgo)).toBe('3일 전');
    });

    it('returns weeks ago for dates within a month', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      expect(formatRelativeDate(twoWeeksAgo)).toBe('2주 전');
    });
  });
});
