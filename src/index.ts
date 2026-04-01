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
export * from './interfaces/http-types';

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
export * from './utils/http-client';
export * from './config/content-fetcher-config';

// Export dispatcher configuration for advanced users
export {
  configureDispatcher,
  getConfiguredTimeout,
  isDispatcherConfigured
} from './utils/dispatcher-config';

// Export factory function for backward compatibility
import { GdeltClient } from './client';
import { IGdeltClientConfig } from './interfaces/api-parameters';
export { GdeltClient as EnhancedGdeltClient } from './client';
export function createEnhancedGdeltClient(config?: IGdeltClientConfig): GdeltClient {
  return new GdeltClient(config);
}