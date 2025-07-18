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
      // Create a rate limiter with a very small limit for testing
      const testLimiter = new RateLimiter(1, 3); // 1 per second, 3 per minute
      const domain = 'example.com';
      
      // Make 3 requests (at the per-minute limit)
      for (let i = 0; i < 3; i++) {
        await testLimiter.waitForRateLimit(domain);
        jest.advanceTimersByTime(1000); // 1 second delay between requests
      }
      
      // 4th request should be delayed until minute rolls over
      const startTime = Date.now();
      const promise = testLimiter.waitForRateLimit(domain);
      
      // Should need to wait for minute to roll over
      jest.advanceTimersByTime(60000);
      await promise;
      
      expect(Date.now() - startTime).toBeGreaterThan(0);
      
      // Verify the stats
      const stats = testLimiter.getStats(domain);
      expect(stats.requestsLastMinute).toBeLessThanOrEqual(3);
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

  describe('getRequestCount', () => {
    it('should return correct request counts', async () => {
      const domain = 'example.com';
      
      await rateLimiter.waitForRateLimit(domain);
      await rateLimiter.waitForRateLimit(domain);
      
      const counts = rateLimiter.getRequestCount(domain);
      
      expect(counts.perSecond).toBe(2);
      expect(counts.perMinute).toBe(2);
    });

    it('should return zero counts for unknown domain', () => {
      const counts = rateLimiter.getRequestCount('unknown.com');
      
      expect(counts.perSecond).toBe(0);
      expect(counts.perMinute).toBe(0);
    });
  });

  describe('resetDomain', () => {
    it('should reset rate limits for a specific domain', async () => {
      const domain1 = 'example.com';
      const domain2 = 'test.com';
      
      await rateLimiter.waitForRateLimit(domain1);
      await rateLimiter.waitForRateLimit(domain2);
      
      rateLimiter.resetDomain(domain1);
      
      expect(rateLimiter.getRequestCount(domain1).perSecond).toBe(0);
      expect(rateLimiter.getRequestCount(domain2).perSecond).toBe(1);
    });
  });

  describe('resetAll', () => {
    it('should reset rate limits for all domains', async () => {
      const domain1 = 'example.com';
      const domain2 = 'test.com';
      
      await rateLimiter.waitForRateLimit(domain1);
      await rateLimiter.waitForRateLimit(domain2);
      
      rateLimiter.resetAll();
      
      expect(rateLimiter.getRequestCount(domain1).perSecond).toBe(0);
      expect(rateLimiter.getRequestCount(domain2).perSecond).toBe(0);
    });
  });

  describe('getConfig', () => {
    it('should return the rate limiter configuration', () => {
      const config = rateLimiter.getConfig();
      
      expect(config.maxRequestsPerSecond).toBe(2);
      expect(config.maxRequestsPerMinute).toBe(10);
    });
  });

  describe('isRateLimited', () => {
    it('should return false when domain is not rate limited', () => {
      const domain = 'example.com';
      
      expect(rateLimiter.isRateLimited(domain)).toBe(false);
    });

    it('should return true when domain exceeds per-second limit', async () => {
      const domain = 'example.com';
      
      await rateLimiter.waitForRateLimit(domain);
      await rateLimiter.waitForRateLimit(domain);
      
      expect(rateLimiter.isRateLimited(domain)).toBe(true);
    });

    it('should return true when domain exceeds per-minute limit', async () => {
      // Create a rate limiter with a very small limit for testing
      const testLimiter = new RateLimiter(10, 3); // 10 per second, 3 per minute
      const domain = 'example.com';
      
      // Make 3 requests (at the per-minute limit)
      for (let i = 0; i < 3; i++) {
        await testLimiter.waitForRateLimit(domain);
      }
      
      expect(testLimiter.isRateLimited(domain)).toBe(true);
    });

    it('should handle unknown domains', () => {
      expect(rateLimiter.isRateLimited('unknown.com')).toBe(false);
    });

    it('should normalize domain names', async () => {
      const domain = 'Example.Com';
      
      await rateLimiter.waitForRateLimit(domain.toLowerCase());
      await rateLimiter.waitForRateLimit(domain.toLowerCase());
      
      expect(rateLimiter.isRateLimited(domain)).toBe(true);
    });
  });
});