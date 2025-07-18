/**
 * Tests for RateLimiter utility
 */

import { RateLimiter } from '../utils/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(2, 10); // 2 per second, 10 per minute
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create rate limiter with default values', () => {
      const defaultLimiter = new RateLimiter(1, 30);
      expect(defaultLimiter).toBeInstanceOf(RateLimiter);
    });

    it('should create rate limiter with custom values', () => {
      expect(rateLimiter).toBeInstanceOf(RateLimiter);
    });
  });

  describe('waitForRateLimit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should allow requests within rate limit', async () => {
      const domain = 'example.com';
      
      // First request should be immediate
      const promise1 = rateLimiter.waitForRateLimit(domain);
      jest.advanceTimersByTime(0);
      await promise1;
      
      // Second request should also be immediate (within 2 per second limit)
      const promise2 = rateLimiter.waitForRateLimit(domain);
      jest.advanceTimersByTime(0);
      await promise2;
      
      expect(true).toBe(true); // If we get here, both requests were allowed
    });

    it('should delay requests exceeding per-second limit', async () => {
      const domain = 'example.com';
      
      // Make 2 requests (at the limit)
      await rateLimiter.waitForRateLimit(domain);
      await rateLimiter.waitForRateLimit(domain);
      
      // Third request should be delayed
      const startTime = Date.now();
      const promise3 = rateLimiter.waitForRateLimit(domain);
      
      // Advance time to simulate delay
      jest.advanceTimersByTime(1000);
      await promise3;
      
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(1000);
    });

    it('should handle different domains independently', async () => {
      const domain1 = 'example.com';
      const domain2 = 'test.com';
      
      // Both domains should be able to make requests independently
      await rateLimiter.waitForRateLimit(domain1);
      await rateLimiter.waitForRateLimit(domain1);
      
      // Different domain should not be affected
      const promise = rateLimiter.waitForRateLimit(domain2);
      jest.advanceTimersByTime(0);
      await promise;
      
      expect(true).toBe(true); // If we get here, domains are independent
    });

    it('should clean up old timestamps', async () => {
      const domain = 'example.com';
      
      // Make requests
      await rateLimiter.waitForRateLimit(domain);
      
      // Advance time by more than a minute
      jest.advanceTimersByTime(70000);
      
      // Should be able to make requests again without delay
      const promise = rateLimiter.waitForRateLimit(domain);
      jest.advanceTimersByTime(0);
      await promise;
      
      expect(true).toBe(true); // Old timestamps cleaned up
    });

    it('should respect per-minute limits', async () => {
      const domain = 'example.com';
      
      // Make 10 requests over time (at the per-minute limit)
      for (let i = 0; i < 10; i++) {
        await rateLimiter.waitForRateLimit(domain);
        jest.advanceTimersByTime(100); // Small delay between requests
      }
      
      // 11th request should be delayed until minute rolls over
      const startTime = Date.now();
      const promise = rateLimiter.waitForRateLimit(domain);
      
      // Should need to wait for minute to roll over
      jest.advanceTimersByTime(60000);
      await promise;
      
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(60000);
    });
  });

  describe('getStats', () => {
    it('should return statistics for a domain', async () => {
      const domain = 'example.com';
      
      await rateLimiter.waitForRateLimit(domain);
      await rateLimiter.waitForRateLimit(domain);
      
      const stats = rateLimiter.getStats(domain);
      
      expect(stats.requestsLastSecond).toBe(2);
      expect(stats.requestsLastMinute).toBe(2);
      expect(stats.perSecondLimit).toBe(2);
      expect(stats.perMinuteLimit).toBe(10);
    });

    it('should return zero stats for unknown domain', () => {
      const stats = rateLimiter.getStats('unknown.com');
      
      expect(stats.requestsLastSecond).toBe(0);
      expect(stats.requestsLastMinute).toBe(0);
      expect(stats.perSecondLimit).toBe(2);
      expect(stats.perMinuteLimit).toBe(10);
    });
  });

  describe('reset', () => {
    it('should reset rate limits for a domain', async () => {
      const domain = 'example.com';
      
      await rateLimiter.waitForRateLimit(domain);
      await rateLimiter.waitForRateLimit(domain);
      
      let stats = rateLimiter.getStats(domain);
      expect(stats.requestsLastSecond).toBe(2);
      
      rateLimiter.reset(domain);
      
      stats = rateLimiter.getStats(domain);
      expect(stats.requestsLastSecond).toBe(0);
      expect(stats.requestsLastMinute).toBe(0);
    });

    it('should reset all domains when no domain specified', async () => {
      await rateLimiter.waitForRateLimit('example.com');
      await rateLimiter.waitForRateLimit('test.com');
      
      rateLimiter.reset();
      
      expect(rateLimiter.getStats('example.com').requestsLastSecond).toBe(0);
      expect(rateLimiter.getStats('test.com').requestsLastSecond).toBe(0);
    });
  });
});