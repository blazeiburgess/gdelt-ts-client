import { GdeltClient, EFormat, EMode, ETimespanUnit, ETranslation, ESort, ETimeZoom } from '../';
import axios, { AxiosInstance } from 'axios';

// Mock axios to avoid making actual API calls during tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GdeltClient', () => {
  let client: GdeltClient;
  let mockGet: jest.Mock;

  beforeEach(() => {
    // Reset axios mocks
    mockedAxios.create.mockClear();
    
    // Create a mock get function with default response
    mockGet = jest.fn().mockImplementation(async (_url, options) => {
      // Check if this is a tone chart request
      if (options?.params?.mode === 'tonechart') {
        return Promise.resolve({
          data: { 
            status: 'ok', 
            tonechart: [
              { bin: -10, count: 5, toparts: [] },
              { bin: 0, count: 10, toparts: [] },
              { bin: 10, count: 3, toparts: [] }
            ]
          }
        });
      }
      
      // Default response for other requests
      return Promise.resolve({
        data: { status: 'ok', articles: [], count: 0 }
      });
    });
    
    // Mock axios.create to return an object with a get method
    mockedAxios.create.mockReturnValue({
      get: mockGet
    } as unknown as AxiosInstance);
    
    // Create a new client instance after setting up mocks
    client = new GdeltClient();
  });

  describe('constructor', () => {
    it('should create a client with default configuration', () => {
      expect(client).toBeInstanceOf(GdeltClient);
      
      // Use mock.calls directly to avoid unbound method error
      const mockCalls = mockedAxios.create.mock.calls;
      expect(mockCalls.length).toBeGreaterThan(0);
      
      // Check the configuration
      const configCall = mockCalls[0];
      expect(configCall).toBeDefined();
      
      // Use optional chaining to safely access properties
      const config = configCall?.[0];
      expect(config).toBeDefined();
      expect(config?.baseURL).toBe('https://api.gdeltproject.org/api/v2/doc/doc');
      expect(config?.timeout).toBe(30000);
    });

    it('should create a client with custom configuration', () => {
      const customClient = new GdeltClient({
        baseUrl: 'https://custom-api.example.com',
        timeout: 5000,
        defaultFormat: EFormat.json,
        retry: false
      });

      expect(customClient).toBeInstanceOf(GdeltClient);
      
      // Use mock.calls directly to avoid unbound method error
      const mockCalls = mockedAxios.create.mock.calls;
      expect(mockCalls.length).toBeGreaterThan(1);
      
      // Check the configuration
      const configCall = mockCalls[mockCalls.length - 1];
      expect(configCall).toBeDefined();
      
      // Use optional chaining to safely access properties
      const config = configCall?.[0];
      expect(config).toBeDefined();
      expect(config?.baseURL).toBe('https://custom-api.example.com');
      expect(config?.timeout).toBe(5000);
    });
  });

  describe('createTimespan', () => {
    it('should create a timespan string', () => {
      const timespan = client.createTimespan(1, ETimespanUnit.days);
      expect(timespan).toBe('1d');
    });

    it('should create a timespan string with different units', () => {
      expect(client.createTimespan(30, ETimespanUnit.minutes)).toBe('30min');
      expect(client.createTimespan(2, ETimespanUnit.hours)).toBe('2h');
      expect(client.createTimespan(1, ETimespanUnit.weeks)).toBe('1w');
      expect(client.createTimespan(3, ETimespanUnit.months)).toBe('3m');
    });
  });

  describe('_buildQueryParams', () => {
    // Create a custom method to test _buildQueryParams without overriding format
    const testBuildQueryParams = async (params: Record<string, unknown>): Promise<void> => {
      // Create a custom client for this test
      const testClient = new GdeltClient();
      
      // Create a custom method that doesn't override format
      const customMethod = async (params: Record<string, unknown>): Promise<unknown> => {
        // Access private method using indexing to avoid naming convention errors
        const makeRequestFn = (testClient as unknown as Record<string, Function>)['_makeRequest'];
        
        // Check if makeRequestFn is defined
        if (!makeRequestFn) {
          throw new Error('_makeRequest method not found on testClient');
        }
        
        // Add await to satisfy require-await rule
        return await makeRequestFn.call(testClient, {
          ...params
        });
      };
      
      // Replace the axios instance's get method with our mock
      // Access private property using indexing to avoid naming convention errors
      (testClient as unknown as Record<string, unknown>)['_axiosInstance'] = { get: mockGet };
      
      // Call the custom method
      try {
        await customMethod(params);
      } catch {
        // Ignore errors, we just want to check the params
        // No variable needed since we're not using it
      }
    };
    
    it('should include callback parameter when format is JSONP', async () => {
      await testBuildQueryParams({ 
        query: 'test query', 
        format: EFormat.jsonp,
        callback: 'myCallback'
      });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          format: EFormat.jsonp,
          callback: 'myCallback'
        })
      });
    });
    
    it('should not include callback parameter when format is not JSONP', async () => {
      await testBuildQueryParams({ 
        query: 'test query', 
        format: EFormat.json,
        callback: 'myCallback'
      });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.not.objectContaining({
          callback: 'myCallback'
        })
      });
    });
    
    it('should use default format when no format is specified', async () => {
      // Create a client with a specific default format
      const defaultFormatClient = new GdeltClient({
        defaultFormat: EFormat.csv
      });
      
      // Replace the axios instance's get method with our mock
      // Access private property using indexing to avoid naming convention errors
      (defaultFormatClient as unknown as Record<string, unknown>)['_axiosInstance'] = { get: mockGet };
      
      // Reset the mock
      mockGet.mockClear();
      
      // Call a method without specifying format
      try {
        // Access private method using indexing to avoid naming convention errors
        const makeRequestFn = (defaultFormatClient as unknown as Record<string, Function>)['_makeRequest'];
        
        // Check if makeRequestFn is defined
        if (!makeRequestFn) {
          throw new Error('_makeRequest method not found on defaultFormatClient');
        }
        
        await makeRequestFn.call(defaultFormatClient, {
          query: 'test query'
        });
      } catch {
        // Ignore errors, we just want to check the params
        // No variable needed since we're not using it
      }
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          format: EFormat.csv
        })
      });
    });
    
    it('should include all optional parameters when provided', async () => {
      await client.getArticles({ 
        query: 'test query',
        timespan: '1d',
        startdatetime: '20250101000000',
        enddatetime: '20250102000000',
        maxrecords: 100,
        timelinesmooth: 5,
        trans: ETranslation.googleTranslate,
        sort: ESort.dateDesc,
        timezoom: ETimeZoom.enabled
      });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          timespan: '1d',
          startdatetime: '20250101000000',
          enddatetime: '20250102000000',
          maxrecords: 100,
          timelinesmooth: 5,
          trans: ETranslation.googleTranslate,
          sort: ESort.dateDesc,
          timezoom: ETimeZoom.enabled
        })
      });
    });
  });
  
  describe('retry logic', () => {
    beforeEach(() => {
      // Reset the mock before each test
      mockGet.mockClear();
      
      // Create a new client with shorter retry delay for faster tests
      client = new GdeltClient({
        retry: true,
        maxRetries: 2,
        retryDelay: 10
      });
    });
    
    it('should retry failed requests', async () => {
      // Mock the get method to fail twice and then succeed
      mockGet
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { status: 'ok', articles: [], count: 0 }
        });
      
      await client.getArticles({ query: 'test query' });
      
      // Should have been called 3 times (initial + 2 retries)
      expect(mockGet).toHaveBeenCalledTimes(3);
    });
    
    it('should throw an error after max retries', async () => {
      // Mock the get method to always fail
      mockGet.mockRejectedValue(new Error('Network error'));
      
      await expect(client.getArticles({ query: 'test query' }))
        .rejects.toThrow('Network error');
      
      // Should have been called 3 times (initial + 2 retries)
      expect(mockGet).toHaveBeenCalledTimes(3);
    });
    
    it('should not retry when retry option is disabled', async () => {
      // Create a client with retry disabled
      const noRetryClient = new GdeltClient({ retry: false });
      
      // Reset the mock
      mockGet.mockClear();
      
      // Mock the get method to fail
      mockGet.mockRejectedValue(new Error('Network error'));
      
      await expect(noRetryClient.getArticles({ query: 'test query' }))
        .rejects.toThrow('Network error');
      
      // Should have been called only once (no retries)
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('_makeRequest', () => {
    beforeEach(() => {
      // Reset the mock before each test
      mockGet.mockClear();
    });
    
    it('should throw an error when API returns a string response', async () => {
      // Mock the get method to return a string response
      mockGet.mockResolvedValue({
        data: 'API Error: Invalid query'
      });
      
      // Expect the method to throw an error with the string response
      await expect(client.getArticles({ query: 'test query' }))
        .rejects.toThrow('API Error: Invalid query');
    });
    
    it('should add status property when missing from response', async () => {
      // Mock the get method to return a response without status
      mockGet.mockResolvedValue({
        data: { articles: [{ title: 'Test Article' }] }
      });
      
      const result = await client.getArticles({ query: 'test query' });
      
      // Expect the status to be added with value 'ok'
      expect(result.status).toBe('ok');
    });
    
    it('should add count property for image responses when missing', async () => {
      // Mock the get method to return an image response without count
      mockGet.mockResolvedValue({
        data: { 
          status: 'ok', 
          images: [
            { url: 'https://example.com/image1.jpg' },
            { url: 'https://example.com/image2.jpg' }
          ]
        }
      });
      
      const result = await client.getImages({ query: 'test query' });
      
      // Expect the count to be added with the length of the images array
      expect(result.count).toBe(2);
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      // Reset the mock before each test
      mockGet.mockClear();
      
      // Reset the mock to use the same implementation as in the main beforeEach
      mockGet.mockImplementation(async (_url, options) => {
        // Check if this is a tone chart request
        if (options?.params?.mode === 'tonechart') {
          return Promise.resolve({
            data: { 
              status: 'ok', 
              tonechart: [
                { bin: -10, count: 5, toparts: [] },
                { bin: 0, count: 10, toparts: [] },
                { bin: 10, count: 3, toparts: [] }
              ]
            }
          });
        }
        
        // Default response for other requests
        return Promise.resolve({
          data: { status: 'ok', articles: [], count: 0 }
        });
      });
    });

    it('should call getArticles with correct parameters', async () => {
      await client.getArticles({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.articleList,
          format: EFormat.json
        })
      });
    });

    it('should call getImages with correct parameters', async () => {
      await client.getImages({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.imageCollageInfo,
          format: EFormat.json
        })
      });
    });

    it('should call getTimeline with correct parameters', async () => {
      await client.getTimeline({ 
        query: 'test query',
        timespan: client.createTimespan(1, ETimespanUnit.weeks)
      });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.timelineVolume,
          format: EFormat.json,
          timespan: '1w'
        })
      });
    });

    it('should call getTimelineWithArticles with correct parameters', async () => {
      await client.getTimelineWithArticles({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.timelineVolumeInfo,
          format: EFormat.json
        })
      });
    });

    it('should call getTimelineByLanguage with correct parameters', async () => {
      await client.getTimelineByLanguage({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.timelineLanguage,
          format: EFormat.json
        })
      });
    });

    it('should call getTimelineByCountry with correct parameters', async () => {
      await client.getTimelineByCountry({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.timelineSourceCountry,
          format: EFormat.json
        })
      });
    });

    it('should call getTimelineTone with correct parameters', async () => {
      await client.getTimelineTone({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.timelineTone,
          format: EFormat.json
        })
      });
    });

    it('should call getToneChart with correct parameters', async () => {
      await client.getToneChart({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.toneChart,
          format: EFormat.json
        })
      });
    });

    it('should call getImageTagCloud with correct parameters', async () => {
      await client.getImageTagCloud({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.wordCloudImageTags,
          format: EFormat.json
        })
      });
    });

    it('should call getImageWebTagCloud with correct parameters', async () => {
      await client.getImageWebTagCloud({ query: 'test query' });
      
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          query: 'test query',
          mode: EMode.wordCloudImageWebTags,
          format: EFormat.json
        })
      });
    });
  });

  describe('parameter validation', () => {
    beforeEach(() => {
      // Reset the mock before each test
      mockGet.mockClear();
    });

    it('should throw error for empty query', async () => {
      await expect(client.getArticles({ query: '' }))
        .rejects.toThrow('Query parameter is required and must be a non-empty string');
    });

    it('should throw error for undefined query', async () => {
      await expect(client.getArticles({ query: undefined as unknown as string }))
        .rejects.toThrow('Query parameter is required and must be a non-empty string');
    });

    it('should throw error for maxrecords out of range', async () => {
      await expect(client.getArticles({ query: 'test', maxrecords: 0 }))
        .rejects.toThrow('maxrecords must be an integer between 1 and 250');
      
      await expect(client.getArticles({ query: 'test', maxrecords: 251 }))
        .rejects.toThrow('maxrecords must be an integer between 1 and 250');
    });

    it('should throw error for invalid timelinesmooth', async () => {
      await expect(client.getTimeline({ query: 'test', timelinesmooth: 0 }))
        .rejects.toThrow('timelinesmooth must be an integer between 1 and 30');
      
      await expect(client.getTimeline({ query: 'test', timelinesmooth: 31 }))
        .rejects.toThrow('timelinesmooth must be an integer between 1 and 30');
    });

    it('should throw error for invalid datetime format', async () => {
      await expect(client.getArticles({ query: 'test', startdatetime: '2025010112' }))
        .rejects.toThrow('startdatetime must be in YYYYMMDDHHMMSS format (14 digits)');
      
      await expect(client.getArticles({ query: 'test', enddatetime: 'invalid' }))
        .rejects.toThrow('enddatetime must be in YYYYMMDDHHMMSS format (14 digits)');
    });

    it('should throw error for invalid timespan format', async () => {
      await expect(client.getArticles({ query: 'test', timespan: '1day' }))
        .rejects.toThrow('timespan must be in format like "1d", "2h", "30min", "1w", "3m"');
      
      await expect(client.getArticles({ query: 'test', timespan: 'invalid' }))
        .rejects.toThrow('timespan must be in format like "1d", "2h", "30min", "1w", "3m"');
    });

    it('should accept valid parameters', async () => {
      // Mock successful response
      mockGet.mockResolvedValue({
        data: { status: 'ok', articles: [], count: 0 }
      });

      await expect(client.getArticles({ 
        query: 'test query',
        maxrecords: 100,
        timelinesmooth: 5,
        startdatetime: '20250101120000',
        enddatetime: '20250102120000',
        timespan: '1d'
      })).resolves.not.toThrow();
    });
  });
});