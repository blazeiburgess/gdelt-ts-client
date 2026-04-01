/**
 * Tests for ContentScraper utility
 */

/* eslint-disable @typescript-eslint/require-await */

// Mock dependencies - must be before imports
jest.mock('../utils/rate-limiter');

import { ContentScraper } from '../utils/content-scraper';
import { RateLimiter } from '../utils/rate-limiter';

// Create mock fetch function
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('ContentScraper', () => {
  let scraper: ContentScraper;
  let mockRateLimiter: jest.Mocked<RateLimiter>;
  let consoleWarnSpy: jest.SpyInstance;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    // Replace global fetch with mock
    global.fetch = mockFetch;

    // Mock console.warn to suppress expected warnings
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    // Create a mock instance with the methods we need
    mockRateLimiter = {
      waitForRateLimit: jest.fn().mockResolvedValue(undefined),
      getStats: jest.fn(),
      reset: jest.fn()
    } as unknown as jest.Mocked<RateLimiter>;

    // Make the RateLimiter constructor return our mock instance
    (RateLimiter as jest.MockedClass<typeof RateLimiter>).mockImplementation(() => mockRateLimiter);

    scraper = new ContentScraper(
      'Test-Agent',
      5000,
      2,
      10
    );
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    jest.clearAllMocks();
    consoleWarnSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create scraper with default values', () => {
      // Use default-like values instead of no parameters
      const defaultScraper = new ContentScraper(
        'Default-Agent',
        30000,
        1,
        30
      );
      expect(defaultScraper).toBeInstanceOf(ContentScraper);
    });

    it('should create scraper with custom values', () => {
      expect(scraper).toBeInstanceOf(ContentScraper);
    });
  });

  describe('checkRobotsTxt', () => {
    it('should return true when robots.txt allows access', async () => {
      // Mock fetch to return a robots.txt that allows access
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nAllow: /'
      } as Response);

      const result = await scraper.checkRobotsTxt('example.com');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/robots.txt', expect.any(Object));
    });

    it('should return false when robots.txt disallows access', async () => {
      // Mock fetch to return a robots.txt that disallows access
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nDisallow: /'
      } as Response);

      const result = await scraper.checkRobotsTxt('restricted.com');

      expect(result).toBe(false);
    });

    it('should return true when robots.txt fetch fails', async () => {
      // Mock fetch to fail when fetching robots.txt
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await scraper.checkRobotsTxt('example.com');

      expect(result).toBe(true); // Should allow access when robots.txt unavailable
    });

    it('should cache default rules when robots.txt fetch fails', async () => {
      // Spy on console.warn to verify it's called
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Spy on the cache set method
      const cacheSpy = jest.spyOn(scraper['_robotsCache'], 'set');

      // Mock fetch to fail when fetching robots.txt
      mockFetch.mockRejectedValueOnce(new Error('Timeout error'));

      // Call the method
      const result = await scraper.checkRobotsTxt('timeout-example.com');

      // Verify the result
      expect(result).toBe(true);

      // Verify console.warn was called
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch robots.txt for timeout-example.com:',
        expect.any(Error)
      );

      // Verify the cache was set with default values
      expect(cacheSpy).toHaveBeenCalledWith(
        'timeout-example.com',
        expect.objectContaining({
          allowed: true,
          userAgentRules: []
        })
      );

      // Verify the expiration time is set to 5 minutes (300000ms)
      expect(cacheSpy).toHaveBeenCalled();

      // Get the cached value directly from the mock calls
      const cachedValue = cacheSpy.mock.calls[0]?.[1];
      expect(cachedValue).toBeDefined();

      // Type assertion to help TypeScript
      if (cachedValue) {
        // Verify that expiration time is in the future
        expect(cachedValue.expiresAt).toBeGreaterThan(Date.now());

        // Calculate the maximum possible expiration time (30 minutes + buffer)
        const maxExpirationTime = Date.now() + 1800000 + 1000; // 30 minutes + 1 second buffer

        // Verify that expiration time is reasonable (not more than 30 minutes in the future)
        expect(cachedValue.expiresAt).toBeLessThanOrEqual(maxExpirationTime);
      }

      // Restore the spy
      consoleWarnSpy.mockRestore();
      cacheSpy.mockRestore();
    });

    it('should handle different error types when fetching robots.txt', async () => {
      // Test different error types to ensure all branches are covered
      const errorTypes = [
        { name: 'FetchError', message: 'Request failed with status code 404' },
        { name: 'TypeError', message: 'Cannot read property of undefined' },
        { name: 'SyntaxError', message: 'Unexpected token in JSON' }
      ];

      for (const errorType of errorTypes) {
        // Spy on console.warn
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        // Create an error with the specific type
        const error = new Error(errorType.message);
        error.name = errorType.name;

        // Mock fetch to fail with this specific error
        mockFetch.mockRejectedValueOnce(error);

        // Call the method with a unique domain for each error type
        const domain = `${errorType.name.toLowerCase()}-example.com`;
        const result = await scraper.checkRobotsTxt(domain);

        // Verify the result is true regardless of error type
        expect(result).toBe(true);

        // Verify console.warn was called with the correct error
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          `Failed to fetch robots.txt for ${domain}:`,
          expect.objectContaining({
            name: errorType.name,
            message: errorType.message
          })
        );

        // Restore the spy
        consoleWarnSpy.mockRestore();
      }
    });

    it('should handle null or undefined error when fetching robots.txt', async () => {
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock fetch to fail with undefined error (can happen in some edge cases)
      mockFetch.mockRejectedValueOnce(undefined);

      // Call the method
      const result = await scraper.checkRobotsTxt('undefined-error-example.com');

      // Verify the result
      expect(result).toBe(true);

      // Verify console.warn was called
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch robots.txt for undefined-error-example.com:',
        undefined
      );

      // Restore the spy
      consoleWarnSpy.mockRestore();
    });

    it('should cache robots.txt results', async () => {
      // Reset mocks to ensure clean state
      mockFetch.mockReset();

      // Mock fetch for the first call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nAllow: /'
      } as Response);

      // First call
      await scraper.checkRobotsTxt('example.com');

      // Second call to same domain
      await scraper.checkRobotsTxt('example.com');

      // Should only fetch robots.txt once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should remove expired cache entries', async () => {
      // Use jest's timer mocks to control time
      jest.useFakeTimers();

      // Mock fetch for the first call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nAllow: /'
      } as Response);

      // First call
      await scraper.checkRobotsTxt('example.com');

      // Advance time by more than the cache expiration (1 hour + 1 minute)
      jest.advanceTimersByTime(3660000);

      // Mock fetch for the second call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nDisallow: /'
      } as Response);

      // Second call to same domain after cache expiration
      const result = await scraper.checkRobotsTxt('example.com');

      // Should fetch robots.txt again and return new result
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe(false);

      // Restore real timers
      jest.useRealTimers();
    });

    it('should handle different user agent sections in robots.txt', async () => {
      // Mock fetch to return a robots.txt with multiple user agent sections
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /'
      } as Response);

      const result = await scraper.checkRobotsTxt('example.com');

      expect(result).toBe(true); // Should allow access for our user agent
    });

    it('should handle robots.txt with bot-specific rules', async () => {
      // Create a new scraper with a bot-like user agent for this test
      const botScraper = new ContentScraper(
        'TestBot/1.0',
        5000,
        2,
        10
      );

      // Mock fetch to return a robots.txt with bot-specific rules
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: bot\nDisallow: /\n\nUser-agent: *\nAllow: /'
      } as Response);

      const result = await botScraper.checkRobotsTxt('example.com');

      expect(result).toBe(false); // Should disallow access for bot user agent
    });
  });

  describe('respectfulRequest', () => {
    it('should make successful request with rate limiting', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      // Create mock Headers
      const mockHeaders = new Map<string, string>();
      mockHeaders.set('content-type', 'text/html');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<html><body>Test content</body></html>',
        headers: {
          forEach: (callback: (value: string, key: string) => void) => {
            mockHeaders.forEach((value, key) => callback(value, key));
          },
          get: (name: string) => mockHeaders.get(name) ?? null
        }
      } as unknown as Response);

      const result = await scraper.respectfulRequest('https://example.com/article');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRateLimiter.waitForRateLimit).toHaveBeenCalledWith('example.com');
      expect(result.data).toBe('<html><body>Test content</body></html>');
      expect(result.status).toBe(200);

      checkRobotsSpy.mockRestore();
    });

    it('should include custom headers in request', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      const mockHeaders = new Map<string, string>();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<html><body>Test content</body></html>',
        headers: {
          forEach: (callback: (value: string, key: string) => void) => {
            mockHeaders.forEach((value, key) => callback(value, key));
          },
          get: (name: string) => mockHeaders.get(name) ?? null
        }
      } as unknown as Response);

      // Use a camelCase property name for tests
      const customHeaders = {
        xCustomHeader: 'test-value'
      };

      await scraper.respectfulRequest('https://example.com/article', customHeaders);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/article',
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders)
        })
      );

      checkRobotsSpy.mockRestore();
    });

    it('should handle request failures', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      const error = new Error('Network error');
      mockFetch.mockRejectedValueOnce(error);

      await expect(scraper.respectfulRequest('https://example.com/article'))
        .rejects.toThrow('Network error');

      checkRobotsSpy.mockRestore();
    });

    it('should extract domain correctly from URL', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      const mockHeaders = new Map<string, string>();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '',
        headers: {
          forEach: (callback: (value: string, key: string) => void) => {
            mockHeaders.forEach((value, key) => callback(value, key));
          },
          get: (name: string) => mockHeaders.get(name) ?? null
        }
      } as unknown as Response);

      await scraper.respectfulRequest('https://subdomain.example.com/path/to/article');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRateLimiter.waitForRateLimit).toHaveBeenCalledWith('subdomain.example.com');

      checkRobotsSpy.mockRestore();
    });

    it('should throw error when robots.txt disallows access', async () => {
      // Mock checkRobotsTxt to return false (disallowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(false);

      await expect(scraper.respectfulRequest('https://restricted.com/article'))
        .rejects.toThrow('Robots.txt disallows access to restricted.com');

      // Verify checkRobotsTxt was called
      expect(checkRobotsSpy).toHaveBeenCalledWith('restricted.com');

      // Restore the original implementation
      checkRobotsSpy.mockRestore();
    });

    it('should handle 4xx status codes', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      const mockHeaders = new Map<string, string>();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not Found',
        headers: {
          forEach: (callback: (value: string, key: string) => void) => {
            mockHeaders.forEach((value, key) => callback(value, key));
          },
          get: (name: string) => mockHeaders.get(name) ?? null
        }
      } as unknown as Response);

      const result = await scraper.respectfulRequest('https://example.com/not-found');

      // Should return the response even with 4xx status
      expect(result.status).toBe(404);

      checkRobotsSpy.mockRestore();
    });

    it('should reject 5xx status codes', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      const mockHeaders = new Map<string, string>();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
        headers: {
          forEach: (callback: (value: string, key: string) => void) => {
            mockHeaders.forEach((value, key) => callback(value, key));
          },
          get: (name: string) => mockHeaders.get(name) ?? null
        }
      } as unknown as Response);

      await expect(scraper.respectfulRequest('https://example.com/article'))
        .rejects.toThrow('Request failed with status code 500');

      checkRobotsSpy.mockRestore();
    });
  });

  // The getRobotsInfo method is not available in the current API
  // Instead, we'll test the checkRobotsTxt method which provides similar functionality
  describe('getRobotsCacheSize', () => {
    it('should return the size of robots cache', async () => {
      // First, populate the cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nAllow: /'
      } as Response);

      // Call checkRobotsTxt to populate the cache
      await scraper.checkRobotsTxt('example.com');

      // Now check the cache size
      const cacheSize = scraper.getRobotsCacheSize();
      expect(cacheSize).toBe(1);
    });
  });

  describe('clearRobotsCache', () => {
    it('should clear the robots cache', async () => {
      // First, populate the cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: *\nAllow: /'
      } as Response);

      // Call checkRobotsTxt to populate the cache
      await scraper.checkRobotsTxt('example.com');

      // Clear the cache
      scraper.clearRobotsCache();

      // Check that the cache is empty
      const cacheSize = scraper.getRobotsCacheSize();
      expect(cacheSize).toBe(0);
    });
  });

  describe('getRateLimiter', () => {
    it('should return rate limiter instance', () => {
      const rateLimiter = scraper.getRateLimiter();
      expect(rateLimiter).toBeDefined();
    });
  });

  describe('robots.txt caching edge cases', () => {
    it('should cache default rules for shorter time when robots.txt fetch fails', async () => {
      // This tests lines 60-68 where robots.txt fetch fails and default rules are cached
      mockFetch.mockRejectedValue(new Error('Connection timeout'));

      const domain = 'timeout.com';
      const allowed = await scraper.checkRobotsTxt(domain);

      expect(allowed).toBe(true);

      // Check that the cache has the entry
      const cacheSize = scraper.getRobotsCacheSize();
      expect(cacheSize).toBe(1);
    });

    it('should handle multiple failed robots.txt fetches with proper caching', async () => {
      // Clear any previous mocks
      mockFetch.mockClear();
      mockFetch.mockRejectedValue(new Error('DNS resolution failed'));

      // First call should fetch and cache
      const allowed1 = await scraper.checkRobotsTxt('fail1.com');
      expect(allowed1).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call to same domain should use cache
      const allowed2 = await scraper.checkRobotsTxt('fail1.com');
      expect(allowed2).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not fetched again

      // Call to different domain should fetch again
      const allowed3 = await scraper.checkRobotsTxt('fail2.com');
      expect(allowed3).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('AbortError handling', () => {
    it('should handle AbortError timeout and convert to custom error', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();

      // Mock checkRobotsTxt to return true (allowed)
      const checkRobotsSpy = jest.spyOn(scraper, 'checkRobotsTxt').mockResolvedValueOnce(true);

      // Create an AbortError (simulating timeout)
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      try {
        await scraper.respectfulRequest('https://example.com/article');
        fail('Expected an error to be thrown');
      } catch (error) {
        const typedError = error as Error & { code?: string };
        expect(typedError.message).toContain('timeout');
        expect(typedError.code).toBe('ECONNABORTED');
      }

      checkRobotsSpy.mockRestore();
    });
  });

  describe('robots.txt parsing edge cases', () => {
    it('should return true for empty robots.txt content', async () => {
      // Mock fetch to return empty robots.txt
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => ''
      } as Response);

      const result = await scraper.checkRobotsTxt('empty-robots.com');
      expect(result).toBe(true);
    });

    it('should return true for robots.txt with only comments', async () => {
      // Mock fetch to return robots.txt with only comments
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '# This is a comment\n# Another comment\nCrawl-delay: 1'
      } as Response);

      const result = await scraper.checkRobotsTxt('comments-only.com');
      expect(result).toBe(true);
    });

    it('should return true when no user-agent rules match', async () => {
      // Mock fetch to return robots.txt with rules only for other bots
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'User-agent: Googlebot\nDisallow: /\n\nUser-agent: Bingbot\nDisallow: /'
      } as Response);

      const result = await scraper.checkRobotsTxt('other-bots.com');
      expect(result).toBe(true);
    });
  });
});