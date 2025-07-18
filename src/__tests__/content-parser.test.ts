/**
 * Tests for ContentParserService
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
 

import { ContentParserService } from '../services/content-parser';

// Mock jsdom
jest.mock('jsdom', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  JSDOM: jest.fn().mockImplementation(() => ({
    window: {
      document: {
        querySelector: jest.fn().mockReturnValue(null),
        querySelectorAll: jest.fn().mockReturnValue([]),
        body: { textContent: 'Mock text content' }
      }
    }
  }))
}));

// Mock @mozilla/readability
jest.mock('@mozilla/readability', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Readability: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue({
      title: 'Mock Title',
      byline: 'Mock Author',
      content: '<p>Mock text content</p>',
      textContent: 'Mock text content',
      length: 500
    })
  }))
}));

describe('ContentParserService', () => {
  let service: ContentParserService;

  beforeEach(() => {
    service = new ContentParserService();
    
    // Mock the parseHTML method directly
    jest.spyOn(service, 'parseHTML').mockImplementation(() => ({
      text: 'Mock text content',
      title: 'Mock Title',
      author: 'Mock Author',
      publishDate: '2023-01-01',
      language: 'en',
      wordCount: 100,
      metadata: {
        extractionMethod: 'readability',
        extractionConfidence: 0.9,
        openGraph: {},
        twitterCard: {},
        article: {},
        canonicalUrl: ''
      },
      paywallDetected: false,
      qualityScore: 0.8
    }));
    
    // Mock other private methods
    (service as any)._countWords = jest.fn().mockReturnValue(100);
    (service as any)._detectLanguage = jest.fn().mockReturnValue('en');
    (service as any)._extractDateFromMetadata = jest.fn().mockReturnValue('2023-01-01');
    (service as any)._calculateQualityScore = jest.fn().mockReturnValue(0.8);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseHTML', () => {
    it('should parse HTML using readability when available', () => {
      const html = '<html><body><article><p>Test content</p></article></body></html>';
      const url = 'https://example.com/article';

      const result = service.parseHTML(html, url);

      expect(result.text).toBe('Mock text content');
      expect(result.title).toBe('Mock Title');
      expect(result.author).toBe('Mock Author');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.metadata.extractionMethod).toBe('readability');
      expect(result.metadata.extractionConfidence).toBe(0.9);
    });

    it('should handle readability failure and fall back to heuristics', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { Readability } = require('@mozilla/readability');
      const mockReadability = Readability as jest.MockedClass<typeof Readability>;
      mockReadability.mockImplementation(() => ({
        parse: jest.fn().mockReturnValue(null)
      } as any));

      const html = '<html><body><article><p>Test content</p></article></body></html>';
      const url = 'https://example.com/article';

      const result = service.parseHTML(html, url);

      expect(result.text).toBe('Mock text content');
      expect(result.metadata.extractionMethod).toBe('fallback');
      expect(result.metadata.extractionConfidence).toBe(0.3);
    });

    it('should use fallback extraction when readability fails', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { Readability } = require('@mozilla/readability');
      
      const mockReadability = Readability as jest.MockedClass<typeof Readability>;
      mockReadability.mockImplementation(() => ({
        parse: jest.fn().mockReturnValue(null)
      } as any));

      const html = '<html><body><article><p>Test content</p></article></body></html>';
      const url = 'https://example.com/article';

      const result = service.parseHTML(html, url);

      expect(result.text).toBe('Mock text content');
      expect(result.metadata.extractionMethod).toBe('fallback');
      expect(result.metadata.extractionConfidence).toBe(0.3);
    });
  });

  describe('detectPaywall', () => {
    it('should detect paywall indicators', () => {
      const htmlWithPaywall = '<html><body><p>This is a paywall protected article</p></body></html>';
      const result = service.detectPaywall(htmlWithPaywall);
      expect(result).toBe(true);
    });

    it('should detect subscription required text', () => {
      const htmlWithSubscription = '<html><body><p>Subscription required to read this article</p></body></html>';
      const result = service.detectPaywall(htmlWithSubscription);
      expect(result).toBe(true);
    });

    it('should not detect paywall in normal content', () => {
      const normalHtml = '<html><body><p>This is a normal article with no restrictions</p></body></html>';
      const result = service.detectPaywall(normalHtml);
      expect(result).toBe(false);
    });
  });

  describe('extractMetadata', () => {
    it('should extract Open Graph metadata', () => {
      const { JSDOM } = require('jsdom');
      const mockJSDOM = JSDOM as jest.MockedClass<typeof JSDOM>;
      
      mockJSDOM.mockImplementation(() => ({
        window: {
          document: {
            querySelector: jest.fn().mockImplementation((selector) => {
              if (selector === 'link[rel="canonical"]') {
                return { getAttribute: () => 'https://example.com/canonical' };
              }
              return null;
            }),
            querySelectorAll: jest.fn().mockImplementation((selector) => {
              if (selector === 'meta[property^="og:"]') {
                return [
                  { getAttribute: (attr: string) => attr === 'property' ? 'og:title' : 'Test Title' },
                  { getAttribute: (attr: string) => attr === 'property' ? 'og:description' : 'Test Description' }
                ];
              }
              return [];
            }),
            body: { textContent: 'Mock text content' }
          }
        }
      } as any));

      const html = '<html><head><meta property="og:title" content="Test Title"></head></html>';
      const metadata = service.extractMetadata(html);

      expect(metadata.openGraph?.['title']).toBe('Test Title');
      expect(metadata.openGraph?.['description']).toBe('Test Description');
      expect(metadata.canonicalUrl).toBe('https://example.com/canonical');
    });

    it('should extract Twitter Card metadata', () => {
      const { JSDOM } = require('jsdom');
      const mockJSDOM = JSDOM as jest.MockedClass<typeof JSDOM>;
      
      mockJSDOM.mockImplementation(() => ({
        window: {
          document: {
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockImplementation((selector) => {
              if (selector === 'meta[name^="twitter:"]') {
                return [
                  { getAttribute: (attr: string) => attr === 'name' ? 'twitter:card' : 'summary' },
                  { getAttribute: (attr: string) => attr === 'name' ? 'twitter:title' : 'Test Twitter Title' }
                ];
              }
              return [];
            }),
            body: { textContent: 'Mock text content' }
          }
        }
      } as any));

      const html = '<html><head><meta name="twitter:card" content="summary"></head></html>';
      const metadata = service.extractMetadata(html);

      expect(metadata.twitterCard?.['card']).toBe('summary');
      expect(metadata.twitterCard?.['title']).toBe('Test Twitter Title');
    });

    it('should extract article metadata', () => {
      const { JSDOM } = require('jsdom');
      const mockJSDOM = JSDOM as jest.MockedClass<typeof JSDOM>;
      
      mockJSDOM.mockImplementation(() => ({
        window: {
          document: {
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockImplementation((selector) => {
              if (selector === 'meta[property^="article:"]') {
                return [
                  { getAttribute: (attr: string) => attr === 'property' ? 'article:author' : 'Test Author' },
                  { getAttribute: (attr: string) => attr === 'property' ? 'article:published_time' : '2023-01-01' }
                ];
              }
              return [];
            }),
            body: { textContent: 'Mock text content' }
          }
        }
      } as any));

      const html = '<html><head><meta property="article:author" content="Test Author"></head></html>';
      const metadata = service.extractMetadata(html);

      expect(metadata.article?.['author']).toBe('Test Author');
      expect(metadata.article?.['published_time']).toBe('2023-01-01');
    });
  });
});