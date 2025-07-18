/**
 * Content scraper utility with robots.txt compliance
 */

/* eslint-disable @typescript-eslint/naming-convention */

import axios, { AxiosResponse } from 'axios';
import { RateLimiter } from './rate-limiter';
import { IRobotsInfo } from '../interfaces/content-fetcher';

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
   * @returns Axios response
   */
  public async respectfulRequest(
    url: string, 
    customHeaders?: Record<string, string>
  ): Promise<AxiosResponse> {
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
    const headers = {
      'User-Agent': this._userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...customHeaders
    };

    return axios.get(url, {
      headers,
      timeout: this._timeout,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Allow 4xx errors to be handled by caller
    });
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
    
    try {
      const response = await axios.get(robotsUrl, {
        headers: {
          'User-Agent': this._userAgent
        },
        timeout: 5000, // Shorter timeout for robots.txt
        maxRedirects: 3
      });
      
      const robotsText = response.data as string;
      const allowed = this._parseRobotsTxt(robotsText);
      
      return {
        allowed,
        expiresAt: now + 3600000, // 1 hour
        userAgentRules: robotsText.split('\n').filter(line => 
          line.toLowerCase().includes('user-agent')
        )
      };
    } catch (error) {
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
    let currentUserAgent = '';
    
    for (const line of lines) {
      if (line.startsWith('user-agent:')) {
        currentUserAgent = line.substring(11).trim();
        inRelevantSection = currentUserAgent === '*' || 
                           currentUserAgent.includes('gdelt') ||
                           currentUserAgent.includes('bot') ||
                           currentUserAgent.includes('crawler');
      } else if (line.startsWith('disallow:') && inRelevantSection) {
        const path = line.substring(9).trim();
        if (path === '/' || path === '') {
          // Disallow all or empty path means disallow all
          return false;
        }
      } else if (line.startsWith('allow:') && inRelevantSection) {
        const path = line.substring(6).trim();
        if (path === '/' || path === '') {
          // Allow all or empty path means allow all
          return true;
        }
      }
    }
    
    // If no specific rules found, assume allowed
    return true;
  }
}