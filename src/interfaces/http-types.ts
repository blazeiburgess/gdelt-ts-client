/**
 * HTTP types for native fetch API wrapper
 * Replaces Axios types with fetch-compatible interfaces
 */

/**
 * Response interface compatible with the existing code patterns
 * Mirrors AxiosResponse structure for minimal refactoring impact
 */
export interface IFetchResponse<T = unknown> {
  /** Response data parsed from JSON */
  data: T;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
}

/**
 * Request configuration options for HTTP client
 */
export interface IRequestConfig {
  /** HTTP method (GET, POST, etc.) */
  method?: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body for POST/PUT */
  body?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Query parameters to append to URL */
  params?: Record<string, string | number | boolean | undefined>;
  /** Maximum redirects to follow (not used in native fetch, but kept for API compatibility) */
  maxRedirects?: number;
  /** Custom status validation function */
  validateStatus?: (status: number) => boolean;
}

/**
 * HTTP client configuration for creating instances
 */
export interface IHttpClientConfig {
  /** Base URL for all requests */
  baseURL?: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Default headers for all requests */
  headers?: Record<string, string>;
}

/**
 * Error interface for HTTP request failures
 */
export interface IHttpError extends Error {
  /** HTTP response if available */
  response?: IFetchResponse;
  /** Error code (e.g., 'ECONNABORTED', 'ENOTFOUND') */
  code?: string;
  /** Original request config */
  config?: IRequestConfig;
}
