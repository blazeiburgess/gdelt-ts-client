/**
 * Tests for HttpClient utility
 */

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/naming-convention */

import { HttpClient, createHttpClient } from '../utils/http-client';

// Create mock fetch function
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    // Replace global fetch with mock
    global.fetch = mockFetch;
    // Reset mock
    mockFetch.mockReset();

    // Create HTTP client instance
    httpClient = new HttpClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with default values', () => {
      const client = new HttpClient();
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should create client with custom config', () => {
      const client = new HttpClient({
        baseURL: 'https://custom.api.com',
        timeout: 10000
      });
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('createHttpClient factory', () => {
    it('should create HttpClient instance', () => {
      const client = createHttpClient({
        baseURL: 'https://api.test.com'
      });
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should create HttpClient with no config', () => {
      const client = createHttpClient();
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: 'test' }),
        text: async () => '{"data": "test"}',
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get<{ data: string }>('/test');

      expect(result.data).toEqual({ data: 'test' });
      expect(result.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should include query params in URL', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await httpClient.get('/test', {
        params: {
          query: 'test',
          limit: 10,
          active: true
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=test'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });

    it('should handle non-JSON responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'plain text response',
        headers: new Headers({ 'content-type': 'text/plain' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get<string>('/text');

      expect(result.data).toBe('plain text response');
    });

    it('should throw error on non-2xx status', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(httpClient.get('/notfound'))
        .rejects.toThrow('Request failed with status code 404');
    });

    it('should use custom validateStatus function', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      // With custom validateStatus that accepts 404
      const result = await httpClient.get('/notfound', {
        validateStatus: (status) => status < 500
      });

      expect(result.status).toBe(404);
    });

    it('should handle timeout with AbortController', async () => {
      // Mock fetch to never resolve (simulating timeout)
      mockFetch.mockImplementationOnce(
        async () => new Promise((_, reject) => {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 100);
        })
      );

      const quickClient = new HttpClient({
        timeout: 50
      });

      await expect(quickClient.get('/slow'))
        .rejects.toThrow(/timeout/);
    });

    it('should handle network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(httpClient.get('/test'))
        .rejects.toThrow('Network Error');
    });

    it('should rethrow HTTP errors with response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      let errorThrown = false;
      try {
        await httpClient.get('/error');
      } catch (error) {
        errorThrown = true;
        expect(error).toHaveProperty('response');
        expect((error as { response: { status: number } }).response.status).toBe(500);
      }
      expect(errorThrown).toBe(true);
    });

    it('should handle undefined params', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await httpClient.get('/test', {
        params: {
          defined: 'value',
          undefinedParam: undefined
        }
      });

      // Should not include undefined params
      const calledUrl = (mockFetch.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).not.toContain('undefinedParam');
      expect(calledUrl).toContain('defined=value');
    });
  });

  describe('post', () => {
    it('should make successful POST request with body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => ({ id: 1, created: true }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.post<{ id: number; created: boolean }>(
        '/create',
        { name: 'test' }
      );

      expect(result.data).toEqual({ id: 1, created: true });
      expect(result.status).toBe(201);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' })
        })
      );
    });

    it('should make POST request without body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await httpClient.post('/trigger');

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.body).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should wrap unknown errors', async () => {
      // Simulate an unknown error type
      mockFetch.mockRejectedValueOnce('string error');

      await expect(httpClient.get('/test'))
        .rejects.toThrow('Unknown error occurred');
    });

    it('should handle errors with existing response', async () => {
      const errorWithResponse = new Error('HTTP Error') as Error & { response?: { status: number } };
      errorWithResponse.response = { status: 500 };

      mockFetch.mockRejectedValueOnce(errorWithResponse);

      let errorThrown = false;
      try {
        await httpClient.get('/test');
      } catch (error) {
        errorThrown = true;
        expect((error as { response: { status: number } }).response.status).toBe(500);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe('URL building', () => {
    it('should append query params to URL with existing query string', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await httpClient.get('/test?existing=param', {
        params: { new: 'param' }
      });

      const calledUrl = (mockFetch.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain('existing=param');
      expect(calledUrl).toContain('new=param');
      expect(calledUrl).toContain('&');
    });
  });
});
