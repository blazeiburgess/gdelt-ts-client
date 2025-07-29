/**
 * Tests for ContentFetcherService
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { ContentFetcherService } from '../services/content-fetcher';
import { IContentFetcherConfig } from '../interfaces/content-fetcher';

// Mock dependencies
jest.mock('../utils/content-scraper');
jest.mock('../services/content-parser');

const mockConfig: IContentFetcherConfig = {
  concurrencyLimit: 2,
  requestDelay: 100,
  userAgent: 'Test-Agent',
  timeout: 5000,
  maxRetries: 1,
  maxRequestsPerSecond: 2,
  maxRequestsPerMinute: 10,
  respectRobotsTxt: true,
  followRedirects: true,
  maxRedirects: 3,
  skipDomains: [],
  customHeaders: {},
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

describe('ContentFetcherService', () => {
  let service: ContentFetcherService;

  beforeEach(() => {
    service = new ContentFetcherService(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with default config', () => {
      const defaultService = new ContentFetcherService();
      expect(defaultService).toBeInstanceOf(ContentFetcherService);
    });

    it('should create service with custom config', () => {
      expect(service).toBeInstanceOf(ContentFetcherService);
      expect(service.getConfig()).toMatchObject(mockConfig);
    });

    it('should use fallback values when config properties are undefined', () => {
      const partialConfig: IContentFetcherConfig = {
        concurrencyLimit: 5,
        requestDelay: 200,
        // userAgent, timeout, maxRequestsPerSecond, maxRequestsPerMinute are undefined
        respectRobotsTxt: true,
        followRedirects: true,
        maxRedirects: 3,
        skipDomains: [],
        customHeaders: {},
        retryableStatusCodes: [408]
      };
      
      const serviceWithPartialConfig = new ContentFetcherService(partialConfig);
      const scraper = serviceWithPartialConfig.getContentScraper();
      
      // These values should have been set with fallbacks
      expect(scraper).toBeDefined();
    });
  });

  describe('fetchArticleContent', () => {
    it('should handle successful content fetch', async () => {
      const mockUrl = 'https://example.com/article';
      
      // Mock the content scraper and parser
      const mockScraper = service.getContentScraper();
      const mockParser = service.getContentParser();
      
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        data: '<html><body><p>Test content</p></body></html>',
        status: 200
      } as any);
      
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);

      // Mock Date.now() to ensure timing values are non-zero
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount * 100; // Return increasing timestamps
      });

      try {
        const result = await service.fetchArticleContent(mockUrl);

        expect(result.success).toBe(true);
        expect(result.url).toBe(mockUrl);
        expect(result.content).toBeDefined();
        expect(result.content?.text).toBe('Test content');
        expect(result.timing.totalTime).toBeGreaterThan(0);
      } finally {
        // Restore original Date.now
        Date.now = originalDateNow;
      }
    });
    
    it('should include raw HTML when requested', async () => {
      const mockUrl = 'https://example.com/article';
      const mockHtml = '<html><body><p>Test content</p></body></html>';
      
      // Mock the content scraper and parser
      const mockScraper = service.getContentScraper();
      const mockParser = service.getContentParser();
      
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        data: mockHtml,
        status: 200
      } as any);
      
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);

      const result = await service.fetchArticleContent(mockUrl, {
        includeRawHTML: true
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content?.rawHTML).toBe(mockHtml);
    });

    it('should fetch content without parsing when parseContent is false', async () => {
      const mockUrl = 'https://example.com/article';
      const mockHtml = '<html><body><h1>Test</h1></body></html>';
      
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: mockHtml
      } as any);

      const result = await service.fetchArticleContent(mockUrl, {
        parseContent: false
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeUndefined();
      expect(result.timing).toBeDefined();
    });

    it('should handle successful fetch but no content parsing', async () => {
      const mockUrl = 'https://example.com/article';
      const mockHtml = '<html><body><h1>Test</h1></body></html>';
      
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: mockHtml
      } as any);

      const mockParser = service.getContentParser();
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue(undefined as any);

      const result = await service.fetchArticleContent(mockUrl);

      expect(result.success).toBe(true);
      expect(result.content).toBeUndefined();
    });

    it('should handle failed content fetch', async () => {
      const mockUrl = 'https://example.com/article';
      
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockRejectedValue(
        new Error('Network error')
      );

      const result = await service.fetchArticleContent(mockUrl);

      expect(result.success).toBe(false);
      expect(result.url).toBe(mockUrl);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Network error');
    });

    it('should respect robots.txt restrictions', async () => {
      const mockUrl = 'https://restricted.com/article';
      
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(false);

      const result = await service.fetchArticleContent(mockUrl);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Robots.txt disallows access');
    });

    it('should skip domains in skip list', async () => {
      const serviceWithSkipList = new ContentFetcherService({
        ...mockConfig,
        skipDomains: ['skip.com']
      });
      
      const mockUrl = 'https://skip.com/article';
      
      const result = await serviceWithSkipList.fetchArticleContent(mockUrl);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('skip list');
    });

    it('should only allow domains in allowed list', async () => {
      const mockUrl = 'https://notallowed.com/article';
      
      const result = await service.fetchArticleContent(mockUrl, {
        allowedDomains: ['allowed.com']
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not in allowed domains');
    });

    it('should skip robots.txt check when respectRobotsTxt is false', async () => {
      const serviceWithoutRobots = new ContentFetcherService({
        ...mockConfig,
        respectRobotsTxt: false
      });
      
      const mockUrl = 'https://example.com/article';
      const mockHtml = '<html><body><h1>Test</h1></body></html>';
      
      const mockScraper = serviceWithoutRobots.getContentScraper();
      const checkRobotsSpy = jest.spyOn(mockScraper, 'checkRobotsTxt');
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: mockHtml
      } as any);

      const mockParser = serviceWithoutRobots.getContentParser();
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        title: 'Test Article',
        content: 'Test content',
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        }
      } as any);

      const result = await serviceWithoutRobots.fetchArticleContent(mockUrl);

      expect(result.success).toBe(true);
      expect(checkRobotsSpy).not.toHaveBeenCalled();
    });

    it('should allow domain that is in allowed list', async () => {
      const mockUrl = 'https://allowed.com/article';
      const mockHtml = '<html><body><h1>Test</h1></body></html>';
      
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: mockHtml
      } as any);

      const mockParser = service.getContentParser();
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        title: 'Test Article',
        content: 'Test content',
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        }
      } as any);

      const result = await service.fetchArticleContent(mockUrl, {
        allowedDomains: ['allowed.com', 'other.com']
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
    });
  });

  describe('fetchMultipleArticleContent', () => {
    it('should handle multiple URLs successfully', async () => {
      const mockUrls = [
        'https://example.com/article1',
        'https://example.com/article2'
      ];
      
      const mockScraper = service.getContentScraper();
      const mockParser = service.getContentParser();
      
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        data: '<html><body><p>Test content</p></body></html>',
        status: 200
      } as any);
      
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);

      const results = await service.fetchMultipleArticleContent(mockUrls);

      expect(results).toHaveLength(2);
      expect(results[0]?.success).toBe(true);
      expect(results[1]?.success).toBe(true);
    });

    it('should handle progress callback', async () => {
      const mockUrls = [
        'https://example.com/article1',
        'https://example.com/article2'
      ];
      
      const mockScraper = service.getContentScraper();
      const mockParser = service.getContentParser();
      
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        data: '<html><body><p>Test content</p></body></html>',
        status: 200
      } as any);
      
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);

      const progressCallback = jest.fn();
      
      await service.fetchMultipleArticleContent(mockUrls, {
        onProgress: progressCallback
      });

      expect(progressCallback).toHaveBeenCalledWith(1, 2);
      expect(progressCallback).toHaveBeenCalledWith(2, 2);
    });

    it('should handle mixed success and failure', async () => {
      const mockUrls = [
        'https://example.com/article1',
        'https://fail.com/article2'
      ];
      
      const mockScraper = service.getContentScraper();
      const mockParser = service.getContentParser();

      // eslint-disable-next-line @typescript-eslint/require-await
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockImplementation(async (domain) => {
        return domain !== 'fail.com';
      });
      
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        data: '<html><body><p>Test content</p></body></html>',
        status: 200
      } as any);
      
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);

      const results = await service.fetchMultipleArticleContent(mockUrls);

      expect(results).toHaveLength(2);
      expect(results[0]?.success).toBe(true);
      expect(results[1]?.success).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = service.getConfig();
      expect(config).toMatchObject(mockConfig);
    });
  });

  describe('getContentScraper', () => {
    it('should return content scraper instance', () => {
      const scraper = service.getContentScraper();
      expect(scraper).toBeDefined();
    });
  });

  describe('getContentParser', () => {
    it('should return content parser instance', () => {
      const parser = service.getContentParser();
      expect(parser).toBeDefined();
    });
  });
  describe('Private methods coverage', () => {
    // Test _fetchWithRetry through fetchArticleContent with retryable status codes
    it('should retry on retryable status codes', async () => {
      const mockUrl = 'https://example.com/article';
      
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      
      // First call throws error with status 503, second call succeeds
      const mockRequest = jest.spyOn(mockScraper, 'respectfulRequest');
      mockRequest.mockRejectedValueOnce({
        response: { status: 503 },
        message: 'Service unavailable'
      });
      mockRequest.mockResolvedValueOnce({
        data: '<html><body><p>Test content</p></body></html>',
        status: 200
      } as any);
      
      const mockParser = service.getContentParser();
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);
      
      // Mock _delay method directly to avoid timer issues
      jest.spyOn(service as any, '_delay').mockImplementation(async () => Promise.resolve());
      
      const result = await service.fetchArticleContent(mockUrl);
      
      expect(result.success).toBe(true);
      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(result.error).toBeUndefined();
    });
    
    // Test _getErrorCode with different error types
    it('should handle different error types with _getErrorCode', async () => {
      const mockUrl = 'https://example.com/article';
      const mockScraper = service.getContentScraper();
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      
      // Test error with code property
      jest.spyOn(mockScraper, 'respectfulRequest').mockRejectedValueOnce({
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      });
      
      let result = await service.fetchArticleContent(mockUrl);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ECONNREFUSED');
      
      // Test error with response status
      jest.spyOn(mockScraper, 'respectfulRequest').mockRejectedValueOnce({
        response: { status: 404 },
        message: 'Not found'
      });
      
      result = await service.fetchArticleContent(mockUrl);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('HTTP_404');
      
      // Test timeout error
      jest.spyOn(mockScraper, 'respectfulRequest').mockRejectedValueOnce(
        new Error('timeout of 5000ms exceeded')
      );
      
      result = await service.fetchArticleContent(mockUrl);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TIMEOUT');
      
      // Test robots.txt error
      jest.spyOn(mockScraper, 'respectfulRequest').mockRejectedValueOnce(
        new Error('robots.txt disallows access')
      );
      
      result = await service.fetchArticleContent(mockUrl);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ROBOTS_DISALLOWED');
      
      // Test unknown error
      jest.spyOn(mockScraper, 'respectfulRequest').mockRejectedValueOnce(
        new Error('Some other error')
      );
      
      result = await service.fetchArticleContent(mockUrl);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNKNOWN');
    });
    
    // Test _groupUrlsByDomain with valid and invalid URLs
    it('should group URLs by domain and handle invalid URLs', async () => {
      const mockUrls = [
        'https://example.com/article1',
        'https://example.com/article2',
        'https://another.com/article',
        'invalid-url', // Invalid URL
        'https://third.com/article'
      ];
      
      const mockScraper = service.getContentScraper();
      const mockParser = service.getContentParser();
      
      jest.spyOn(mockScraper, 'checkRobotsTxt').mockResolvedValue(true);
      jest.spyOn(mockScraper, 'respectfulRequest').mockResolvedValue({
        data: '<html><body><p>Test content</p></body></html>',
        status: 200
      } as any);
      
      jest.spyOn(mockParser, 'parseHTML').mockReturnValue({
        text: 'Test content',
        wordCount: 2,
        metadata: {
          extractionMethod: 'readability',
          extractionConfidence: 0.9
        },
        paywallDetected: false,
        qualityScore: 0.8
      } as any);
      
      // Mock console.warn to capture warnings
      const originalConsoleWarn = console.warn;
      const mockConsoleWarn = jest.fn();
      console.warn = mockConsoleWarn;
      
      try {
        const results = await service.fetchMultipleArticleContent(mockUrls);
        
        // Should have 4 results (one for each valid URL)
        expect(results).toHaveLength(4);
        
        // Should have logged a warning for the invalid URL
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          expect.stringContaining('Invalid URL: invalid-url')
        );
      } finally {
        console.warn = originalConsoleWarn;
      }
    });
  });
});