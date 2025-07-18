/**
 * Tests for Enhanced Client functionality
 */

import { GdeltClient } from '../client';
import { TimespanUnit } from '../types/enhanced-types';

describe('Enhanced GdeltClient Features', () => {
  let client: GdeltClient;

  beforeEach(() => {
    client = new GdeltClient();
  });

  describe('Enhanced createTimespan method', () => {
    it('should create timespan with enhanced validation', () => {
      const timespan = client.createTimespan(7, TimespanUnit.DAYS);
      expect(timespan).toBe('7d');
    });

    it('should validate enhanced timespan format', () => {
      expect(() => {
        // Mock the validation to fail
        jest.spyOn(client, 'createTimespan').mockImplementation(() => {
          throw new Error('Invalid timespan format: invalid');
        });
        client.createTimespan(999, TimespanUnit.MINUTES);
      }).toThrow('Invalid timespan format');
    });
  });

  describe('Query building utilities', () => {
    it('should create query builder', () => {
      const builder = client.query();
      expect(builder).toBeDefined();
      expect(typeof builder.search).toBe('function');
      expect(typeof builder.build).toBe('function');
    });

    it('should create article query builder', () => {
      const builder = client.articleQuery();
      expect(builder).toBeDefined();
      expect(typeof builder.breakingNews).toBe('function');
      expect(typeof builder.build).toBe('function');
    });

    it('should create image query builder', () => {
      const builder = client.imageQuery();
      expect(builder).toBeDefined();
      expect(typeof builder.disasters).toBe('function');
      expect(typeof builder.build).toBe('function');
    });
  });

  describe('Query validation', () => {
    it('should validate well-formed queries', () => {
      const result = client.validateQuery('climate change');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty queries', () => {
      const result = client.validateQuery('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Query cannot be empty');
    });

    it('should reject queries with unbalanced parentheses', () => {
      const result = client.validateQuery('(climate OR weather');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Query has unbalanced parentheses');
    });

    it('should reject queries with unbalanced quotes', () => {
      const result = client.validateQuery('"unbalanced quote');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Query has unbalanced quotes');
    });

    it('should warn about high complexity queries', () => {
      // Create a very complex query to trigger complexity warning
      const complexQuery = 'word1 OR word2 OR word3 OR word4 OR word5 OR word6 OR word7 OR word8 OR word9 OR word10 OR word11 OR word12 OR word13 OR word14 OR word15 domain:test.com theme:CLIMATE tone>5 near10:"complex phrase" repeat5:"urgent"';
      const result = client.validateQuery(complexQuery);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('complexity'))).toBe(true);
    });
  });

  describe('Query optimization suggestions', () => {
    it('should suggest breaking down complex queries', () => {
      // Create a complex query
      const complexQuery = 'word1 OR word2 OR word3 OR word4 OR word5 OR word6 OR word7 OR word8 OR word9 OR word10 OR word11 OR word12 OR word13 OR word14 OR word15 domain:test.com theme:CLIMATE tone>5';
      const suggestions = client.getQueryOptimizations(complexQuery);
      expect(suggestions.some(s => s.includes('complex query'))).toBe(true);
    });

    it('should suggest reducing OR terms', () => {
      const manyOrQuery = Array.from({length: 15}, (_, i) => `term${i}`).join(' OR ');
      const suggestions = client.getQueryOptimizations(manyOrQuery);
      expect(suggestions.some(s => s.includes('OR terms'))).toBe(true);
    });

    it('should suggest adding timespan constraints', () => {
      const suggestions = client.getQueryOptimizations('simple query');
      expect(suggestions.some(s => s.includes('timespan constraint'))).toBe(true);
    });

    it('should warn about very long queries', () => {
      const longQuery = 'a'.repeat(600); // Very long query
      const suggestions = client.getQueryOptimizations(longQuery);
      expect(suggestions.some(s => s.includes('URL length limits'))).toBe(true);
    });

    it('should return no suggestions for well-optimized queries', () => {
      const optimizedQuery = 'domain:cnn.com timespan:1w climate change';
      const suggestions = client.getQueryOptimizations(optimizedQuery);
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('Method overloads', () => {
    beforeEach(() => {
      // Mock the _makeRequest method to avoid actual API calls
      jest.spyOn(client as any, '_makeRequest').mockResolvedValue({
        status: 'ok',
        articles: [],
        count: 0
      });

      // Mock the enhanced validation to pass
      jest.spyOn(client as any, '_validateEnhancedParams').mockImplementation(() => {});
      
      // Mock the transform and validate response to return the input
      jest.spyOn(client as any, '_transformAndValidateResponse').mockImplementation((data) => data);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('getArticles overloads', () => {
      it('should accept simple string query', async () => {
        await client.getArticles('climate change');
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'climate change'
          })
        );
      });

      it('should accept string query with options', async () => {
        await client.getArticles('climate change', { maxrecords: 100 });
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'climate change',
            maxrecords: 100
          })
        );
      });

      it('should accept full parameter object', async () => {
        const params = {
          query: 'climate change',
          maxrecords: 50,
          timespan: '1w'
        };
        await client.getArticles(params);
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining(params)
        );
      });

      it('should throw error for invalid parameters', async () => {
        await expect(client.getArticles({} as any)).rejects.toThrow('Invalid parameters');
      });
    });

    describe('getImages overloads', () => {
      it('should accept simple string query', async () => {
        await client.getImages('disaster photos');
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'disaster photos'
          })
        );
      });

      it('should accept string query with options', async () => {
        await client.getImages('disaster photos', { maxrecords: 50 });
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'disaster photos',
            maxrecords: 50
          })
        );
      });
    });

    describe('getTimeline overloads', () => {
      it('should accept string query with timespan', async () => {
        await client.getTimeline('climate change', '1w');
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'climate change',
            timespan: '1w'
          })
        );
      });

      it('should accept string query with options object', async () => {
        await client.getTimeline('climate change', { timespan: '2w', maxrecords: 200 });
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'climate change',
            timespan: '2w',
            maxrecords: 200
          })
        );
      });
    });

    describe('getToneChart overloads', () => {
      beforeEach(() => {
        // Mock the tone chart specific validation
        jest.spyOn(client as any, '_transformAndValidateResponse').mockReturnValue({
          status: 'ok',
          tonechart: []
        });
      });

      it('should accept simple string query', async () => {
        await client.getToneChart('climate change');
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'climate change'
          })
        );
      });

      it('should accept string query with options', async () => {
        await client.getToneChart('climate change', { timespan: '1w' });
        expect(client['_makeRequest']).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'climate change',
            timespan: '1w'
          })
        );
      });
    });
  });

  describe('Enhanced validation integration', () => {
    it('should call enhanced validation for string query overloads', async () => {
      const validateSpy = jest.spyOn(client as any, '_validateEnhancedParams');
      jest.spyOn(client as any, '_makeRequest').mockResolvedValue({ status: 'ok', articles: [] });
      jest.spyOn(client as any, '_transformAndValidateResponse').mockImplementation((data) => data);
      
      await client.getArticles('test query');
      expect(validateSpy).toHaveBeenCalledWith({
        query: 'test query'
      });
    });

    it('should use enhanced type guards for response validation', async () => {
      const transformSpy = jest.spyOn(client as any, '_transformAndValidateResponse');
      jest.spyOn(client as any, '_makeRequest').mockResolvedValue({ status: 'ok', articles: [] });
      
      await client.getArticles('test query');
      expect(transformSpy).toHaveBeenCalledWith(
        { status: 'ok', articles: [] },
        expect.any(Function) // TypeGuards.isArticleListResponse
      );
    });
  });

  describe('Integration with query builder', () => {
    beforeEach(() => {
      jest.spyOn(client as any, '_makeRequest').mockResolvedValue({
        status: 'ok',
        articles: [],
        count: 0
      });
      jest.spyOn(client as any, '_validateEnhancedParams').mockImplementation(() => {});
      jest.spyOn(client as any, '_transformAndValidateResponse').mockImplementation((data) => data);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should work with query builder output', async () => {
      const query = client.query()
        .phrase('climate change')
        .fromCountry('us')
        .withPositiveTone(3)
        .build();

      await client.getArticles(query);
      expect(client['_makeRequest']).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '"climate change" sourcecountry:us tone>3'
        })
      );
    });

    it('should validate complex built queries', async () => {
      const complexQuery = client.query()
        .phrase('renewable energy')
        .anyOf('solar', 'wind', 'hydro', 'geothermal', 'biomass')
        .fromCountry('germany')
        .withTheme('ENV_CLIMATE')
        .not('opinion')
        .build();

      const validation = client.validateQuery(complexQuery);
      expect(validation.valid).toBe(true);

      await client.getArticles(complexQuery);
      expect(client['_makeRequest']).toHaveBeenCalled();
    });
  });
});