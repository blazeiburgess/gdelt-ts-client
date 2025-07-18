/**
 * GDELT API TypeScript Client
 * A strongly-typed client for interacting with the GDELT API
 */

// Export constants
export * from './constants';

// Export interfaces
export * from './interfaces/api-parameters';
export * from './interfaces/api-responses';
export * from './interfaces/content-fetcher';
export * from './interfaces/content-responses';

// Export main client
export * from './client';

// Export enhanced TypeScript features as utilities
export * from './types/enhanced-types';
export * from './types/type-guards';
export * from './types/query-builder';
export * from './types/lookups';

// Export services and utilities
export * from './services/content-fetcher';
export * from './services/content-parser';
export * from './utils/rate-limiter';
export * from './utils/content-scraper';
export * from './config/content-fetcher-config';

// Export factory function for backward compatibility
export { GdeltClient as EnhancedGdeltClient } from './client';
export function createEnhancedGdeltClient(config?: import('./interfaces/api-parameters').IGdeltClientConfig): import('./client').GdeltClient {
  return new (require('./client').GdeltClient)(config);
}