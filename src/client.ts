import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  API_BASE_URL, 
  EFormat, 
  EMode, 
  ETimespanUnit
} from './constants';
import { 
  IGdeltApiBaseParams, 
  IGdeltClientConfig, 
  ITimespan 
} from './interfaces/api-parameters';
import {
  IArticleListResponse,
  IImageCollageResponse,
  ITimelineResponse,
  ITimelineBreakdownResponse,
  IToneChartResponse,
  IWordCloudResponse,
  IArticle
} from './interfaces/api-responses';
import {
  IArticleListWithContentResponse,
  IArticleWithContent,
  IArticleContentResult
} from './interfaces/content-responses';
import { IFetchContentOptions } from './interfaces/content-fetcher';
import {
  TimespanUnit,
  TimespanUnitType,
  TimespanString,
  ComplexQuery,
  isValidTimespan,
  isValidDateTime,
  isValidMaxRecords,
  isValidTimelineSmooth
} from './types/enhanced-types';
import {
  QueryBuilder,
  ArticleQueryBuilder,
  ImageQueryBuilder,
  QueryHelpers
} from './types/query-builder';
import { TypeGuards } from './types/type-guards';
import { 
  isValidCountry, 
  isValidLanguage, 
  isValidTheme, 
  isValidImageTag, 
  isValidImageWebTag, 
  searchCountries, 
  searchLanguages, 
  searchThemes 
} from './types/lookups';
import { ContentFetcherService } from './services/content-fetcher';

/**
 * GDELT API Client
 * A strongly-typed client for interacting with the GDELT API
 */
export class GdeltClient {
  /**
   * The Axios instance used for making HTTP requests
   * @private
   */
  private readonly _axiosInstance: AxiosInstance;

  /**
   * The base URL for the GDELT API
   * @private
   */
  private readonly _baseUrl: string;

  /**
   * The default format for API responses
   * @private
   */
  private readonly _defaultFormat: EFormat;

  /**
   * Whether to retry failed requests
   * @private
   */
  private readonly _retry: boolean;

  /**
   * The maximum number of retries for failed requests
   * @private
   */
  private readonly _maxRetries: number;

  /**
   * The delay between retries in milliseconds
   * @private
   */
  private readonly _retryDelay: number;

  /**
   * The content fetcher service for article content retrieval
   * @private
   */
  private readonly _contentFetcher: ContentFetcherService;

  /**
   * Creates a new GDELT API client
   * @param config - The client configuration
   */
  public constructor(config?: IGdeltClientConfig) {
    this._baseUrl = config?.baseUrl ?? API_BASE_URL;
    this._defaultFormat = config?.defaultFormat ?? EFormat.json;
    this._retry = config?.retry ?? true;
    this._maxRetries = config?.maxRetries ?? 3;
    this._retryDelay = config?.retryDelay ?? 1000;

    this._axiosInstance = axios.create({
      baseURL: this._baseUrl,
      timeout: config?.timeout ?? 30000,
      headers: {
        // Using type assertion to bypass ESLint naming convention check for HTTP headers
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Accept': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json'
      }
    });

    // Initialize content fetcher service
    this._contentFetcher = new ContentFetcherService(config?.contentFetcher);
  }

  /**
   * Creates a timespan string from a timespan object
   * @param timespan - The timespan object
   * @returns The timespan string
   * @private
   */
  private _createTimespanString(timespan: ITimespan): string {
    return `${timespan.value}${timespan.unit}`;
  }

  /**
   * Validates API parameters
   * @param params - The API parameters to validate
   * @private
   */
  private _validateParams(params: IGdeltApiBaseParams): void {
    // Validate query parameter
    if (!params.query || typeof params.query !== 'string' || params.query.trim() === '') {
      throw new Error('Query parameter is required and must be a non-empty string');
    }

    // Validate maxrecords
    if (params.maxrecords !== undefined) {
      if (!Number.isInteger(params.maxrecords) || params.maxrecords < 1 || params.maxrecords > 250) {
        throw new Error('maxrecords must be an integer between 1 and 250');
      }
    }

    // Validate timelinesmooth
    if (params.timelinesmooth !== undefined) {
      if (!Number.isInteger(params.timelinesmooth) || params.timelinesmooth < 1 || params.timelinesmooth > 30) {
        throw new Error('timelinesmooth must be an integer between 1 and 30');
      }
    }

    // Validate datetime formats
    const datetimeRegex = /^\d{14}$/;
    if (params.startdatetime && !datetimeRegex.test(params.startdatetime)) {
      throw new Error('startdatetime must be in YYYYMMDDHHMMSS format (14 digits)');
    }
    if (params.enddatetime && !datetimeRegex.test(params.enddatetime)) {
      throw new Error('enddatetime must be in YYYYMMDDHHMMSS format (14 digits)');
    }

    // Validate timespan format if provided
    if (params.timespan) {
      const timespanMatch = /^(\d+)(?:min|h|d|w|m)$/.exec(params.timespan);
      if (!timespanMatch || parseInt(timespanMatch[1]!, 10) <= 0) {
        throw new Error('timespan must be in format like "1d", "2h", "30min", "1w", "3m"');
      }
    }
  }

  /**
   * Transforms API response data without mutating the original
   * @param data - The original response data
   * @param mode - The API mode used for the request
   * @returns The transformed response data
   * @private
   */
  private _transformResponse<T extends object>(data: unknown, mode?: EMode): T {
    // For backward compatibility with tests, still throw error for null/undefined
    if (!data) {
      throw new Error('Invalid response data: expected object');
    }
    
    // For empty responses that are objects, handle gracefully
    // For non-objects, throw error for backward compatibility
    if (typeof data !== 'object') {
      throw new Error('Invalid response data: expected object');
    }
    
    // Create a new object without mutating the original
    const transformedData = { ...data as Record<string, unknown> };

    // Add status if missing
    if (!('status' in transformedData)) {
      transformedData['status'] = 'ok';
    }

    // Ensure expected array properties exist based on the mode
    if (mode === EMode.articleList && !('articles' in transformedData)) {
      transformedData['articles'] = [];
    }

    if (mode === EMode.imageCollageInfo && !('images' in transformedData)) {
      transformedData['images'] = [];
    }

    if ((mode === EMode.timelineVolume || mode === EMode.timelineVolumeInfo || mode === EMode.timelineTone) 
        && !('timeline' in transformedData)) {
      transformedData['timeline'] = [];
    }

    if ((mode === EMode.timelineLanguage || mode === EMode.timelineSourceCountry) 
        && !('data' in transformedData)) {
      transformedData['data'] = [];
    }

    if (mode === EMode.toneChart && !('tonechart' in transformedData)) {
      transformedData['tonechart'] = [];
    }

    if ((mode === EMode.wordCloudImageTags || mode === EMode.wordCloudImageWebTags) 
        && !('wordcloud' in transformedData)) {
      transformedData['wordcloud'] = [];
    }

    // Add count property for article list responses
    if ('articles' in transformedData && Array.isArray(transformedData["articles"]) && !('count' in transformedData)) {
      transformedData['count'] = transformedData["articles"].length;
    }

    // Add count property for image collage responses
    if ('images' in transformedData && Array.isArray(transformedData["images"]) && !('count' in transformedData)) {
      transformedData['count'] = transformedData["images"].length;
    }

    // Add count property for timeline responses
    if ('timeline' in transformedData && Array.isArray(transformedData["timeline"]) && !('count' in transformedData)) {
      transformedData['count'] = transformedData["timeline"].length;
    }

    return transformedData as T;
  }

  /**
   * Builds the query parameters for the API request
   * @param params - The API parameters
   * @returns The query parameters object
   * @private
   */
  private _buildQueryParams(params: IGdeltApiBaseParams): Record<string, string | number> {
    const queryParams: Record<string, string | number> = {
      query: params.query
    };

    if (params.mode) {
      queryParams['mode'] = params.mode;
    }

    if (params.format) {
      queryParams['format'] = params.format;
    } else {
      queryParams['format'] = this._defaultFormat;
    }

    if (params.timespan) {
      queryParams['timespan'] = params.timespan;
    }

    if (params.startdatetime) {
      queryParams['startdatetime'] = params.startdatetime;
    }

    if (params.enddatetime) {
      queryParams['enddatetime'] = params.enddatetime;
    }

    if (params.maxrecords) {
      queryParams['maxrecords'] = params.maxrecords;
    }

    if (params.timelinesmooth) {
      queryParams['timelinesmooth'] = params.timelinesmooth;
    }

    if (params.trans) {
      queryParams['trans'] = params.trans;
    }

    if (params.sort) {
      queryParams['sort'] = params.sort;
    }

    if (params.timezoom) {
      queryParams['timezoom'] = params.timezoom;
    }

    if (params.callback && params.format === EFormat.jsonp) {
      queryParams['callback'] = params.callback;
    }

    return queryParams;
  }

  /**
   * Makes a request to the GDELT API
   * @param params - The API parameters
   * @returns A promise that resolves to the API response
   * @private
   */
  private async _makeRequest<T extends object>(params: IGdeltApiBaseParams): Promise<T> {
    // Validate parameters before making request
    this._validateParams(params);
    
    const queryParams = this._buildQueryParams(params);
    let retries = 0;

    const makeAxiosRequest = async (): Promise<AxiosResponse<T>> => {
      try {
        return await this._axiosInstance.get<T>('', {
          params: queryParams
        });
      } catch (error) {
        if (this._retry && retries < this._maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, this._retryDelay));
          return makeAxiosRequest();
        }
        throw error;
      }
    };

    const response = await makeAxiosRequest();
    
    // Handle string responses (error messages)
    if (typeof response.data === 'string') {
      throw new Error(response.data);
    }
    
    // Transform response data without mutating original
    const transformedData = this._transformResponse<T>(response.data, params.mode);
    
    return transformedData;
  }

  /**
   * Gets a list of articles that match the query
   * @param params - The API parameters
   * @returns A promise that resolves to the article list response
   */
  public async getArticles(params: IGdeltApiBaseParams): Promise<IArticleListResponse>;
  /**
   * Gets a list of articles that match the query (simplified overload)
   * @param query - The search query string
   * @param options - Optional parameters
   * @returns A promise that resolves to the article list response
   */
  public async getArticles(query: string | ComplexQuery, options?: Partial<IGdeltApiBaseParams>): Promise<IArticleListResponse>;
  public async getArticles(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    options?: Partial<IGdeltApiBaseParams>
  ): Promise<IArticleListResponse> {
    let finalParams: IGdeltApiBaseParams;
    
    if (typeof paramsOrQuery === 'string') {
      finalParams = {
        query: paramsOrQuery,
        ...options
      };
    } else if (typeof paramsOrQuery === 'object' && paramsOrQuery !== null && 'query' in paramsOrQuery) {
      finalParams = paramsOrQuery;
    } else {
      throw new Error('Invalid parameters: expected object with query property or query string');
    }
    
    // Use enhanced validation
    this._validateEnhancedParams(finalParams);
    
    const response = await this._makeRequest<IArticleListResponse>({
      ...finalParams,
      mode: EMode.articleList,
      format: EFormat.json
    });
    
    return this._transformAndValidateResponse(response, TypeGuards.isArticleListResponse);
  }

  /**
   * Gets a list of images that match the query
   * @param params - The API parameters
   * @returns A promise that resolves to the image collage response
   */
  public async getImages(params: IGdeltApiBaseParams): Promise<IImageCollageResponse>;
  /**
   * Gets a list of images that match the query (simplified overload)
   * @param query - The search query string
   * @param options - Optional parameters
   * @returns A promise that resolves to the image collage response
   */
  public async getImages(query: string | ComplexQuery, options?: Partial<IGdeltApiBaseParams>): Promise<IImageCollageResponse>;
  public async getImages(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    options?: Partial<IGdeltApiBaseParams>
  ): Promise<IImageCollageResponse> {
    let finalParams: IGdeltApiBaseParams;
    
    if (typeof paramsOrQuery === 'string') {
      finalParams = {
        query: paramsOrQuery,
        ...options
      };
    } else if (typeof paramsOrQuery === 'object' && paramsOrQuery !== null && 'query' in paramsOrQuery) {
      finalParams = paramsOrQuery;
    } else {
      throw new Error('Invalid parameters: expected object with query property or query string');
    }
    
    // Use enhanced validation
    this._validateEnhancedParams(finalParams);
    
    const response = await this._makeRequest<IImageCollageResponse>({
      ...finalParams,
      mode: EMode.imageCollageInfo,
      format: EFormat.json
    });
    
    return this._transformAndValidateResponse(response, TypeGuards.isImageCollageResponse);
  }

  /**
   * Gets a timeline of news coverage volume that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimeline(params: IGdeltApiBaseParams): Promise<ITimelineResponse>;
  /**
   * Gets a timeline of news coverage volume that matches the query (simplified overload)
   * @param query - The search query string
   * @param timespanOrOptions - Timespan string or full options object
   * @returns A promise that resolves to the timeline response
   */
  public async getTimeline(query: string | ComplexQuery, timespanOrOptions?: TimespanString | Partial<IGdeltApiBaseParams>): Promise<ITimelineResponse>;
  public async getTimeline(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    timespanOrOptions?: TimespanString | Partial<IGdeltApiBaseParams>
  ): Promise<ITimelineResponse> {
    let finalParams: IGdeltApiBaseParams;
    
    if (typeof paramsOrQuery === 'string') {
      if (timespanOrOptions && typeof timespanOrOptions === 'string') {
        finalParams = {
          query: paramsOrQuery,
          timespan: timespanOrOptions
        };
      } else {
        finalParams = {
          query: paramsOrQuery,
          ...timespanOrOptions
        };
      }
    } else if (typeof paramsOrQuery === 'object' && paramsOrQuery !== null && 'query' in paramsOrQuery) {
      finalParams = paramsOrQuery;
    } else {
      throw new Error('Invalid parameters: expected object with query property or query string');
    }
    
    // Use enhanced validation
    this._validateEnhancedParams(finalParams);
    
    const response = await this._makeRequest<ITimelineResponse>({
      ...finalParams,
      mode: EMode.timelineVolume,
      format: EFormat.json
    });
    
    return this._transformAndValidateResponse(response, TypeGuards.isTimelineResponse);
  }

  /**
   * Gets a timeline of news coverage volume with article info that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimelineWithArticles(params: IGdeltApiBaseParams): Promise<ITimelineResponse>;
  /**
   * Gets a timeline of news coverage volume with article info that matches the query (simplified overload)
   * @param query - The search query string
   * @param options - Optional parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimelineWithArticles(query: string | ComplexQuery, options?: Partial<IGdeltApiBaseParams>): Promise<ITimelineResponse>;
  public async getTimelineWithArticles(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    options?: Partial<IGdeltApiBaseParams>
  ): Promise<ITimelineResponse> {
    let finalParams: IGdeltApiBaseParams;
    
    if (typeof paramsOrQuery === 'string') {
      finalParams = {
        query: paramsOrQuery,
        ...options
      };
    } else if (typeof paramsOrQuery === 'object' && paramsOrQuery !== null && 'query' in paramsOrQuery) {
      finalParams = paramsOrQuery;
    } else {
      throw new Error('Invalid parameters: expected object with query property or query string');
    }
    
    this._validateEnhancedParams(finalParams);
    
    const response = await this._makeRequest<ITimelineResponse>({
      ...finalParams,
      mode: EMode.timelineVolumeInfo,
      format: EFormat.json
    });
    
    return this._transformAndValidateResponse(response, TypeGuards.isTimelineResponse);
  }

  /**
   * Gets a timeline of news coverage volume broken down by language that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline breakdown response
   */
  public async getTimelineByLanguage(params: IGdeltApiBaseParams): Promise<ITimelineBreakdownResponse> {
    return this._makeRequest<ITimelineBreakdownResponse>({
      ...params,
      mode: EMode.timelineLanguage,
      format: EFormat.json
    });
  }

  /**
   * Gets a timeline of news coverage volume broken down by source country that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline breakdown response
   */
  public async getTimelineByCountry(params: IGdeltApiBaseParams): Promise<ITimelineBreakdownResponse> {
    return this._makeRequest<ITimelineBreakdownResponse>({
      ...params,
      mode: EMode.timelineSourceCountry,
      format: EFormat.json
    });
  }

  /**
   * Gets a timeline of average tone of news coverage that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimelineTone(params: IGdeltApiBaseParams): Promise<ITimelineResponse>;
  /**
   * Gets a timeline of average tone of news coverage that matches the query (simplified overload)
   * @param query - The search query string
   * @param options - Optional parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimelineTone(query: string | ComplexQuery, options?: Partial<IGdeltApiBaseParams>): Promise<ITimelineResponse>;
  public async getTimelineTone(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    options?: Partial<IGdeltApiBaseParams>
  ): Promise<ITimelineResponse> {
    let finalParams: IGdeltApiBaseParams;
    
    if (typeof paramsOrQuery === 'string') {
      finalParams = {
        query: paramsOrQuery,
        ...options
      };
    } else if (typeof paramsOrQuery === 'object' && paramsOrQuery !== null && 'query' in paramsOrQuery) {
      finalParams = paramsOrQuery;
    } else {
      throw new Error('Invalid parameters: expected object with query property or query string');
    }
    
    this._validateEnhancedParams(finalParams);
    
    const response = await this._makeRequest<ITimelineResponse>({
      ...finalParams,
      mode: EMode.timelineTone,
      format: EFormat.json
    });
    
    return this._transformAndValidateResponse(response, TypeGuards.isTimelineResponse);
  }

  /**
   * Gets a tone chart of news coverage that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the tone chart response
   */
  public async getToneChart(params: IGdeltApiBaseParams): Promise<IToneChartResponse>;
  /**
   * Gets a tone chart of news coverage that matches the query (simplified overload)
   * @param query - The search query string
   * @param options - Optional parameters
   * @returns A promise that resolves to the tone chart response
   */
  public async getToneChart(query: string | ComplexQuery, options?: Partial<IGdeltApiBaseParams>): Promise<IToneChartResponse>;
  public async getToneChart(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    options?: Partial<IGdeltApiBaseParams>
  ): Promise<IToneChartResponse> {
    let finalParams: IGdeltApiBaseParams;
    
    if (typeof paramsOrQuery === 'string') {
      finalParams = {
        query: paramsOrQuery,
        ...options
      };
    } else if (typeof paramsOrQuery === 'object' && paramsOrQuery !== null && 'query' in paramsOrQuery) {
      finalParams = paramsOrQuery;
    } else {
      throw new Error('Invalid parameters: expected object with query property or query string');
    }
    
    // Use enhanced validation
    this._validateEnhancedParams(finalParams);
    
    const response = await this._makeRequest<IToneChartResponse>({
      ...finalParams,
      mode: EMode.toneChart,
      format: EFormat.json
    });
    
    // Enhanced validation with type guard
    const validatedResponse = this._transformAndValidateResponse(response, TypeGuards.isToneChartResponse);
    
    // Ensure the response has the expected structure with tonechart property
    if (!validatedResponse.tonechart) {
      throw new Error('Invalid response format from GDELT API: missing tonechart property');
    }
    
    return validatedResponse;
  }

  /**
   * Gets a word cloud of image tags that match the query
   * @param params - The API parameters
   * @returns A promise that resolves to the word cloud response
   */
  public async getImageTagCloud(params: IGdeltApiBaseParams): Promise<IWordCloudResponse> {
    return this._makeRequest<IWordCloudResponse>({
      ...params,
      mode: EMode.wordCloudImageTags,
      format: EFormat.json
    });
  }

  /**
   * Gets a word cloud of image web tags that match the query
   * @param params - The API parameters
   * @returns A promise that resolves to the word cloud response
   */
  public async getImageWebTagCloud(params: IGdeltApiBaseParams): Promise<IWordCloudResponse> {
    return this._makeRequest<IWordCloudResponse>({
      ...params,
      mode: EMode.wordCloudImageWebTags,
      format: EFormat.json
    });
  }

  /**
   * Creates a timespan parameter for the API
   * @param value - The timespan value
   * @param unit - The timespan unit
   * @returns The timespan string
   */
  public createTimespan(value: number, unit: ETimespanUnit): string;
  /**
   * Creates a timespan parameter with enhanced validation
   * @param value - The timespan value
   * @param unit - The enhanced timespan unit
   * @returns The timespan string
   */
  public createTimespan(value: number, unit: TimespanUnitType): TimespanString;
  public createTimespan(value: number, unit: ETimespanUnit | TimespanUnitType): string | TimespanString {
    const timespanStr = this._createTimespanString({ value, unit: unit as ETimespanUnit });
    
    // If using enhanced types, validate the result
    const enhancedUnits = Object.values(TimespanUnit);
    if (enhancedUnits.includes(unit)) {
      if (!isValidTimespan(timespanStr)) {
        throw new Error(`Invalid timespan format: ${timespanStr}`);
      }
      return timespanStr as TimespanString;
    }
    
    return timespanStr;
  }

  // ===== ENHANCED UTILITY METHODS =====

  /**
   * Create a new query builder for constructing complex queries
   */
  public query(): QueryBuilder {
    return QueryHelpers.createQuery();
  }

  /**
   * Create a specialized query builder for article searches
   */
  public articleQuery(): ArticleQueryBuilder {
    return QueryHelpers.createArticleQuery();
  }

  /**
   * Create a specialized query builder for image searches
   */
  public imageQuery(): ImageQueryBuilder {
    return QueryHelpers.createImageQuery();
  }

  /**
   * Validate query string format and complexity
   */
  public validateQuery(query: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!query || query.trim().length === 0) {
      errors.push('Query cannot be empty');
    }
    
    if (!QueryHelpers.isValidQuery(query)) {
      errors.push('Query has unbalanced parentheses');
    }
    
    if (!QueryHelpers.hasBalancedQuotes(query)) {
      errors.push('Query has unbalanced quotes');
    }
    
    const complexity = QueryHelpers.getQueryComplexity(query);
    if (complexity > 50) {
      errors.push(`Query complexity (${complexity}) may be too high and could cause timeouts`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get suggested optimizations for a query
   */
  public getQueryOptimizations(query: string): string[] {
    const suggestions: string[] = [];
    const complexity = QueryHelpers.getQueryComplexity(query);
    
    if (complexity > 30) {
      suggestions.push('Consider breaking this complex query into smaller, more specific queries');
    }
    
    if (query.includes(' OR ') && query.split(' OR ').length > 10) {
      suggestions.push('Consider reducing the number of OR terms for better performance');
    }
    
    if (!query.includes('timespan:') && !query.includes('startdatetime:')) {
      suggestions.push('Consider adding a timespan constraint to limit the search scope');
    }
    
    if (query.length > 500) {
      suggestions.push('Very long queries may hit URL length limits in some environments');
    }
    
    return suggestions;
  }

  // ===== ENHANCED TYPE VALIDATION =====

  /**
   * Enhanced parameter validation using new type guards
   */
  private _validateEnhancedParams(params: IGdeltApiBaseParams): void {
    // Run base validation first
    this._validateParams(params);
    
    // Enhanced validations using new type guards
    if (params.timespan && !isValidTimespan(params.timespan)) {
      throw new Error(`Invalid timespan format: ${String(params.timespan)}. Must be like "1d", "2h", "30min", "1w", "3m"`);
    }
    
    if (params.startdatetime && !isValidDateTime(params.startdatetime)) {
      throw new Error(`Invalid startdatetime format: ${String(params.startdatetime)}. Must be YYYYMMDDHHMMSS`);
    }
    
    if (params.enddatetime && !isValidDateTime(params.enddatetime)) {
      throw new Error(`Invalid enddatetime format: ${String(params.enddatetime)}. Must be YYYYMMDDHHMMSS`);
    }
    
    if (params.maxrecords !== undefined && !isValidMaxRecords(params.maxrecords)) {
      throw new Error(`Invalid maxrecords: ${String(params.maxrecords)}. Must be an integer between 1 and 250`);
    }
    
    if (params.timelinesmooth !== undefined && !isValidTimelineSmooth(params.timelinesmooth)) {
      throw new Error(`Invalid timelinesmooth: ${String(params.timelinesmooth)}. Must be an integer between 1 and 30`);
    }
    
    // Validate query content if it contains lookup-based operators
    if (params.query) {
      this._validateQueryLookups(params.query);
    }
  }

  /**
   * Validate query content using lookup data
   */
  private _validateQueryLookups(query: string): void {
    // Extract and validate country queries
    const countryMatches = query.match(/sourcecountry:([a-zA-Z0-9]+)/g);
    if (countryMatches) {
      for (const match of countryMatches) {
        const country = match.split(':')[1];
        if (country && !isValidCountry(country)) {
          const suggestions = searchCountries(country);
          const suggestionText = suggestions.length > 0 
            ? ` Did you mean: ${suggestions.slice(0, 3).map(s => `"${s.code}" (${s.name})`).join(', ')}?`
            : '';
          throw new Error(`Invalid country in query: "${country}".${suggestionText}`);
        }
      }
    }
    
    // Extract and validate language queries
    const languageMatches = query.match(/sourcelang:([a-zA-Z0-9]+)/g);
    if (languageMatches) {
      for (const match of languageMatches) {
        const language = match.split(':')[1];
        if (language && !isValidLanguage(language)) {
          const suggestions = searchLanguages(language);
          const suggestionText = suggestions.length > 0 
            ? ` Did you mean: ${suggestions.slice(0, 3).map(s => `"${s.code}" (${s.name})`).join(', ')}?`
            : '';
          throw new Error(`Invalid language in query: "${language}".${suggestionText}`);
        }
      }
    }
    
    // Extract and validate theme queries
    const themeMatches = query.match(/theme:([A-Za-z_0-9]+)/gi);
    if (themeMatches) {
      for (const match of themeMatches) {
        const theme = match.split(':')[1];
        if (theme && !isValidTheme(theme)) {
          const suggestions = searchThemes(theme);
          const suggestionText = suggestions.length > 0 
            ? ` Did you mean: ${suggestions.slice(0, 3).map(s => `"${s}"`).join(', ')}?`
            : '';
          throw new Error(`Invalid theme in query: "${theme}".${suggestionText}`);
        }
      }
    }
    
    // Extract and validate image tag queries
    const imageTagMatches = query.match(/imagetag:"([^"]+)"/g);
    if (imageTagMatches) {
      for (const match of imageTagMatches) {
        const tag = match.match(/imagetag:"([^"]+)"/)?.[1];
        if (tag && !isValidImageTag(tag)) {
          // Only warn for image tags since the list is not exhaustive
          console.warn(`Image tag "${tag}" is not in the common tags list. This may still be valid.`);
        }
      }
    }
    
    // Extract and validate image web tag queries
    const imageWebTagMatches = query.match(/imagewebtag:"([^"]+)"/g);
    if (imageWebTagMatches) {
      for (const match of imageWebTagMatches) {
        const tag = match.match(/imagewebtag:"([^"]+)"/)?.[1];
        if (tag && !isValidImageWebTag(tag)) {
          // Only warn for image web tags since the list is not exhaustive
          console.warn(`Image web tag "${tag}" is not in the common tags list. This may still be valid.`);
        }
      }
    }
  }

  /**
   * Enhanced response validation and transformation
   */
  private _transformAndValidateResponse<T extends object>(data: unknown, typeGuard?: (response: unknown) => response is T): T {
    const transformedData = this._transformResponse<T>(data);
    
    // If a type guard is provided, use it for additional validation (only warn, don't throw)
    if (typeGuard && !typeGuard(transformedData)) {
      console.warn('Response validation warning: unexpected response structure');
    }
    
    return transformedData;
  }

  // ===== CONTENT FETCHING METHODS =====

  /**
   * Fetch articles with their full content
   * @param params - Standard GDELT API parameters
   * @param fetchOptions - Content fetching options
   * @returns Articles with full content included
   */
  public async getArticlesWithContent(
    params: IGdeltApiBaseParams,
    fetchOptions?: IFetchContentOptions
  ): Promise<IArticleListWithContentResponse>;
  /**
   * Fetch articles with their full content (overload with query string)
   * @param query - Query string or ComplexQuery
   * @param fetchOptions - Content fetching options
   * @returns Articles with full content included
   */
  public async getArticlesWithContent(
    query: string | ComplexQuery,
    fetchOptions?: IFetchContentOptions
  ): Promise<IArticleListWithContentResponse>;
  public async getArticlesWithContent(
    paramsOrQuery: IGdeltApiBaseParams | string | ComplexQuery,
    fetchOptions?: IFetchContentOptions
  ): Promise<IArticleListWithContentResponse> {
    // 1. Get articles from GDELT API
    let articles: IArticleListResponse;
    
    if (typeof paramsOrQuery === 'string') {
      // Call the string overload
      articles = await this.getArticles(paramsOrQuery);
    } else if ('mode' in paramsOrQuery) {
      // Call the IGdeltApiBaseParams overload
      articles = await this.getArticles(paramsOrQuery);
    } else {
      // Call the ComplexQuery overload (which is handled by the string overload)
      articles = await this.getArticles(paramsOrQuery);
    }
    
    // 2. Extract URLs from articles
    const urls = articles.articles.map(article => article.url);
    
    // 3. Fetch content for all URLs
    const contentResults = await this._contentFetcher.fetchMultipleArticleContent(
      urls, 
      fetchOptions
    );
    
    // 4. Merge content with article metadata
    return this._mergeArticlesWithContent(articles, contentResults);
  }

  /**
   * Fetch content for existing articles
   * @param articles - Array of article objects
   * @param options - Content fetching options
   * @returns Articles with content added
   */
  public async fetchContentForArticles(
    articles: IArticle[],
    options?: IFetchContentOptions
  ): Promise<IArticleWithContent[]> {
    // Extract URLs from articles
    const urls = articles.map(article => article.url);
    
    // Fetch content for all URLs
    const contentResults = await this._contentFetcher.fetchMultipleArticleContent(
      urls, 
      options
    );
    
    // Merge content with article metadata
    return this._mergeArticlesWithContentArray(articles, contentResults);
  }

  /**
   * Get content fetcher service instance
   * @returns Content fetcher service
   */
  public getContentFetcher(): ContentFetcherService {
    return this._contentFetcher;
  }

  /**
   * Merge articles with content results
   * @param articles - Original article response
   * @param contentResults - Content fetch results
   * @returns Merged response with content
   * @private
   */
  private _mergeArticlesWithContent(
    articles: IArticleListResponse,
    contentResults: IArticleContentResult[]
  ): IArticleListWithContentResponse {
    const articlesWithContent: IArticleWithContent[] = [];
    const resultMap = new Map<string, IArticleContentResult>();
    
    // Create map of URL to content result
    for (const result of contentResults) {
      resultMap.set(result.url, result);
    }
    
    // Merge articles with content
    for (const article of articles.articles) {
      const contentResult = resultMap.get(article.url);
      if (contentResult) {
        const articleWithContent: IArticleWithContent = {
          ...article,
          content: contentResult.success ? contentResult.content ?? null : null
        };
        
        if (!contentResult.success && contentResult.error) {
          articleWithContent.contentError = contentResult.error;
        }
        
        if (contentResult.timing) {
          articleWithContent.contentTiming = contentResult.timing;
        }
        
        articlesWithContent.push(articleWithContent);
      }
    }
    
    // Calculate statistics
    const contentStats = this._calculateContentStats(contentResults);
    
    return {
      ...articles,
      articles: articlesWithContent,
      contentStats
    };
  }

  /**
   * Merge articles array with content results
   * @param articles - Original articles array
   * @param contentResults - Content fetch results
   * @returns Merged articles with content
   * @private
   */
  private _mergeArticlesWithContentArray(
    articles: IArticle[],
    contentResults: IArticleContentResult[]
  ): IArticleWithContent[] {
    // If there are no articles or no content results, return empty array
    if (!articles.length || !contentResults?.length) {
      return [];
    }
    
    const articlesWithContent: IArticleWithContent[] = [];
    const resultMap = new Map<string, IArticleContentResult>();
    
    // Create map of URL to content result
    for (const result of contentResults) {
      resultMap.set(result.url, result);
    }
    
    // Merge articles with content
    for (const article of articles) {
      const contentResult = resultMap.get(article.url);
      if (contentResult) {
        const articleWithContent: IArticleWithContent = {
          ...article,
          content: contentResult.success ? (contentResult.content ?? null) : null
        };
        
        if (!contentResult.success && contentResult.error) {
          articleWithContent.contentError = contentResult.error;
        }
        
        if (contentResult.timing) {
          articleWithContent.contentTiming = contentResult.timing;
        }
        
        articlesWithContent.push(articleWithContent);
      }
    }
    
    return articlesWithContent;
  }

  /**
   * Calculate content fetching statistics
   * @param contentResults - Content fetch results
   * @returns Content statistics
   * @private
   */
  private _calculateContentStats(contentResults: IArticleContentResult[]): {
    totalArticles: number;
    successfulFetches: number;
    failedFetches: number;
    averageFetchTime: number;
    averageParseTime: number;
    totalFetchTime: number;
    totalWords: number;
    failureReasons: Record<string, number>;
  } {
    const totalArticles = contentResults.length;
    const successfulFetches = contentResults.filter(r => r.success).length;
    const failedFetches = contentResults.filter(r => !r.success).length;
    
    const totalFetchTime = Math.max(...contentResults.map(r => r.timing.totalTime));
    const averageFetchTime = contentResults.length > 0 ? 
      contentResults.reduce((sum, r) => sum + r.timing.fetchTime, 0) / contentResults.length : 0;
    const averageParseTime = contentResults.length > 0 ? 
      contentResults.reduce((sum, r) => sum + r.timing.parseTime, 0) / contentResults.length : 0;
    
    const totalWords = contentResults
      .filter(r => r.success && r.content)
      .reduce((sum, r) => sum + (r.content?.wordCount ?? 0), 0);
    
    const failureReasons: Record<string, number> = {};
    for (const result of contentResults) {
      if (!result.success && result.error) {
        const reason = result.error.code || 'UNKNOWN';
        failureReasons[reason] = (failureReasons[reason] ?? 0) + 1;
      }
    }
    
    return {
      totalArticles,
      successfulFetches,
      failedFetches,
      averageFetchTime,
      averageParseTime,
      totalFetchTime,
      totalWords,
      failureReasons
    };
  }
}