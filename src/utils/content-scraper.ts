/**
 * Content scraper utility with robots.txt compliance
 */

/* eslint-disable @typescript-eslint/naming-convention */

import { RateLimiter } from './rate-limiter';
import { IRobotsInfo } from '../interfaces/content-fetcher';
import { IFetchResponse } from '../interfaces/http-types';

export class ContentScraper {
  private readonly _robotsCache: Map<string, IRobotsInfo>;
  private readonly _rateLimiter: RateLimiter;
  private readonly _userAgent: string;
  private readonly _timeout: number;

  /**
   * Create a new content scraper
   * @param userAgent - User agent string for requests
   * @param timeout - Request timeout in milliseconds
   * @param maxRequestsPerSecond - Maximum requests per second per domain
   * @param maxRequestsPerMinute - Maximum requests per minute per domain
   */
  public constructor(
    userAgent: string,
    timeout: number,
    maxRequestsPerSecond: number,
    maxRequestsPerMinute: number
  ) {
    this._robotsCache = new Map();
    this._rateLimiter = new RateLimiter(maxRequestsPerSecond, maxRequestsPerMinute);
    this._userAgent = userAgent;
    this._timeout = timeout;
  }

  /**
   * Check if a domain allows access according to robots.txt
   * @param domain - The domain to check
   * @returns True if access is allowed, false otherwise
   */
  public async checkRobotsTxt(domain: string): Promise<boolean> {
    const normalizedDomain = domain.toLowerCase();
    const now = Date.now();
    
    // Check cache first
    if (this._robotsCache.has(normalizedDomain)) {
      const cached = this._robotsCache.get(normalizedDomain)!;
      if (now < cached.expiresAt) {
        return cached.allowed;
      }
      // Remove expired cache entry
      this._robotsCache.delete(normalizedDomain);
    }
    
    try {
      const robotsInfo = await this._fetchRobotsTxt(normalizedDomain);
      this._robotsCache.set(normalizedDomain, robotsInfo);
      return robotsInfo.allowed;
    } catch (error) {
      console.warn(`Failed to fetch robots.txt for ${domain}:`, error);
      // If we can't fetch robots.txt, assume allowed but cache for shorter time
      const robotsInfo: IRobotsInfo = {
        allowed: true,
        expiresAt: now + 300000, // 5 minutes
        userAgentRules: []
      };
      this._robotsCache.set(normalizedDomain, robotsInfo);
      return true;
    }
  }

  /**
   * Make a respectful request to a URL
   * @param url - The URL to request
   * @param customHeaders - Optional custom headers
   * @returns Fetch response with data
   */
  public async respectfulRequest(
    url: string,
    customHeaders?: Record<string, string>
  ): Promise<IFetchResponse<string>> {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    // Check robots.txt
    const isAllowed = await this.checkRobotsTxt(domain);
    if (!isAllowed) {
      throw new Error(`Robots.txt disallows access to ${domain}`);
    }

    // Apply rate limiting
    await this._rateLimiter.waitForRateLimit(domain);

    // Make request with appropriate headers
    const headers: Record<string, string> = {
      'User-Agent': this._userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...customHeaders
    };

    // Set up timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this._timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      // Get response text
      const data = await response.text();

      // Extract headers into plain object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const result: IFetchResponse<string> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      };

      // Validate status (allow 4xx, reject 5xx)
      if (response.status >= 500) {
        const error = new Error(`Request failed with status code ${response.status}`) as Error & { response?: IFetchResponse<string> };
        error.response = result;
        throw error;
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`timeout of ${this._timeout}ms exceeded`) as Error & { code?: string };
        timeoutError.code = 'ECONNABORTED';
        throw timeoutError;
      }

      throw error;
    }
  }

  /**
   * Get rate limiter instance
   * @returns Rate limiter instance
   */
  public getRateLimiter(): RateLimiter {
    return this._rateLimiter;
  }

  /**
   * Clear robots.txt cache
   */
  public clearRobotsCache(): void {
    this._robotsCache.clear();
  }

  /**
   * Get robots.txt cache size
   * @returns Number of cached entries
   */
  public getRobotsCacheSize(): number {
    return this._robotsCache.size;
  }

  /**
   * Fetch and parse robots.txt for a domain
   * @param domain - The domain to fetch robots.txt for
   * @returns Robots.txt information
   * @private
   */
  private async _fetchRobotsTxt(domain: string): Promise<IRobotsInfo> {
    const robotsUrl = `https://${domain}/robots.txt`;
    const now = Date.now();

    // Set up timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout for robots.txt

    try {
      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this._userAgent
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      // Check for non-2xx response - treat as fetch failure
      if (!response.ok) {
        throw new Error(`robots.txt returned ${response.status}`);
      }

      const robotsText = await response.text();
      const allowed = this._parseRobotsTxt(robotsText);

      return {
        allowed,
        expiresAt: now + 3600000, // 1 hour
        userAgentRules: robotsText.split('\n').filter(line =>
          line.toLowerCase().includes('user-agent')
        )
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`Failed to fetch robots.txt for ${domain}:`, error);
      // If robots.txt is not accessible, assume allowed
      return {
        allowed: true,
        expiresAt: now + 1800000, // 30 minutes
        userAgentRules: []
      };
    }
  }

  /**
   * Parse robots.txt content to determine if access is allowed
   * @param robotsText - Raw robots.txt content
   * @returns True if access is allowed, false otherwise
   * @private
   */
  private _parseRobotsTxt(robotsText: string): boolean {
    const lines = robotsText.split('\n').map(line => line.trim().toLowerCase());
    let inRelevantSection = false;
    let currentUserAgent: string;
    let foundAllowForRelevantSection = false;
    let foundDisallowForRelevantSection = false;
    let isBotSpecificSection = false;
    
    // First pass: check for explicit rules for our user agent
    for (const line of lines) {
      if (line.startsWith('user-agent:')) {
        currentUserAgent = line.substring(11).trim();
        // Check if this section is for a bot-specific user agent
        isBotSpecificSection = currentUserAgent.includes('bot') || 
                              currentUserAgent.includes('crawler') ||
                              currentUserAgent.includes('gdelt');
                              
        // Check if this section applies to our user agent
        inRelevantSection = currentUserAgent === '*' || 
                           this._userAgent.toLowerCase().includes(currentUserAgent) ||
                           (isBotSpecificSection && (
                             this._userAgent.toLowerCase().includes('bot') ||
                             this._userAgent.toLowerCase().includes('crawler')
                           ));
      } else if (inRelevantSection) {
        if (line.startsWith('disallow:')) {
          const path = line.substring(9).trim();
          if (path === '/' || path === '') {
            // Disallow all or empty path means disallow all
            foundDisallowForRelevantSection = true;
            
            // If this is a bot-specific section with a disallow rule, immediately return false
            if (isBotSpecificSection) {
              return false;
            }
          }
        } else if (line.startsWith('allow:')) {
          const path = line.substring(6).trim();
          if (path === '/' || path === '') {
            // Allow all or empty path means allow all
            foundAllowForRelevantSection = true;
          }
        }
      }
    }
    
    // If we found an explicit allow rule for our user agent, allow access
    if (foundAllowForRelevantSection) {
      return true;
    }
    
    // If we found an explicit disallow rule for our user agent, deny access
    if (foundDisallowForRelevantSection) {
      return false;
    }
    
    // If no specific rules found, assume allowed
    return true;
  }
}