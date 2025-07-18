/**
 * Integration tests for GdeltClient content fetching methods
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GdeltClient } from '../client';
import { EMode, EFormat } from '../constants';
import { IArticleListResponse } from '../interfaces/api-responses';
import { ContentFetcherService } from '../services/content-fetcher';

// Mock dependencies
jest.mock('../services/content-fetcher');

describe('GdeltClient Content Integration', () => {
  let client: GdeltClient;
  let mockContentFetcher: jest.Mocked<ContentFetcherService>;

  beforeEach(() => {
    const MockContentFetcher = ContentFetcherService as jest.MockedClass<typeof ContentFetcherService>;
    mockContentFetcher = new MockContentFetcher() as jest.Mocked<ContentFetcherService>;
    
    client = new GdeltClient({
      baseUrl: 'https://api.gdeltproject.org/api/v2/doc/doc',
      defaultFormat: EFormat.json,
      timeout: 30000,
      contentFetcher: {
        concurrencyLimit: 3,
        userAgent: 'Test-Agent'
      }
    });

    // Mock the content fetcher
    (client as any)._contentFetcher = mockContentFetcher;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getArticlesWithContent', () => {
    it('should fetch articles and their content', async () => {
      const mockArticles: IArticleListResponse = {
        articles: [
          {
            url: 'https://example.com/article1',
            title: 'Test Article 1',
            seendate: '2023-01-01T00:00:00Z',
            socialimage: 'https://example.com/image1.jpg',
            domain: 'example.com',
            sourcelanguage: 'english',
            sourcecountry: 'US'
          },
          {
            url: 'https://example.com/article2',
            title: 'Test Article 2',
            seendate: '2023-01-02T00:00:00Z',
            socialimage: 'https://example.com/image2.jpg',
            domain: 'example.com',
            sourcelanguage: 'english',
            sourcecountry: 'US'
          }
        ],
        count: 2,
        status: 'success'
      };

      const mockContentResults = [
        {
          url: 'https://example.com/article1',
          success: true,
          content: {
            text: 'Content of article 1',
            wordCount: 50,
            metadata: {
              extractionMethod: 'readability' as const,
              extractionConfidence: 0.9
            },
            paywallDetected: false,
            qualityScore: 0.8
          },
          timing: {
            fetchTime: 1000,
            parseTime: 200,
            totalTime: 1200
          }
        },
        {
          url: 'https://example.com/article2',
          success: true,
          content: {
            text: 'Content of article 2',
            wordCount: 75,
            metadata: {
              extractionMethod: 'readability' as const,
              extractionConfidence: 0.85
            },
            paywallDetected: false,
            qualityScore: 0.9
          },
          timing: {
            fetchTime: 1100,
            parseTime: 180,
            totalTime: 1280
          }
        }
      ];

      // Mock the getArticles method
      jest.spyOn(client, 'getArticles').mockResolvedValue(mockArticles);
      
      // Mock the content fetcher
      mockContentFetcher.fetchMultipleArticleContent.mockResolvedValue(mockContentResults);

      const result = await client.getArticlesWithContent({
        query: 'test query',
        mode: EMode.articleList,
        format: EFormat.json
      });

      expect(client.getArticles).toHaveBeenCalledWith({
        query: 'test query',
        mode: EMode.articleList,
        format: EFormat.json
      });

      expect(mockContentFetcher.fetchMultipleArticleContent).toHaveBeenCalledWith(
        ['https://example.com/article1', 'https://example.com/article2'],
        undefined
      );

      expect(result.articles).toHaveLength(2);
      expect(result.articles[0]?.content?.text).toBe('Content of article 1');
      expect(result.articles[1]?.content?.text).toBe('Content of article 2');
      expect(result.contentStats.totalArticles).toBe(2);
      expect(result.contentStats.successfulFetches).toBe(2);
      expect(result.contentStats.failedFetches).toBe(0);
    });

    it('should handle mixed success and failure in content fetching', async () => {
      const mockArticles: IArticleListResponse = {
        articles: [
          {
            url: 'https://example.com/article1',
            title: 'Test Article 1',
            seendate: '2023-01-01T00:00:00Z',
            socialimage: 'https://example.com/image1.jpg',
            domain: 'example.com',
            sourcelanguage: 'english',
            sourcecountry: 'US'
          },
          {
            url: 'https://fail.com/article2',
            title: 'Test Article 2',
            seendate: '2023-01-02T00:00:00Z',
            socialimage: 'https://fail.com/image2.jpg',
            domain: 'fail.com',
            sourcelanguage: 'english',
            sourcecountry: 'US'
          }
        ],
        count: 2,
        status: 'success'
      };

      const mockContentResults = [
        {
          url: 'https://example.com/article1',
          success: true,
          content: {
            text: 'Content of article 1',
            wordCount: 50,
            metadata: {
              extractionMethod: 'readability' as const,
              extractionConfidence: 0.9
            },
            paywallDetected: false,
            qualityScore: 0.8
          },
          timing: {
            fetchTime: 1000,
            parseTime: 200,
            totalTime: 1200
          }
        },
        {
          url: 'https://fail.com/article2',
          success: false,
          error: {
            message: 'Failed to fetch content',
            code: 'FETCH_ERROR',
            retryCount: 2
          },
          timing: {
            fetchTime: 0,
            parseTime: 0,
            totalTime: 500
          }
        }
      ];

      jest.spyOn(client, 'getArticles').mockResolvedValue(mockArticles);
      mockContentFetcher.fetchMultipleArticleContent.mockResolvedValue(mockContentResults);

      const result = await client.getArticlesWithContent({
        query: 'test query'
      });

      expect(result.articles).toHaveLength(2);
      expect(result.articles[0]?.content?.text).toBe('Content of article 1');
      expect(result.articles[1]?.content).toBeNull();
      expect(result.articles[1]?.contentError?.message).toBe('Failed to fetch content');
      expect(result.contentStats.successfulFetches).toBe(1);
      expect(result.contentStats.failedFetches).toBe(1);
    });

    it('should pass fetch options to content fetcher', async () => {
      const mockArticles: IArticleListResponse = {
        articles: [
          {
            url: 'https://example.com/article1',
            title: 'Test Article 1',
            seendate: '2023-01-01T00:00:00Z',
            socialimage: 'https://example.com/image1.jpg',
            domain: 'example.com',
            sourcelanguage: 'english',
            sourcecountry: 'US'
          }
        ],
        count: 1,
        status: 'success'
      };

      jest.spyOn(client, 'getArticles').mockResolvedValue(mockArticles);
      mockContentFetcher.fetchMultipleArticleContent.mockResolvedValue([]);

      const fetchOptions = {
        onProgress: jest.fn(),
        allowedDomains: ['example.com'],
        maxConcurrency: 2
      };

      await client.getArticlesWithContent({
        query: 'test query'
      }, fetchOptions);

      expect(mockContentFetcher.fetchMultipleArticleContent).toHaveBeenCalledWith(
        ['https://example.com/article1'],
        fetchOptions
      );
    });
  });

  describe('fetchContentForArticles', () => {
    it('should fetch content for provided articles', async () => {
      const articles = [
        {
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          seendate: '2023-01-01T00:00:00Z',
          socialimage: 'https://example.com/image1.jpg',
          domain: 'example.com',
          sourcelanguage: 'english',
          sourcecountry: 'US'
        }
      ];

      const mockContentResults = [
        {
          url: 'https://example.com/article1',
          success: true,
          content: {
            text: 'Content of article 1',
            wordCount: 50,
            metadata: {
              extractionMethod: 'readability' as const,
              extractionConfidence: 0.9
            },
            paywallDetected: false,
            qualityScore: 0.8
          },
          timing: {
            fetchTime: 1000,
            parseTime: 200,
            totalTime: 1200
          }
        }
      ];

      mockContentFetcher.fetchMultipleArticleContent.mockResolvedValue(mockContentResults);

      const result = await client.fetchContentForArticles(articles);

      expect(mockContentFetcher.fetchMultipleArticleContent).toHaveBeenCalledWith(
        ['https://example.com/article1'],
        undefined
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.content?.text).toBe('Content of article 1');
    });

    it('should handle empty articles array', async () => {
      const result = await client.fetchContentForArticles([]);

      expect(result).toHaveLength(0);
    });

    it('should calculate timing statistics correctly', async () => {
      const articles = [
        {
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          seendate: '2023-01-01T00:00:00Z',
          socialimage: 'https://example.com/image1.jpg',
          domain: 'example.com',
          sourcelanguage: 'english',
          sourcecountry: 'US'
        },
        {
          url: 'https://example.com/article2',
          title: 'Test Article 2',
          seendate: '2023-01-02T00:00:00Z',
          socialimage: 'https://example.com/image2.jpg',
          domain: 'example.com',
          sourcelanguage: 'english',
          sourcecountry: 'US'
        }
      ];

      const mockContentResults = [
        {
          url: 'https://example.com/article1',
          success: true,
          content: {
            text: 'Content 1',
            wordCount: 50,
            metadata: {
              extractionMethod: 'readability' as const,
              extractionConfidence: 0.9
            },
            paywallDetected: false,
            qualityScore: 0.8
          },
          timing: {
            fetchTime: 1000,
            parseTime: 200,
            totalTime: 1200
          }
        },
        {
          url: 'https://example.com/article2',
          success: true,
          content: {
            text: 'Content 2',
            wordCount: 75,
            metadata: {
              extractionMethod: 'readability' as const,
              extractionConfidence: 0.85
            },
            paywallDetected: false,
            qualityScore: 0.9
          },
          timing: {
            fetchTime: 1500,
            parseTime: 300,
            totalTime: 1800
          }
        }
      ];

      mockContentFetcher.fetchMultipleArticleContent.mockResolvedValue(mockContentResults);

      const result = await client.fetchContentForArticles(articles);

      expect(result).toHaveLength(2);
      expect(result[0]?.content?.text).toBe('Content 1');
      expect(result[1]?.content?.text).toBe('Content 2');
    });
  });
});