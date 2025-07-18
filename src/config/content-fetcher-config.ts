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
 * Create default content fetcher configuration
 * @returns Default configuration object
 */
export function createDefaultContentFetcherConfig(): IContentFetcherConfig {
  // Use bracket notation for environment variables to satisfy TypeScript strict checks
  const env = process.env;
  
  return {
    concurrencyLimit: parseInt(env['GDELT_CLIENT_CONCURRENCY_LIMIT'] || '3', 10) || 3,
    requestDelay: parseInt(env['GDELT_CLIENT_REQUEST_DELAY'] || '500', 10) || 500,
    userAgent: env['GDELT_CLIENT_USER_AGENT'] || 'Unofficial-GDELT-TS-Client/1.0.0',
    timeout: parseInt(env['GDELT_CLIENT_TIMEOUT'] || '30000', 10) || 30000,
    maxRetries: parseInt(env['GDELT_CLIENT_MAX_RETRIES'] || '3', 10) || 3,
    maxRequestsPerSecond: parseInt(env['GDELT_CLIENT_MAX_REQUESTS_PER_SECOND'] || '1', 10) || 1,
    maxRequestsPerMinute: parseInt(env['GDELT_CLIENT_MAX_REQUESTS_PER_MINUTE'] || '30', 10) || 30,
    respectRobotsTxt: env['GDELT_CLIENT_RESPECT_ROBOTS_TXT'] !== 'false',
    followRedirects: env['GDELT_CLIENT_FOLLOW_REDIRECTS'] !== 'false',
    maxRedirects: parseInt(env['GDELT_CLIENT_MAX_REDIRECTS'] || '5', 10) || 5,
    skipDomains: env['GDELT_CLIENT_SKIP_DOMAINS']?.split(',') || [],
    customHeaders: parseCustomHeaders(env['GDELT_CLIENT_CUSTOM_HEADERS']),
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };
}

/**
 * Merge user configuration with defaults
 * @param userConfig - User-provided configuration
 * @returns Merged configuration
 */
export function mergeContentFetcherConfig(
  userConfig?: Partial<IContentFetcherConfig>
): IContentFetcherConfig {
  const defaults = createDefaultContentFetcherConfig();

  if (!userConfig) {
    return defaults;
  }

  // Filter out null/undefined values from userConfig
  const cleanUserConfig = Object.fromEntries(
    Object.entries(userConfig).filter(([, value]) => value !== null && value !== undefined)
  );

  return {
    ...defaults,
    ...cleanUserConfig
  };
}