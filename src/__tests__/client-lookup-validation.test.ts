/**
 * Tests for Client Lookup Validation
 */

import { GdeltClient } from '../client';
import { EFormat } from '../constants';

// Mock axios to avoid actual API calls
jest.mock('axios');

describe('Client Lookup Validation', () => {
  let client: GdeltClient;

  beforeEach(() => {
    client = new GdeltClient();
  });

  describe('Country lookup validation', () => {
    it('should validate valid country codes in queries', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('sourcecountry:US test')).resolves.toBeDefined();
    });

    it('should throw error for invalid country codes', async () => {
      await expect(client.getArticles('sourcecountry:XX test')).rejects.toThrow('Invalid country in query: "XX"');
    });

    it('should provide suggestions for invalid countries', async () => {
      try {
        await client.getArticles('sourcecountry:USA test');
      } catch (error) {
        expect((error as Error).message).toContain('Invalid country in query: "USA"');
        expect((error as Error).message).toContain('Did you mean');
      }
    });

    it('should handle queries with no country suggestions', async () => {
      await expect(client.getArticles('sourcecountry:ZZZZZ test')).rejects.toThrow('Invalid country in query: "ZZZZZ"');
    });
  });

  describe('Language lookup validation', () => {
    it('should validate valid language codes in queries', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('sourcelang:eng test')).resolves.toBeDefined();
    });

    it('should throw error for invalid language codes', async () => {
      await expect(client.getArticles('sourcelang:xxx test')).rejects.toThrow('Invalid language in query: "xxx"');
    });

    it('should provide suggestions for invalid languages', async () => {
      try {
        await client.getArticles('sourcelang:en test');
      } catch (error) {
        expect(error.message).toContain('Invalid language in query: "en"');
        expect(error.message).toContain('Did you mean');
      }
    });

    it('should handle queries with no language suggestions', async () => {
      await expect(client.getArticles('sourcelang:zzzzz test')).rejects.toThrow('Invalid language in query: "zzzzz"');
    });
  });

  describe('Theme lookup validation', () => {
    it('should validate valid theme codes in queries', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('theme:TAX_FNCACT test')).resolves.toBeDefined();
    });

    it('should throw error for invalid theme codes', async () => {
      await expect(client.getArticles('theme:INVALID_THEME test')).rejects.toThrow('Invalid theme in query: "INVALID_THEME"');
    });

    it('should provide suggestions for invalid themes', async () => {
      try {
        await client.getArticles('theme:TAX test');
      } catch (error) {
        expect((error as Error).message).toContain('Invalid theme in query: "TAX"');
        expect((error as Error).message).toContain('Did you mean');
      }
    });

    it('should handle queries with no theme suggestions', async () => {
      await expect(client.getArticles('theme:ZZZZZ_NONEXISTENT test')).rejects.toThrow('Invalid theme in query: "ZZZZZ_NONEXISTENT"');
    });
  });

  describe('Image tag validation', () => {
    it('should warn for unknown image tags', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await client.getArticles('imagetag:"unknowntag" test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Image tag "unknowntag" is not in the common tags list. This may still be valid.');
      
      consoleSpy.mockRestore();
    });

    it('should not warn for valid image tags', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await client.getArticles('imagetag:"person" test');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Image web tag validation', () => {
    it('should warn for unknown image web tags', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await client.getArticles('imagewebtag:"unknownwebtag" test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Image web tag "unknownwebtag" is not in the common tags list. This may still be valid.');
      
      consoleSpy.mockRestore();
    });

    it('should not warn for valid image web tags', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await client.getArticles('imagewebtag:"News" test');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Complex query validation', () => {
    it('should validate multiple lookup types in one query', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('sourcecountry:US sourcelang:eng theme:TAX_FNCACT test')).resolves.toBeDefined();
    });

    it('should handle mixed valid and invalid lookups', async () => {
      await expect(client.getArticles('sourcecountry:US sourcelang:invalid theme:TAX_FNCACT test')).rejects.toThrow('Invalid language in query: "invalid"');
    });
  });

  describe('Edge cases', () => {
    it('should handle queries with no lookup operators', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('simple search term')).resolves.toBeDefined();
    });

    it('should handle malformed lookup patterns', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('sourcecountry: test')).resolves.toBeDefined();
    });

    it('should handle empty lookup values', async () => {
      const mockResponse = {
        data: {
          articles: [],
          status: 'ok',
          count: 0
        }
      };
      
      require('axios').create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      await expect(client.getArticles('sourcecountry: sourcelang: test')).resolves.toBeDefined();
    });
  });

  describe('Different API methods', () => {
    it('should validate lookups in getImages', async () => {
      await expect(client.getImages('sourcecountry:XX test')).rejects.toThrow('Invalid country in query: "XX"');
    });

    it('should validate lookups in getTimeline', async () => {
      await expect(client.getTimeline('sourcecountry:XX test')).rejects.toThrow('Invalid country in query: "XX"');
    });

    it('should validate lookups in getToneChart', async () => {
      await expect(client.getToneChart('sourcecountry:XX test')).rejects.toThrow('Invalid country in query: "XX"');
    });

    it('should validate lookups in getTimelineWithArticles', async () => {
      await expect(client.getTimelineWithArticles('sourcecountry:XX test')).rejects.toThrow('Invalid country in query: "XX"');
    });

    it('should validate lookups in getTimelineTone', async () => {
      await expect(client.getTimelineTone('sourcecountry:XX test')).rejects.toThrow('Invalid country in query: "XX"');
    });
  });
});