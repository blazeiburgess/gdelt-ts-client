/**
 * Content fetcher service with concurrent processing and retry logic
 */

import { ContentScraper } from '../utils/content-scraper';
import { ContentParserService } from './content-parser';
import { IContentFetcherConfig, IFetchContentOptions } from '../interfaces/content-fetcher';
import { IArticleContentResult, IArticleContent } from '../interfaces/content-responses';
import { mergeContentFetcherConfig } from '../config/content-fetcher-config';

export class ContentFetcherService {
  private readonly _contentScraper: ContentScraper;
  private readonly _contentParser: ContentParserService;
  private readonly _config: IContentFetcherConfig;

  /**
   * Create a new content fetcher service
   * @param config - Configuration options
   */
  public constructor(config?: IContentFetcherConfig) {
    this._config = mergeContentFetcherConfig(config);

    // Initialize content scraper
    this._contentScraper = new ContentScraper(
      this._config.userAgent ?? 'Unofficial-GDELT-TS-Client/1.0.0',
      this._config.timeout ?? 30000,
      this._config.maxRequestsPerSecond ?? 1,
      this._config.maxRequestsPerMinute ?? 30
    );

    // Initialize content parser
    this._contentParser = new ContentParserService();
  }

  /**
   * Fetch content for a single article URL
   * @param url - The URL to fetch content from
   * @param options - Optional fetch options
   * @returns Promise that resolves to article content result
   */
  public async fetchArticleContent(
    url: string,
    options?: IFetchContentOptions
  ): Promise<IArticleContentResult> {
    const startTime = Date.now();
    let fetchTime = 0;
    let parseTime = 0;
    let retryCount = 0;

    try {
      // Check if domain should be skipped
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.toLowerCase();
      
      const skipDomains = options?.skipDomains ?? this._config.skipDomains ?? [];
      const allowedDomains = options?.allowedDomains;
      
      if (skipDomains.includes(domain)) {
        throw new Error(`Domain ${domain} is in skip list`);
      }
      
      if (allowedDomains && !allowedDomains.includes(domain)) {
        throw new Error(`Domain ${domain} is not in allowed domains list`);
      }

      // Check robots.txt if enabled
      if (this._config.respectRobotsTxt) {
        const robotsAllowed = await this._contentScraper.checkRobotsTxt(domain);
        if (!robotsAllowed) {
          throw new Error(`Robots.txt disallows access to ${domain}`);
        }
      }

      // Fetch content with retry logic
      const fetchStartTime = Date.now();
      const response = await this._fetchWithRetry(url, retryCount);
      fetchTime = Date.now() - fetchStartTime;

      // Parse content if requested
      const parseStartTime = Date.now();
      let content: IArticleContent | undefined;
      
      if (options?.parseContent !== false) {
        content = this._contentParser.parseHTML(response.data, url);
        
        // Add raw HTML if requested
        if (options?.includeRawHTML) {
          content.rawHTML = response.data;
        }
      }
      
      parseTime = Date.now() - parseStartTime;

      const result: IArticleContentResult = {
        url,
        success: true,
        timing: {
          fetchTime,
          parseTime,
          totalTime: Date.now() - startTime
        }
      };
      
      if (content) {
        result.content = content;
      }
      
      return result;

    } catch (error) {
      const result: IArticleContentResult = {
        url,
        success: false,
        timing: {
          fetchTime,
          parseTime,
          totalTime: Date.now() - startTime
        }
      };
      
      const statusCode = this._getStatusCode(error);
      result.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: this._getErrorCode(error),
        retryCount
      };
      
      if (statusCode !== undefined) {
        result.error.statusCode = statusCode;
      }
      
      return result;
    }
  }

  /**
   * Fetch content for multiple article URLs with concurrency control
   * @param urls - Array of URLs to fetch content from
   * @param options - Optional fetch options
   * @returns Promise that resolves to array of article content results
   */
  public async fetchMultipleArticleContent(
    urls: string[],
    options?: IFetchContentOptions
  ): Promise<IArticleContentResult[]> {
    // const concurrencyLimit = options?.concurrencyLimit || this._config.concurrencyLimit || 5;
    // const limit = pLimit(concurrencyLimit);
    const limit = async (fn: () => Promise<any>) => fn();
    const results: IArticleContentResult[] = [];

    // Group URLs by domain for better rate limiting
    const urlsByDomain = this._groupUrlsByDomain(urls);
    let completed = 0;

    for (const [, domainUrls] of Object.entries(urlsByDomain)) {
      // Process URLs for this domain with concurrency control
      const domainResults = await Promise.all(
        domainUrls.map(async url => limit(async () => {
          const result = await this.fetchArticleContent(url, options);
          completed++;
          
          // Report progress if callback provided
          if (options?.onProgress) {
            options.onProgress(completed, urls.length);
          }
          
          return result;
        }))
      );

      results.push(...domainResults);

      // Add delay between domains to be respectful
      if (this._config.requestDelay && this._config.requestDelay > 0) {
        await this._delay(this._config.requestDelay);
      }
    }

    return results;
  }

  /**
   * Get configuration
   * @returns Current configuration
   */
  public getConfig(): IContentFetcherConfig {
    return { ...this._config };
  }

  /**
   * Get content scraper instance
   * @returns Content scraper instance
   */
  public getContentScraper(): ContentScraper {
    return this._contentScraper;
  }

  /**
   * Get content parser instance
   * @returns Content parser instance
   */
  public getContentParser(): ContentParserService {
    return this._contentParser;
  }

  /**
   * Fetch content with retry logic
   * @param url - URL to fetch
   * @param retryCount - Current retry count
   * @returns Promise that resolves to response
   * @private
   */
  private async _fetchWithRetry(url: string, retryCount: number): Promise<any> {
    const maxRetries = this._config.maxRetries ?? 2;
    const retryableStatusCodes = this._config.retryableStatusCodes ?? [408, 429, 500, 502, 503, 504];

    try {
      const response = await this._contentScraper.respectfulRequest(url, this._config.customHeaders);
      return response;
    } catch (error) {
      const statusCode = this._getStatusCode(error);
      
      if (retryCount < maxRetries && statusCode && retryableStatusCodes.includes(statusCode)) {
        retryCount++;
        const delay = 1000; // Default retry delay
        await this._delay(delay * retryCount); // Exponential backoff
        return this._fetchWithRetry(url, retryCount);
      }
      
      throw error;
    }
  }

  /**
   * Group URLs by domain for better rate limiting
   * @param urls - Array of URLs
   * @returns Object with domain as key and URLs as value
   * @private
   */
  private _groupUrlsByDomain(urls: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    
    for (const url of urls) {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        grouped[domain] ??= [];
        grouped[domain]!.push(url);
      } catch (error) {
        // Skip invalid URLs
        console.warn(`Invalid URL: ${url}: ${(error as Error).message}`);
      }
    }
    
    return grouped;
  }

  /**
   * Get error code from error object
   * @param error - Error object
   * @returns Error code string
   * @private
   */
  private _getErrorCode(error: any): string {
    if (error?.code) {
      return error.code;
    }
    
    if (error?.response?.status) {
      return `HTTP_${error.response.status}`;
    }
    
    if (error?.message?.includes('timeout')) {
      return 'TIMEOUT';
    }
    
    if (error?.message?.includes('robots.txt')) {
      return 'ROBOTS_DISALLOWED';
    }
    
    return 'UNKNOWN';
  }

  /**
   * Get HTTP status code from error object
   * @param error - Error object
   * @returns HTTP status code or undefined
   * @private
   */
  private _getStatusCode(error: any): number | undefined {
    return error?.response?.status;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   * @private
   */
  private async _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}