/**
 * Rate limiter utility for domain-based request throttling
 */

export class RateLimiter {
  private readonly _requests: Map<string, number[]>;
  private readonly _maxRequestsPerSecond: number;
  private readonly _maxRequestsPerMinute: number;

  /**
   * Create a new rate limiter
   * @param maxRequestsPerSecond - Maximum requests per second per domain
   * @param maxRequestsPerMinute - Maximum requests per minute per domain
   */
  public constructor(maxRequestsPerSecond: number, maxRequestsPerMinute: number) {
    this._requests = new Map();
    this._maxRequestsPerSecond = maxRequestsPerSecond;
    this._maxRequestsPerMinute = maxRequestsPerMinute;
  }

  /**
   * Wait for rate limit to allow request to domain
   * @param domain - The domain to check rate limits for
   * @returns Promise that resolves when request can be made
   */
  public async waitForRateLimit(domain: string): Promise<void> {
    const now = Date.now();
    const normalizedDomain = domain.toLowerCase();
    
    // Get or create request history for this domain
    if (!this._requests.has(normalizedDomain)) {
      this._requests.set(normalizedDomain, []);
    }
    
    const requestHistory = this._requests.get(normalizedDomain)!;
    
    // Clean up old requests (older than 1 minute)
    const oneMinuteAgo = now - 60000;
    while (requestHistory.length > 0 && requestHistory[0]! < oneMinuteAgo) {
      requestHistory.shift();
    }
    
    // Check minute-based rate limit
    if (requestHistory.length >= this._maxRequestsPerMinute) {
      const oldestRequest = requestHistory[0]!;
      const waitTime = 60000 - (now - oldestRequest);
      if (waitTime > 0) {
        await this._delay(waitTime);
      }
    }
    
    // Check second-based rate limit
    const oneSecondAgo = now - 1000;
    const recentRequests = requestHistory.filter(timestamp => timestamp > oneSecondAgo);
    
    if (recentRequests.length >= this._maxRequestsPerSecond) {
      const oldestRecentRequest = recentRequests[0]!;
      const waitTime = 1000 - (now - oldestRecentRequest);
      if (waitTime > 0) {
        await this._delay(waitTime);
      }
    }
    
    // Record this request
    requestHistory.push(Date.now());
  }

  /**
   * Get current request count for a domain
   * @param domain - The domain to check
   * @returns Object with current request counts
   */
  public getRequestCount(domain: string): { perSecond: number; perMinute: number } {
    const normalizedDomain = domain.toLowerCase();
    const requestHistory = this._requests.get(normalizedDomain) || [];
    const now = Date.now();
    
    const oneSecondAgo = now - 1000;
    const oneMinuteAgo = now - 60000;
    
    const perSecond = requestHistory.filter(timestamp => timestamp > oneSecondAgo).length;
    const perMinute = requestHistory.filter(timestamp => timestamp > oneMinuteAgo).length;
    
    return { perSecond, perMinute };
  }

  /**
   * Reset rate limiting for a domain
   * @param domain - The domain to reset
   */
  public resetDomain(domain: string): void {
    const normalizedDomain = domain.toLowerCase();
    this._requests.delete(normalizedDomain);
  }

  /**
   * Reset all rate limiting
   */
  public resetAll(): void {
    this._requests.clear();
  }

  /**
   * Get rate limit configuration
   * @returns Rate limit configuration
   */
  public getConfig(): { maxRequestsPerSecond: number; maxRequestsPerMinute: number } {
    return {
      maxRequestsPerSecond: this._maxRequestsPerSecond,
      maxRequestsPerMinute: this._maxRequestsPerMinute
    };
  }

  /**
   * Check if domain is currently rate limited
   * @param domain - The domain to check
   * @returns True if rate limited, false otherwise
   */
  public isRateLimited(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    const requestHistory = this._requests.get(normalizedDomain) || [];
    const now = Date.now();
    
    const oneSecondAgo = now - 1000;
    const oneMinuteAgo = now - 60000;
    
    const recentRequests = requestHistory.filter(timestamp => timestamp > oneSecondAgo);
    const minuteRequests = requestHistory.filter(timestamp => timestamp > oneMinuteAgo);
    
    return recentRequests.length >= this._maxRequestsPerSecond || 
           minuteRequests.length >= this._maxRequestsPerMinute;
  }

  /**
   * Helper method to delay execution
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   * @private
   */
  private async _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}