/**
 * Configuration utilities for content fetcher
 */

import { IContentFetcherConfig } from '../interfaces/content-fetcher';

/**
 * Parse custom headers from environment variable
 * @param headersString - JSON string of headers
 * @returns Parsed headers object
 */
function parseCustomHeaders(headersString?: string): Record<string, string> {
  if (!headersString) {
    return {};
  }

  try {
    const parsed = JSON.parse(headersString);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>;
    }
  } catch (error) {
    console.warn('Failed to parse GDELT_CUSTOM_HEADERS:', error);
  }

  return {};
}

/**
 * Create content fetcher configuration from environment variables
 * @returns Configuration object with environment variable overrides
 */
export function createContentFetcherConfig(): IContentFetcherConfig {
  return {
    concurrencyLimit: parseInt(process.env.GDELT_FETCH_CONCURRENCY || '5', 10),
    requestDelay: parseInt(process.env.GDELT_FETCH_DELAY || '1000', 10),
    userAgent: process.env.GDELT_USER_AGENT || 'Unofficial-GDELT-TS-Client/1.0.0',
    timeout: parseInt(process.env.GDELT_FETCH_TIMEOUT || '10000', 10),
    maxRetries: parseInt(process.env.GDELT_FETCH_MAX_RETRIES || '2', 10),
    maxRequestsPerSecond: parseInt(process.env.GDELT_FETCH_RPS || '1', 10),
    maxRequestsPerMinute: parseInt(process.env.GDELT_FETCH_RPM || '30', 10),
    respectRobotsTxt: process.env.GDELT_RESPECT_ROBOTS !== 'false',
    followRedirects: process.env.GDELT_FOLLOW_REDIRECTS !== 'false',
    maxRedirects: parseInt(process.env.GDELT_MAX_REDIRECTS || '5', 10),
    skipDomains: process.env.GDELT_SKIP_DOMAINS?.split(',') || [],
    customHeaders: parseCustomHeaders(process.env.GDELT_CUSTOM_HEADERS),
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };
}

/**
 * Merge user configuration with defaults
 * @param userConfig - User-provided configuration
 * @param envConfig - Environment-based configuration
 * @returns Merged configuration
 */
export function mergeContentFetcherConfig(
  userConfig?: IContentFetcherConfig,
  envConfig?: IContentFetcherConfig
): IContentFetcherConfig {
  const defaults: IContentFetcherConfig = {
    concurrencyLimit: 5,
    requestDelay: 1000,
    userAgent: 'Unofficial-GDELT-TS-Client/1.0.0',
    timeout: 10000,
    maxRetries: 2,
    maxRequestsPerSecond: 1,
    maxRequestsPerMinute: 30,
    respectRobotsTxt: true,
    followRedirects: true,
    maxRedirects: 5,
    skipDomains: [],
    customHeaders: {},
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };

  return {
    ...defaults,
    ...envConfig,
    ...userConfig
  };
}