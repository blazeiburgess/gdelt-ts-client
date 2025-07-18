/**
 * Tests for ContentScraper utility
 */

import { ContentScraper } from '../utils/content-scraper';
import { RateLimiter } from '../utils/rate-limiter';

// Mock dependencies
jest.mock('../utils/rate-limiter');
jest.mock('robots-txt-parser');
jest.mock('axios');

const mockAxios = {
  get: jest.fn(),
  create: jest.fn(() => mockAxios)
};

jest.mock('axios', () => mockAxios);

describe('ContentScraper', () => {
  let scraper: ContentScraper;
  let mockRateLimiter: jest.Mocked<RateLimiter>;

  beforeEach(() => {
    const MockRateLimiter = RateLimiter as jest.MockedClass<typeof RateLimiter>;
    mockRateLimiter = new MockRateLimiter() as jest.Mocked<RateLimiter>;
    
    scraper = new ContentScraper({
      userAgent: 'Test-Agent',
      timeout: 5000,
      followRedirects: true,
      maxRedirects: 3,
      customHeaders: {}
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create scraper with default config', () => {
      const defaultScraper = new ContentScraper();
      expect(defaultScraper).toBeInstanceOf(ContentScraper);
    });

    it('should create scraper with custom config', () => {
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

      const customHeaders = {
        'X-Custom-Header': 'test-value'
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
      
      expect(mockRateLimiter.waitForRateLimit).toHaveBeenCalledWith('subdomain.example.com');
    });
  });

  describe('getRobotsInfo', () => {
    it('should return robots.txt information', async () => {
      const mockRobotsParser = {
        canFetch: jest.fn().mockReturnValue(true),
        getSitemaps: jest.fn().mockReturnValue(['https://example.com/sitemap.xml'])
      };

      const mockRobotsTxt = {
        fetch: jest.fn().mockResolvedValue(mockRobotsParser)
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

      const result = await scraper.getRobotsInfo('https://example.com');
      
      expect(result.allowed).toBe(true);
      expect(result.sitemaps).toEqual(['https://example.com/sitemap.xml']);
      expect(result.crawlDelay).toBeUndefined();
    });

    it('should handle missing robots.txt', async () => {
      const mockRobotsTxt = {
        fetch: jest.fn().mockRejectedValue(new Error('Not found'))
      };

      const robotsTxtParser = require('robots-txt-parser');
      robotsTxtParser.mockReturnValue(mockRobotsTxt);

      const result = await scraper.getRobotsInfo('https://example.com');
      
      expect(result.allowed).toBe(true);
      expect(result.sitemaps).toEqual([]);
      expect(result.error).toBe('Not found');
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = scraper.getConfig();
      
      expect(config.userAgent).toBe('Test-Agent');
      expect(config.timeout).toBe(5000);
      expect(config.followRedirects).toBe(true);
      expect(config.maxRedirects).toBe(3);
    });
  });

  describe('getRateLimiter', () => {
    it('should return rate limiter instance', () => {
      const rateLimiter = scraper.getRateLimiter();
      expect(rateLimiter).toBeDefined();
    });
  });
});