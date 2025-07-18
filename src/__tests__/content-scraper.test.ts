/**
 * Tests for ContentScraper utility
 */

// Mock dependencies - must be before imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAxios: any = {
  get: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: jest.fn((): any => mockAxios)
};

jest.mock('axios', () => mockAxios);
jest.mock('../utils/rate-limiter');

// Create proper mock for robots-txt-parser
const mockRobotsParser = {
  canFetch: jest.fn().mockReturnValue(true),
  getSitemaps: jest.fn().mockReturnValue([])
};

const mockRobotsTxt = {
  useRobotsTxt: jest.fn(),
  fetch: jest.fn().mockResolvedValue(mockRobotsParser)
};

// Mock robots-txt-parser
jest.mock('robots-txt-parser', () => {
  return jest.fn().mockImplementation(() => mockRobotsTxt);
});

import { ContentScraper } from '../utils/content-scraper';
import { RateLimiter } from '../utils/rate-limiter';

describe('ContentScraper', () => {
  let scraper: ContentScraper;
  let mockRateLimiter: jest.Mocked<RateLimiter>;

  beforeEach(() => {
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
    jest.clearAllMocks();
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
      const mockRobotsParser = {
        canFetch: jest.fn().mockReturnValue(true),
        getSitemaps: jest.fn().mockReturnValue([])
      };

      const mockRobotsTxt = {
        fetch: jest.fn().mockResolvedValue(mockRobotsParser)
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

      const result = await scraper.checkRobotsTxt('https://example.com/article');
      
      expect(result).toBe(true);
      expect(mockRobotsTxt.fetch).toHaveBeenCalledWith('https://example.com/robots.txt');
    });

    it('should return false when robots.txt disallows access', async () => {
      const mockRobotsParser = {
        canFetch: jest.fn().mockReturnValue(false),
        getSitemaps: jest.fn().mockReturnValue([])
      };

      const mockRobotsTxt = {
        fetch: jest.fn().mockResolvedValue(mockRobotsParser)
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

      const result = await scraper.checkRobotsTxt('https://restricted.com/article');
      
      expect(result).toBe(false);
    });

    it('should return true when robots.txt fetch fails', async () => {
      const mockRobotsTxt = {
        fetch: jest.fn().mockRejectedValue(new Error('Robots.txt not found'))
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

      const result = await scraper.checkRobotsTxt('https://example.com/article');
      
      expect(result).toBe(true); // Should allow access when robots.txt unavailable
    });

    it('should cache robots.txt results', async () => {
      const mockRobotsParser = {
        canFetch: jest.fn().mockReturnValue(true),
        getSitemaps: jest.fn().mockReturnValue([])
      };

      const mockRobotsTxt = {
        fetch: jest.fn().mockResolvedValue(mockRobotsParser)
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

      // First call
      await scraper.checkRobotsTxt('https://example.com/article1');
      
      // Second call to same domain
      await scraper.checkRobotsTxt('https://example.com/article2');
      
      // Should only fetch robots.txt once
      expect(mockRobotsTxt.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('respectfulRequest', () => {
    it('should make successful request with rate limiting', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();
      
      const mockResponse = {
        data: '<html><body>Test content</body></html>',
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await scraper.respectfulRequest('https://example.com/article');
      
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRateLimiter.waitForRateLimit).toHaveBeenCalledWith('example.com');
      expect(result).toEqual(mockResponse);
    });

    it('should include custom headers in request', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();
      
      const mockResponse = {
        data: '<html><body>Test content</body></html>',
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      // Use a camelCase property name for tests
      const customHeaders = {
        xCustomHeader: 'test-value'
      };

      await scraper.respectfulRequest('https://example.com/article', customHeaders);
      
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://example.com/article',
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders)
        })
      );
    });

    it('should handle request failures', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();
      
      const error = new Error('Network error');
      mockAxios.get.mockRejectedValue(error);

      await expect(scraper.respectfulRequest('https://example.com/article'))
        .rejects.toThrow('Network error');
    });

    it('should extract domain correctly from URL', async () => {
      mockRateLimiter.waitForRateLimit.mockResolvedValue();
      mockAxios.get.mockResolvedValue({ data: '', status: 200 });

      await scraper.respectfulRequest('https://subdomain.example.com/path/to/article');
      
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRateLimiter.waitForRateLimit).toHaveBeenCalledWith('subdomain.example.com');
    });
  });

  // The getRobotsInfo method is not available in the current API
  // Instead, we'll test the checkRobotsTxt method which provides similar functionality
  describe('getRobotsCacheSize', () => {
    it('should return the size of robots cache', async () => {
      // First, populate the cache
      const mockRobotsParser = {
        canFetch: jest.fn().mockReturnValue(true),
        getSitemaps: jest.fn().mockReturnValue([])
      };

      const mockRobotsTxt = {
        fetch: jest.fn().mockResolvedValue(mockRobotsParser)
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

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
      const mockRobotsParser = {
        canFetch: jest.fn().mockReturnValue(true),
        getSitemaps: jest.fn().mockReturnValue([])
      };

      const mockRobotsTxt = {
        fetch: jest.fn().mockResolvedValue(mockRobotsParser)
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

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
});