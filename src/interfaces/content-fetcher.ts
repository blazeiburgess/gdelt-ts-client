/**
 * Interfaces for content fetcher configuration and options
 */

export interface IContentFetcherConfig {
  /**
   * Maximum number of concurrent requests
   * @default 5
   */
  concurrencyLimit?: number;

  /**
   * Delay between requests to the same domain (ms)
   * @default 1000
   */
  requestDelay?: number;

  /**
   * User agent string for requests
   * @default 'Unofficial-GDELT-TS-Client/1.0.0 (+https://github.com/your-repo)'
   */
  userAgent?: string;

  /**
   * Request timeout in milliseconds
   * @default 10000
   */
  timeout?: number;

  /**
   * Maximum number of retries per request
   * @default 2
   */
  maxRetries?: number;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatusCodes?: number[];

  /**
   * Maximum requests per second per domain
   * @default 1
   */
  maxRequestsPerSecond?: number;

  /**
   * Maximum requests per minute per domain
   * @default 30
   */
  maxRequestsPerMinute?: number;

  /**
   * Whether to respect robots.txt
   * @default true
   */
  respectRobotsTxt?: boolean;

  /**
   * Custom headers to include in requests
   */
  customHeaders?: Record<string, string>;

  /**
   * Domains to skip entirely
   */
  skipDomains?: string[];

  /**
   * Whether to follow redirects
   * @default true
   */
  followRedirects?: boolean;

  /**
   * Maximum number of redirects to follow
   * @default 5
   */
  maxRedirects?: number;
}

export interface IFetchContentOptions {
  /**
   * Override global concurrency limit for this request
   */
  concurrencyLimit?: number;

  /**
   * Skip articles from specific domains
   */
  skipDomains?: string[];

  /**
   * Only fetch content from specific domains
   */
  allowedDomains?: string[];

  /**
   * Include failed requests in the response
   * @default false
   */
  includeFailures?: boolean;

  /**
   * Progress callback for batch operations
   */
  onProgress?: (completed: number, total: number) => void;

  /**
   * Whether to parse and clean the content
   * @default true
   */
  parseContent?: boolean;

  /**
   * Whether to include raw HTML in the response
   * @default false
   */
  includeRawHTML?: boolean;

  /**
   * Maximum content length to fetch (bytes)
   * @default 1048576 (1MB)
   */
  maxContentLength?: number;
}

export interface IRobotsInfo {
  /**
   * Whether the domain allows access
   */
  allowed: boolean;

  /**
   * Cache expiration time
   */
  expiresAt: number;

  /**
   * User agent specific rules
   */
  userAgentRules?: string[];
}