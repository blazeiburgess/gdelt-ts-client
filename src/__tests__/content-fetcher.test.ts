/**
 * Tests for ContentFetcherService
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

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
});