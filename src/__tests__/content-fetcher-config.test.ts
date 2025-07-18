/**
 * Tests for content fetcher configuration utility
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { createDefaultContentFetcherConfig, mergeContentFetcherConfig } from '../config/content-fetcher-config';
import { IContentFetcherConfig } from '../interfaces/content-fetcher';

describe('Content Fetcher Configuration', () => {
  describe('createDefaultContentFetcherConfig', () => {
    it('should create default configuration', () => {
      const config = createDefaultContentFetcherConfig();
      
      expect(config.concurrencyLimit).toBe(3);
      expect(config.requestDelay).toBe(500);
      expect(config.userAgent).toBe('Unofficial-GDELT-TS-Client/1.0.0');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.maxRequestsPerSecond).toBe(1);
      expect(config.maxRequestsPerMinute).toBe(30);
      expect(config.respectRobotsTxt).toBe(true);
      expect(config.followRedirects).toBe(true);
      expect(config.maxRedirects).toBe(5);
      expect(config.skipDomains).toEqual([]);
      expect(config.customHeaders).toEqual({});
      expect(config.retryableStatusCodes).toEqual([408, 429, 500, 502, 503, 504]);
    });

    it('should use environment variables when available', () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        GDELT_CLIENT_USER_AGENT: 'Custom-Agent/2.0.0',
        GDELT_CLIENT_TIMEOUT: '60000',
        GDELT_CLIENT_MAX_RETRIES: '5',
        GDELT_CLIENT_CONCURRENCY_LIMIT: '5',
        GDELT_CLIENT_REQUEST_DELAY: '1000',
        GDELT_CLIENT_MAX_REQUESTS_PER_SECOND: '2',
        GDELT_CLIENT_MAX_REQUESTS_PER_MINUTE: '60',
        GDELT_CLIENT_RESPECT_ROBOTS_TXT: 'false',
        GDELT_CLIENT_FOLLOW_REDIRECTS: 'false',
        GDELT_CLIENT_MAX_REDIRECTS: '3'
      };

      const config = createDefaultContentFetcherConfig();
      
      expect(config.userAgent).toBe('Custom-Agent/2.0.0');
      expect(config.timeout).toBe(60000);
      expect(config.maxRetries).toBe(5);
      expect(config.concurrencyLimit).toBe(5);
      expect(config.requestDelay).toBe(1000);
      expect(config.maxRequestsPerSecond).toBe(2);
      expect(config.maxRequestsPerMinute).toBe(60);
      expect(config.respectRobotsTxt).toBe(false);
      expect(config.followRedirects).toBe(false);
      expect(config.maxRedirects).toBe(3);
      
      process.env = originalEnv;
    });

    it('should handle invalid environment variables gracefully', () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        GDELT_CLIENT_TIMEOUT: 'invalid',
        GDELT_CLIENT_MAX_RETRIES: 'not-a-number',
        GDELT_CLIENT_RESPECT_ROBOTS_TXT: 'maybe'
      };

      const config = createDefaultContentFetcherConfig();
      
      // Should fall back to defaults for invalid values
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.respectRobotsTxt).toBe(true);
      
      process.env = originalEnv;
    });
  });

  describe('mergeContentFetcherConfig', () => {
    it('should merge custom config with defaults', () => {
      const customConfig: Partial<IContentFetcherConfig> = {
        concurrencyLimit: 5,
        userAgent: 'Custom-Agent',
        timeout: 60000,
        customHeaders: {
          'X-Custom-Header': 'value'
        }
      };

      const config = mergeContentFetcherConfig(customConfig);
      
      expect(config.concurrencyLimit).toBe(5);
      expect(config.userAgent).toBe('Custom-Agent');
      expect(config.timeout).toBe(60000);
      expect(config.customHeaders).toEqual({ 'X-Custom-Header': 'value' });
      
      // Should keep defaults for unspecified values
      expect(config.requestDelay).toBe(500);
      expect(config.maxRetries).toBe(3);
      expect(config.respectRobotsTxt).toBe(true);
    });

    it('should merge arrays correctly', () => {
      const customConfig: Partial<IContentFetcherConfig> = {
        skipDomains: ['example.com', 'test.com'],
        retryableStatusCodes: [408, 429, 500]
      };

      const config = mergeContentFetcherConfig(customConfig);
      
      expect(config.skipDomains).toEqual(['example.com', 'test.com']);
      expect(config.retryableStatusCodes).toEqual([408, 429, 500]);
    });

    it('should merge objects correctly', () => {
      const customConfig: Partial<IContentFetcherConfig> = {
        customHeaders: {
          'X-Custom-Header': 'value1',
          'X-Another-Header': 'value2'
        }
      };

      const config = mergeContentFetcherConfig(customConfig);
      
      expect(config.customHeaders).toEqual({
        'X-Custom-Header': 'value1',
        'X-Another-Header': 'value2'
      });
    });

    it('should handle empty custom config', () => {
      const config = mergeContentFetcherConfig({});
      const defaultConfig = createDefaultContentFetcherConfig();
      
      expect(config).toEqual(defaultConfig);
    });

    it('should handle undefined custom config', () => {
      const config = mergeContentFetcherConfig(undefined);
      const defaultConfig = createDefaultContentFetcherConfig();
      
      expect(config).toEqual(defaultConfig);
    });

    it('should override default values completely', () => {
      const customConfig: Partial<IContentFetcherConfig> = {
        skipDomains: ['only-this.com'],
        retryableStatusCodes: [500],
        customHeaders: {
          'Only-This-Header': 'value'
        }
      };

      const config = mergeContentFetcherConfig(customConfig);
      
      expect(config.skipDomains).toEqual(['only-this.com']);
      expect(config.retryableStatusCodes).toEqual([500]);
      expect(config.customHeaders).toEqual({ 'Only-This-Header': 'value' });
    });
  });

  describe('configuration validation', () => {
    it('should handle edge case values', () => {
      const customConfig: Partial<IContentFetcherConfig> = {
        concurrencyLimit: 0,
        requestDelay: -1,
        timeout: 0,
        maxRetries: -1,
        maxRequestsPerSecond: 0,
        maxRequestsPerMinute: 0,
        maxRedirects: -1
      };

      const config = mergeContentFetcherConfig(customConfig);
      
      // Should accept these values even if they're unusual
      expect(config.concurrencyLimit).toBe(0);
      expect(config.requestDelay).toBe(-1);
      expect(config.timeout).toBe(0);
      expect(config.maxRetries).toBe(-1);
      expect(config.maxRequestsPerSecond).toBe(0);
      expect(config.maxRequestsPerMinute).toBe(0);
      expect(config.maxRedirects).toBe(-1);
    });

    it('should handle null and undefined values in custom config', () => {
      const customConfig = {
        concurrencyLimit: null,
        userAgent: undefined,
        timeout: null,
        customHeaders: null
      } as any;

      const config = mergeContentFetcherConfig(customConfig);
      
      // Should use defaults for null/undefined values
      expect(config.concurrencyLimit).toBe(3);
      expect(config.userAgent).toBe('Unofficial-GDELT-TS-Client/1.0.0');
      expect(config.timeout).toBe(30000);
      expect(config.customHeaders).toEqual({});
    });
  });
});