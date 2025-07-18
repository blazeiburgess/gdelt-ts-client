/**
 * Tests for Type Guards functionality
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  isGdeltApiResponse,
  isValidResponseObject,
  isArticleListResponse,
  isImageCollageResponse,
  isTimelineResponse,
  isTimelineBreakdownResponse,
  isToneChartResponse,
  isWordCloudResponse,
  isStringErrorResponse,
  isErrorResponse,
  hasMinimumResponseStructure,
  validateArrayProperty,
  validateNumericProperty,
  ensureResponseWithCount,
  ensureResponseWithArticles,
  ensureResponseWithImages,
  validateResponse,
  TypeGuards
} from '../types/type-guards';

describe('Basic Type Guards', () => {
  describe('isGdeltApiResponse', () => {
    it('should validate valid GDELT API responses', () => {
      const validResponse = {
        status: 'ok',
        data: []
      };
      expect(isGdeltApiResponse(validResponse)).toBe(true);
    });

    it('should reject invalid responses', () => {
      expect(isGdeltApiResponse(null)).toBe(false);
      expect(isGdeltApiResponse(undefined)).toBe(false);
      expect(isGdeltApiResponse('string')).toBe(false);
      expect(isGdeltApiResponse({})).toBe(false); // missing status
      expect(isGdeltApiResponse({ status: 123 })).toBe(false); // non-string status
    });
  });

  describe('isValidResponseObject', () => {
    it('should validate objects', () => {
      expect(isValidResponseObject({})).toBe(true);
      expect(isValidResponseObject({ key: 'value' })).toBe(true);
    });

    it('should reject non-objects', () => {
      expect(isValidResponseObject(null)).toBe(false);
      expect(isValidResponseObject(undefined)).toBe(false);
      expect(isValidResponseObject('string')).toBe(false);
      expect(isValidResponseObject(123)).toBe(false);
      expect(isValidResponseObject([])).toBe(true); // arrays are objects
    });
  });
});

describe('Specific Response Type Guards', () => {
  describe('isArticleListResponse', () => {
    it('should validate article list responses', () => {
      const validResponse = {
        status: 'ok',
        articles: [
          { url: 'http://example.com/article1' },
          { url: 'http://example.com/article2' }
        ]
      };
      expect(isArticleListResponse(validResponse)).toBe(true);
    });

    it('should handle null articles in array', () => {
      const responseWithNulls = {
        status: 'ok',
        articles: [
          { url: 'http://example.com/article1' },
          null,
          { url: 'http://example.com/article2' }
        ]
      };
      expect(isArticleListResponse(responseWithNulls)).toBe(true);
    });

    it('should reject invalid article responses', () => {
      expect(isArticleListResponse({ status: 'ok' })).toBe(false); // missing articles
      expect(isArticleListResponse({ status: 'ok', articles: 'not-array' })).toBe(false);
      expect(isArticleListResponse({ 
        status: 'ok', 
        articles: [{ noUrl: 'invalid' }] 
      })).toBe(false);
    });
  });

  describe('isImageCollageResponse', () => {
    it('should validate image collage responses', () => {
      const validResponse = {
        status: 'ok',
        images: [
          { url: 'http://example.com/image1.jpg' },
          { url: 'http://example.com/image2.jpg' }
        ]
      };
      expect(isImageCollageResponse(validResponse)).toBe(true);
    });

    it('should handle null images in array', () => {
      const responseWithNulls = {
        status: 'ok',
        images: [
          { url: 'http://example.com/image1.jpg' },
          null,
          { url: 'http://example.com/image2.jpg' }
        ]
      };
      expect(isImageCollageResponse(responseWithNulls)).toBe(true);
    });

    it('should reject invalid image responses', () => {
      expect(isImageCollageResponse({ status: 'ok' })).toBe(false); // missing images
      expect(isImageCollageResponse({ status: 'ok', images: 'not-array' })).toBe(false);
      expect(isImageCollageResponse({ 
        status: 'ok', 
        images: [{ noUrl: 'invalid' }] 
      })).toBe(false);
    });
  });

  describe('isTimelineResponse', () => {
    it('should validate timeline responses', () => {
      const validResponse = {
        status: 'ok',
        timeline: [
          { date: '2023-01-01', value: 100 },
          { date: '2023-01-02', value: 150 }
        ]
      };
      expect(isTimelineResponse(validResponse)).toBe(true);
    });

    it('should handle null timeline points', () => {
      const responseWithNulls = {
        status: 'ok',
        timeline: [
          { date: '2023-01-01', value: 100 },
          null,
          { date: '2023-01-02', value: 150 }
        ]
      };
      expect(isTimelineResponse(responseWithNulls)).toBe(true);
    });

    it('should reject invalid timeline responses', () => {
      expect(isTimelineResponse({ status: 'ok' })).toBe(false); // missing timeline
      expect(isTimelineResponse({ status: 'ok', timeline: 'not-array' })).toBe(false);
      expect(isTimelineResponse({ 
        status: 'ok', 
        timeline: [{ date: '2023-01-01' }] // missing value
      })).toBe(false);
      expect(isTimelineResponse({ 
        status: 'ok', 
        timeline: [{ value: 100 }] // missing date
      })).toBe(false);
    });
  });

  describe('isTimelineBreakdownResponse', () => {
    it('should validate timeline breakdown responses', () => {
      const validResponse = {
        status: 'ok',
        data: [
          { date: '2023-01-01', category: 'news' },
          { date: '2023-01-02', category: 'analysis' }
        ]
      };
      expect(isTimelineBreakdownResponse(validResponse)).toBe(true);
    });

    it('should handle null data points', () => {
      const responseWithNulls = {
        status: 'ok',
        data: [
          { date: '2023-01-01', category: 'news' },
          null,
          { date: '2023-01-02', category: 'analysis' }
        ]
      };
      expect(isTimelineBreakdownResponse(responseWithNulls)).toBe(true);
    });

    it('should reject invalid breakdown responses', () => {
      expect(isTimelineBreakdownResponse({ status: 'ok' })).toBe(false); // missing data
      expect(isTimelineBreakdownResponse({ status: 'ok', data: 'not-array' })).toBe(false);
      expect(isTimelineBreakdownResponse({ 
        status: 'ok', 
        data: [{ noDate: 'invalid' }] 
      })).toBe(false);
    });
  });

  describe('isToneChartResponse', () => {
    it('should validate tone chart responses', () => {
      const validResponse = {
        status: 'ok',
        tonechart: [
          { bin: -10, count: 50 },
          { bin: 0, count: 200 },
          { bin: 10, count: 75 }
        ]
      };
      expect(isToneChartResponse(validResponse)).toBe(true);
    });

    it('should handle null tone chart entries', () => {
      const responseWithNulls = {
        status: 'ok',
        tonechart: [
          { bin: -10, count: 50 },
          null,
          { bin: 10, count: 75 }
        ]
      };
      expect(isToneChartResponse(responseWithNulls)).toBe(true);
    });

    it('should reject invalid tone chart responses', () => {
      expect(isToneChartResponse({ status: 'ok' })).toBe(false); // missing tonechart
      expect(isToneChartResponse({ status: 'ok', tonechart: 'not-array' })).toBe(false);
      expect(isToneChartResponse({ 
        status: 'ok', 
        tonechart: [{ bin: 5 }] // missing count
      })).toBe(false);
      expect(isToneChartResponse({ 
        status: 'ok', 
        tonechart: [{ count: 100 }] // missing bin
      })).toBe(false);
    });
  });

  describe('isWordCloudResponse', () => {
    it('should validate word cloud responses', () => {
      const validResponse = {
        status: 'ok',
        words: [
          { word: 'climate', count: 150 },
          { word: 'change', count: 120 },
          { word: 'energy', count: 80 }
        ]
      };
      expect(isWordCloudResponse(validResponse)).toBe(true);
    });

    it('should handle null word entries', () => {
      const responseWithNulls = {
        status: 'ok',
        words: [
          { word: 'climate', count: 150 },
          null,
          { word: 'energy', count: 80 }
        ]
      };
      expect(isWordCloudResponse(responseWithNulls)).toBe(true);
    });

    it('should reject invalid word cloud responses', () => {
      expect(isWordCloudResponse({ status: 'ok' })).toBe(false); // missing words
      expect(isWordCloudResponse({ status: 'ok', words: 'not-array' })).toBe(false);
      expect(isWordCloudResponse({ 
        status: 'ok', 
        words: [{ word: 'test' }] // missing count
      })).toBe(false);
      expect(isWordCloudResponse({ 
        status: 'ok', 
        words: [{ count: 100 }] // missing word
      })).toBe(false);
    });
  });
});

describe('Error Type Guards', () => {
  describe('isStringErrorResponse', () => {
    it('should identify string errors', () => {
      expect(isStringErrorResponse('Error message')).toBe(true);
      expect(isStringErrorResponse('')).toBe(true);
    });

    it('should reject non-strings', () => {
      expect(isStringErrorResponse({ error: 'message' })).toBe(false);
      expect(isStringErrorResponse(null)).toBe(false);
      expect(isStringErrorResponse(123)).toBe(false);
    });
  });

  describe('isErrorResponse', () => {
    it('should identify error objects', () => {
      expect(isErrorResponse({ error: 'Something went wrong' })).toBe(true);
      expect(isErrorResponse({ error: 'Error', code: 'E001' })).toBe(true);
    });

    it('should reject non-error objects', () => {
      expect(isErrorResponse({ message: 'not error' })).toBe(false);
      expect(isErrorResponse({ error: 123 })).toBe(false); // non-string error
      expect(isErrorResponse('string error')).toBe(false);
    });
  });
});

describe('Validation Helper Functions', () => {
  describe('hasMinimumResponseStructure', () => {
    it('should validate required fields', () => {
      const response = { status: 'ok', data: [], count: 10 };
      expect(hasMinimumResponseStructure(response, ['status', 'data'])).toBe(true);
      expect(hasMinimumResponseStructure(response, ['status', 'data', 'count'])).toBe(true);
    });

    it('should reject missing fields', () => {
      const response = { status: 'ok' };
      expect(hasMinimumResponseStructure(response, ['status', 'data'])).toBe(false);
      expect(hasMinimumResponseStructure(response, ['missing'] as any)).toBe(false);
    });
  });

  describe('validateArrayProperty', () => {
    it('should validate array properties', () => {
      const obj = { items: [1, 2, 3] };
      expect(validateArrayProperty(obj, 'items')).toBe(true);
    });

    it('should validate with item validator', () => {
      const obj = { items: [1, 2, 3] };
      const numberValidator = (item: unknown): item is number => typeof item === 'number';
      expect(validateArrayProperty(obj, 'items', numberValidator)).toBe(true);
      
      const objWithMixed = { items: [1, '2', 3] };
      expect(validateArrayProperty(objWithMixed, 'items', numberValidator)).toBe(false);
    });

    it('should reject non-arrays', () => {
      const obj = { items: 'not-array' };
      expect(validateArrayProperty(obj, 'items')).toBe(false);
    });

    it('should reject missing properties', () => {
      const obj = { other: [] };
      expect(validateArrayProperty(obj, 'items')).toBe(false);
    });
  });

  describe('validateNumericProperty', () => {
    it('should validate numeric properties', () => {
      const obj = { count: 42 };
      expect(validateNumericProperty(obj, 'count')).toBe(true);
    });

    it('should validate with min/max constraints', () => {
      const obj = { value: 50 };
      expect(validateNumericProperty(obj, 'value', 0, 100)).toBe(true);
      expect(validateNumericProperty(obj, 'value', 60, 100)).toBe(false); // below min
      expect(validateNumericProperty(obj, 'value', 0, 40)).toBe(false); // above max
    });

    it('should reject non-numeric values', () => {
      const obj = { count: '42' };
      expect(validateNumericProperty(obj, 'count')).toBe(false);
    });

    it('should reject infinite values', () => {
      const obj = { count: Infinity };
      expect(validateNumericProperty(obj, 'count')).toBe(false);
    });

    it('should reject missing properties', () => {
      const obj = { other: 42 };
      expect(validateNumericProperty(obj, 'count')).toBe(false);
    });
  });
});

describe('Response Transformation Guards', () => {
  describe('ensureResponseWithCount', () => {
    it('should validate responses with count', () => {
      const response = { status: 'ok', count: 10 };
      expect(ensureResponseWithCount(response)).toBe(true);
    });

    it('should reject responses without count', () => {
      const response = { status: 'ok' };
      expect(ensureResponseWithCount(response)).toBe(false);
    });

    it('should reject responses with non-numeric count', () => {
      const response = { status: 'ok', count: '10' };
      expect(ensureResponseWithCount(response)).toBe(false);
    });
  });

  describe('ensureResponseWithArticles', () => {
    it('should validate responses with articles array', () => {
      const response = { status: 'ok', articles: [] };
      expect(ensureResponseWithArticles(response)).toBe(true);
    });

    it('should reject responses without articles', () => {
      const response = { status: 'ok' };
      expect(ensureResponseWithArticles(response)).toBe(false);
    });

    it('should reject responses with non-array articles', () => {
      const response = { status: 'ok', articles: 'not-array' };
      expect(ensureResponseWithArticles(response)).toBe(false);
    });
  });

  describe('ensureResponseWithImages', () => {
    it('should validate responses with images array', () => {
      const response = { status: 'ok', images: [] };
      expect(ensureResponseWithImages(response)).toBe(true);
    });

    it('should reject responses without images', () => {
      const response = { status: 'ok' };
      expect(ensureResponseWithImages(response)).toBe(false);
    });

    it('should reject responses with non-array images', () => {
      const response = { status: 'ok', images: 'not-array' };
      expect(ensureResponseWithImages(response)).toBe(false);
    });
  });
});

describe('Comprehensive Response Validator', () => {
  describe('validateResponse', () => {
    const mockTypeGuard = (response: unknown): response is any => {
      return typeof response === 'object' && response !== null && 'data' in response;
    };

    it('should validate with all options', () => {
      const response = { status: 'ok', count: 10, data: [] };
      expect(validateResponse(response, mockTypeGuard, {
        requireStatus: true,
        requireCount: true
      })).toBe(true);
    });

    it('should use default options', () => {
      const response = { status: 'ok', data: [] };
      expect(validateResponse(response, mockTypeGuard)).toBe(true);
    });

    it('should reject when type guard fails', () => {
      const response = { status: 'ok' }; // missing 'data' required by mockTypeGuard
      expect(validateResponse(response, mockTypeGuard)).toBe(false);
    });

    it('should reject invalid objects', () => {
      expect(validateResponse(null, mockTypeGuard)).toBe(false);
      expect(validateResponse('string', mockTypeGuard)).toBe(false);
    });
  });
});

describe('TypeGuards object', () => {
  it('should provide all type guard functions', () => {
    expect(TypeGuards.isGdeltApiResponse).toBeDefined();
    expect(TypeGuards.isValidResponseObject).toBeDefined();
    expect(TypeGuards.isArticleListResponse).toBeDefined();
    expect(TypeGuards.isImageCollageResponse).toBeDefined();
    expect(TypeGuards.isTimelineResponse).toBeDefined();
    expect(TypeGuards.isTimelineBreakdownResponse).toBeDefined();
    expect(TypeGuards.isToneChartResponse).toBeDefined();
    expect(TypeGuards.isWordCloudResponse).toBeDefined();
    expect(TypeGuards.isStringErrorResponse).toBeDefined();
    expect(TypeGuards.isErrorResponse).toBeDefined();
    expect(TypeGuards.hasMinimumResponseStructure).toBeDefined();
    expect(TypeGuards.validateArrayProperty).toBeDefined();
    expect(TypeGuards.validateNumericProperty).toBeDefined();
    expect(TypeGuards.ensureResponseWithCount).toBeDefined();
    expect(TypeGuards.ensureResponseWithArticles).toBeDefined();
    expect(TypeGuards.ensureResponseWithImages).toBeDefined();
    expect(TypeGuards.validateResponse).toBeDefined();
  });

  it('should work as expected', () => {
    const response = { status: 'ok', articles: [] };
    expect(TypeGuards.isArticleListResponse(response)).toBe(true);
  });
});