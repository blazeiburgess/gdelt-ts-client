/**
 * Tests for Client Method Overloads and Edge Cases
 */

import { GdeltClient } from '../client';

// Mock axios to avoid actual API calls
jest.mock('axios');

describe('Client Method Overloads and Edge Cases', () => {
  let client: GdeltClient;

  beforeEach(() => {
    client = new GdeltClient();
  });

  describe('getImages method overloads', () => {
    it('should handle invalid parameters object', async () => {
      const mockResponse = {
        data: {
          images: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getImages(null as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });

    it('should handle object without query property', async () => {
      await expect(client.getImages({ maxrecords: 10 } as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });
  });

  describe('getTimeline method overloads', () => {
    it('should handle invalid parameters object', async () => {
      const mockResponse = {
        data: {
          timeline: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getTimeline(null as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });

    it('should handle object without query property', async () => {
      await expect(client.getTimeline({ maxrecords: 10 } as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });
  });

  describe('getTimelineWithArticles method overloads', () => {
    it('should handle invalid parameters object', async () => {
      const mockResponse = {
        data: {
          timeline: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getTimelineWithArticles(null as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });

    it('should handle object without query property', async () => {
      await expect(client.getTimelineWithArticles({ maxrecords: 10 } as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });
  });

  describe('getTimelineTone method overloads', () => {
    it('should handle invalid parameters object', async () => {
      const mockResponse = {
        data: {
          timeline: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getTimelineTone(null as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });

    it('should handle object without query property', async () => {
      await expect(client.getTimelineTone({ maxrecords: 10 } as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });
  });

  describe('getToneChart method overloads', () => {
    it('should handle invalid parameters object', async () => {
      const mockResponse = {
        data: {
          tonechart: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getToneChart({ maxrecords: 10 } as any)).rejects.toThrow('Invalid parameters: expected object with query property or query string');
    });

    it('should handle valid object with query property', async () => {
      const mockResponse = {
        data: {
          tonechart: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getToneChart({ 
        query: 'test',
        maxrecords: 10 
      })).resolves.toBeDefined();
    });
  });

  describe('API methods without overloads', () => {
    it('should call getTimelineByLanguage with enhanced validation', async () => {
      const mockResponse = {
        data: {
          timeline: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getTimelineByLanguage({ 
        query: 'test',
        maxrecords: 10 
      })).resolves.toBeDefined();
    });

    it('should call getTimelineByCountry with enhanced validation', async () => {
      const mockResponse = {
        data: {
          timeline: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getTimelineByCountry({ 
        query: 'test',
        maxrecords: 10 
      })).resolves.toBeDefined();
    });

    it('should call getImageTagCloud with enhanced validation', async () => {
      const mockResponse = {
        data: {
          words: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getImageTagCloud({ 
        query: 'test',
        maxrecords: 10 
      })).resolves.toBeDefined();
    });

    it('should call getImageWebTagCloud with enhanced validation', async () => {
      const mockResponse = {
        data: {
          words: [],
          status: 'ok'
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getImageWebTagCloud({ 
        query: 'test',
        maxrecords: 10 
      })).resolves.toBeDefined();
    });
  });

  describe('Enhanced validation error paths', () => {
    it('should throw error for invalid timespan in enhanced validation', async () => {
      await expect(client.getArticles({
        query: 'test',
        timespan: 'invalid'
      })).rejects.toThrow('timespan must be in format like "1d", "2h", "30min", "1w", "3m"');
    });

    it('should throw error for invalid startdatetime in enhanced validation', async () => {
      await expect(client.getArticles({
        query: 'test',
        startdatetime: 'invalid'
      })).rejects.toThrow('startdatetime must be in YYYYMMDDHHMMSS format (14 digits)');
    });

    it('should throw error for invalid enddatetime in enhanced validation', async () => {
      await expect(client.getArticles({
        query: 'test',
        enddatetime: 'invalid'
      })).rejects.toThrow('enddatetime must be in YYYYMMDDHHMMSS format (14 digits)');
    });

    it('should throw error for invalid maxrecords in enhanced validation', async () => {
      await expect(client.getArticles({
        query: 'test',
        maxrecords: 0
      })).rejects.toThrow('maxrecords must be an integer between 1 and 250');
    });

    it('should throw error for invalid timelinesmooth in enhanced validation', async () => {
      await expect(client.getArticles({
        query: 'test',
        timelinesmooth: 0
      })).rejects.toThrow('timelinesmooth must be an integer between 1 and 30');
    });
  });

  describe('createTimespan enhanced validation', () => {
    it('should validate enhanced timespan with valid units', () => {
      const timespan = client.createTimespan(7, 'd' as any);
      expect(timespan).toBe('7d');
    });

    it('should throw error for invalid enhanced timespan', () => {
      expect(() => {
        client.createTimespan(0, 'd' as any);
      }).toThrow('Invalid timespan format: 0d');
    });

    it('should handle non-enhanced timespan units', () => {
      const timespan = client.createTimespan(7, 'invalid' as any);
      expect(timespan).toBe('7invalid');
    });
  });
});