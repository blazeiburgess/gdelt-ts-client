/**
 * HTTP client utility wrapping native fetch API
 * Provides axios-like interface for minimal refactoring impact
 */

import {
  IFetchResponse,
  IRequestConfig,
  IHttpClientConfig,
  IHttpError
} from '../interfaces/http-types';

/**
 * Creates an HTTP error with consistent structure
 * @param message - Error message
 * @param code - Error code
 * @param response - Optional HTTP response
 * @returns Structured HTTP error
 */
function createHttpError(
  message: string,
  code?: string,
  response?: IFetchResponse
): IHttpError {
  const error = new Error(message) as IHttpError;
  error.name = 'HttpError';
  if (code) {
    error.code = code;
  }
  if (response) {
    error.response = response;
  }
  return error;
}

/**
 * Serializes query parameters to URL search string
 * @param params - Object with query parameters
 * @returns URL-encoded query string
 */
function serializeParams(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * Extracts headers from fetch Response into a plain object
 * @param headers - Fetch Headers object
 * @returns Plain object with header key-value pairs
 */
function extractHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * HTTP client class providing axios-like interface over native fetch
 */
export class HttpClient {
  private readonly _baseURL: string;
  private readonly _timeout: number;
  private readonly _headers: Record<string, string>;

  /**
   * Creates a new HTTP client instance
   * @param config - Client configuration options
   */
  public constructor(config?: IHttpClientConfig) {
    this._baseURL = config?.baseURL ?? '';
    this._timeout = config?.timeout ?? 30000;
    this._headers = config?.headers ?? {};
  }

  /**
   * Makes a GET request
   * @param url - URL path (appended to baseURL)
   * @param config - Request configuration
   * @returns Promise resolving to response with parsed data
   */
  public async get<T>(
    url: string,
    config?: IRequestConfig
  ): Promise<IFetchResponse<T>> {
    return this._request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * Makes a POST request
   * @param url - URL path (appended to baseURL)
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise resolving to response with parsed data
   */
  public async post<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig
  ): Promise<IFetchResponse<T>> {
    const requestConfig: IRequestConfig = {
      ...config,
      method: 'POST'
    };
    if (data !== undefined) {
      requestConfig.body = JSON.stringify(data);
    }
    return this._request<T>(url, requestConfig);
  }

  /**
   * Internal request method handling all HTTP operations
   * @param url - URL path
   * @param config - Request configuration
   * @returns Promise resolving to response with parsed data
   * @private
   */
  private async _request<T>(
    url: string,
    config?: IRequestConfig
  ): Promise<IFetchResponse<T>> {
    // Build full URL
    let fullUrl = this._baseURL + url;

    // Append query parameters if present
    if (config?.params) {
      const queryString = serializeParams(config.params);
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Set up timeout with AbortController
    const controller = new AbortController();
    const timeout = config?.timeout ?? this._timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge headers
    const headers: Record<string, string> = {
      ...this._headers,
      ...config?.headers
    };

    try {
      const fetchOptions: RequestInit = {
        method: config?.method ?? 'GET',
        headers,
        signal: controller.signal,
        redirect: 'follow'
      };

      // Only add body if it's defined (not undefined)
      if (config?.body !== undefined) {
        fetchOptions.body = config.body;
      }

      const response = await fetch(fullUrl, fetchOptions);

      clearTimeout(timeoutId);

      // Parse response
      const responseHeaders = extractHeaders(response.headers);
      const contentType = response.headers.get('content-type') ?? '';

      let data: T;
      if (contentType.includes('application/json')) {
        data = await response.json() as T;
      } else {
        // For non-JSON responses, return text as data
        data = await response.text() as unknown as T;
      }

      const result: IFetchResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      };

      // Check status with custom validator or default (throw on 4xx/5xx)
      const validateStatus = config?.validateStatus ?? ((status: number): boolean => status >= 200 && status < 300);

      if (!validateStatus(response.status)) {
        throw createHttpError(
          `Request failed with status code ${response.status}`,
          `HTTP_${response.status}`,
          result
        );
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw createHttpError(
          `timeout of ${timeout}ms exceeded`,
          'ECONNABORTED'
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw createHttpError(
          'Network Error',
          'ECONNREFUSED'
        );
      }

      // Re-throw HTTP errors
      if ((error as IHttpError).response) {
        throw error;
      }

      // Wrap other errors
      if (error instanceof Error) {
        throw createHttpError(error.message, 'UNKNOWN');
      }

      throw createHttpError('Unknown error occurred', 'UNKNOWN');
    }
  }
}

/**
 * Creates a new HTTP client instance (factory function matching axios.create pattern)
 * @param config - Client configuration
 * @returns New HttpClient instance
 */
export function createHttpClient(config?: IHttpClientConfig): HttpClient {
  return new HttpClient(config);
}
