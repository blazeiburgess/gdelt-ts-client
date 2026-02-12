/**
 * Type guards and response validation for the GDELT API client
 */

/* eslint-disable @typescript-eslint/naming-convention */

import { 
  IArticleListResponse, 
  IImageCollageResponse, 
  ITimelineResponse, 
  ITimelineBreakdownResponse, 
  IToneChartResponse, 
  IWordCloudResponse,
  IGdeltApiResponse
} from '../interfaces/api-responses';

// ===== BASE RESPONSE TYPE GUARDS =====

/**
 * Type guard to check if a response is a valid GDELT API response
 */
export function isGdeltApiResponse(response: unknown): response is IGdeltApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    typeof (response as IGdeltApiResponse).status === 'string'
  );
}

/**
 * Type guard to check if a response has the expected object structure
 */
export function isValidResponseObject(response: unknown): response is Record<string, unknown> {
  return typeof response === 'object' && response !== null && response !== undefined;
}

// ===== SPECIFIC RESPONSE TYPE GUARDS =====

/**
 * Type guard to validate an article list response
 */
export function isArticleListResponse(response: unknown): response is IArticleListResponse {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  const articleResponse = response as IArticleListResponse;
  
  return (
    'articles' in articleResponse &&
    Array.isArray(articleResponse.articles) &&
    // Validate that each article has required properties
    articleResponse.articles.every(article =>
      article === null || (
        typeof article === 'object' &&
        'url' in article &&
        typeof article.url === 'string'
      )
    )
  );
}

/**
 * Type guard to validate an image collage response
 */
export function isImageCollageResponse(response: unknown): response is IImageCollageResponse {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  const imageResponse = response as IImageCollageResponse;
  
  return (
    'images' in imageResponse &&
    Array.isArray(imageResponse.images) &&
    // Validate that each image has required properties
    imageResponse.images.every(image =>
      image === null || (
        typeof image === 'object' &&
        'url' in image &&
        typeof image.url === 'string'
      )
    )
  );
}

/**
 * Type guard to validate a timeline response
 */
export function isTimelineResponse(response: unknown): response is ITimelineResponse {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  const timelineResponse = response as ITimelineResponse;
  
  return (
    'timeline' in timelineResponse &&
    Array.isArray(timelineResponse.timeline) &&
    // Validate that each timeline point has required properties
    timelineResponse.timeline.every(point =>
      point === null || (
        typeof point === 'object' &&
        'date' in point &&
        'value' in point &&
        typeof point.date === 'string' &&
        typeof point.value === 'number'
      )
    )
  );
}

/**
 * Type guard to validate a timeline breakdown response
 */
export function isTimelineBreakdownResponse(response: unknown): response is ITimelineBreakdownResponse {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  const breakdownResponse = response as ITimelineBreakdownResponse;
  
  return (
    'data' in breakdownResponse &&
    Array.isArray(breakdownResponse.data) &&
    // Validate breakdown data structure
    breakdownResponse.data.every(item =>
      item === null || (
        typeof item === 'object' &&
        'date' in item &&
        typeof item.date === 'string'
      )
    )
  );
}

/**
 * Type guard to validate a tone chart response
 */
export function isToneChartResponse(response: unknown): response is IToneChartResponse {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  const toneResponse = response as IToneChartResponse;
  
  return (
    'tonechart' in toneResponse &&
    Array.isArray(toneResponse.tonechart) &&
    // Validate that each tone chart entry has required properties
    toneResponse.tonechart.every(entry =>
      entry === null || (
        typeof entry === 'object' &&
        'bin' in entry &&
        'count' in entry &&
        typeof entry.bin === 'number' &&
        typeof entry.count === 'number'
      )
    )
  );
}

/**
 * Type guard to validate a word cloud response
 */
export function isWordCloudResponse(response: unknown): response is IWordCloudResponse {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  const wordCloudResponse = response as IWordCloudResponse;
  
  return (
    'words' in wordCloudResponse &&
    Array.isArray(wordCloudResponse.words) &&
    // Validate that each word entry has required properties
    wordCloudResponse.words.every(word =>
      word === null || (
        typeof word === 'object' &&
        'word' in word &&
        'count' in word &&
        typeof word.word === 'string' &&
        typeof word.count === 'number'
      )
    )
  );
}

// ===== ENHANCED ERROR TYPE GUARDS =====

/**
 * Type guard to check if response is a string error message
 */
export function isStringErrorResponse(response: unknown): response is string {
  return typeof response === 'string';
}

/**
 * Type guard to check if response is an error object
 */
export function isErrorResponse(response: unknown): response is { error: string; code?: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as { error: string }).error === 'string'
  );
}

// ===== VALIDATION HELPER FUNCTIONS =====

/**
 * Validates that a response has the minimum required properties
 */
export function hasMinimumResponseStructure<T extends IGdeltApiResponse>(
  response: unknown,
  requiredFields: (keyof T)[]
): response is T {
  if (!isGdeltApiResponse(response)) {
    return false;
  }

  return requiredFields.every(field => field in response);
}

/**
 * Validates array properties within a response
 */
export function validateArrayProperty<T>(
  obj: unknown,
  propertyName: string,
  itemValidator?: (item: unknown) => item is T
): obj is Record<string, T[]> {
  if (!isValidResponseObject(obj) || !(propertyName in obj)) {
    return false;
  }

  const property = (obj)[propertyName];
  
  if (!Array.isArray(property)) {
    return false;
  }

  if (itemValidator) {
    return property.every(itemValidator);
  }

  return true;
}

/**
 * Validates numeric properties within a response
 */
export function validateNumericProperty(
  obj: unknown,
  propertyName: string,
  min?: number,
  max?: number
): boolean {
  if (!isValidResponseObject(obj) || !(propertyName in obj)) {
    return false;
  }

  const property = (obj)[propertyName];
  
  if (typeof property !== 'number' || !Number.isFinite(property)) {
    return false;
  }

  if (min !== undefined && property < min) {
    return false;
  }

  if (max !== undefined && property > max) {
    return false;
  }

  return true;
}

// ===== RESPONSE TRANSFORMATION TYPE GUARDS =====

/**
 * Type guard that validates and ensures response has count property
 */
export function ensureResponseWithCount<T extends IGdeltApiResponse>(
  response: T
): response is T & { count: number } {
  if ('count' in response && typeof response.count === 'number') {
    return true;
  }

  return false;
}

/**
 * Type guard that validates and ensures response has articles array
 */
export function ensureResponseWithArticles<T extends IGdeltApiResponse>(
  response: T
): response is T & { articles: unknown[] } {
  return (
    'articles' in response &&
    Array.isArray((response as T & { articles: unknown[] }).articles)
  );
}

/**
 * Type guard that validates and ensures response has images array
 */
export function ensureResponseWithImages<T extends IGdeltApiResponse>(
  response: T
): response is T & { images: unknown[] } {
  return (
    'images' in response &&
    Array.isArray((response as T & { images: unknown[] }).images)
  );
}

// ===== COMPREHENSIVE RESPONSE VALIDATOR =====

/**
 * Comprehensive response validator that checks multiple conditions
 */
export interface ResponseValidationOptions {
  requireStatus?: boolean;
  requireCount?: boolean;
  allowNull?: boolean;
  strictArrayValidation?: boolean;
}

/**
 * Main response validation function with configurable options
 */
export function validateResponse<T extends IGdeltApiResponse>(
  response: unknown,
  typeGuard: (response: unknown) => response is T,
  options: ResponseValidationOptions = {}
): response is T {
  const {
    requireStatus = true,
    requireCount = false
  } = options;

  // Basic structure validation
  if (!isValidResponseObject(response)) {
    return false;
  }

  // Status validation
  if (requireStatus && !('status' in response)) {
    return false;
  }

  // Count validation
  if (requireCount && !ensureResponseWithCount(response as unknown as IGdeltApiResponse)) {
    return false;
  }

  // Apply the specific type guard
  if (!typeGuard(response)) {
    return false;
  }

  return true;
}

// ===== EXPORT ALL TYPE GUARDS =====

export const TypeGuards = {
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
  validateResponse
} as const;