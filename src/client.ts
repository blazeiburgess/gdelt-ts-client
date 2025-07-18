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
  IWordCloudResponse
} from './interfaces/api-responses';

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
      const timespanRegex = /^\d+(?:min|h|d|w|m)$/;
      if (!timespanRegex.test(params.timespan)) {
        throw new Error('timespan must be in format like "1d", "2h", "30min", "1w", "3m"');
      }
    }
  }

  /**
   * Transforms API response data without mutating the original
   * @param data - The original response data
   * @returns The transformed response data
   * @private
   */
  private _transformResponse<T extends object>(data: unknown): T {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response data: expected object');
    }

    // Create a new object without mutating the original
    const transformedData = { ...data } as Record<string, unknown>;

    // Add status if missing
    if (!('status' in transformedData)) {
      transformedData['status'] = 'ok';
    }

    // Add count property for article list responses
    if ('articles' in transformedData && Array.isArray(transformedData["articles"]) && !('count' in transformedData)) {
      transformedData['count'] = transformedData["articles"].length;
    }

    // Add count property for image collage responses
    if ('images' in transformedData && Array.isArray(transformedData["images"]) && !('count' in transformedData)) {
      transformedData['count'] = transformedData["images"].length;
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
    const transformedData = this._transformResponse<T>(response.data);
    
    return transformedData;
  }

  /**
   * Gets a list of articles that match the query
   * @param params - The API parameters
   * @returns A promise that resolves to the article list response
   */
  public async getArticles(params: IGdeltApiBaseParams): Promise<IArticleListResponse> {
    return this._makeRequest<IArticleListResponse>({
      ...params,
      mode: EMode.articleList,
      format: EFormat.json
    });
  }

  /**
   * Gets a list of images that match the query
   * @param params - The API parameters
   * @returns A promise that resolves to the image collage response
   */
  public async getImages(params: IGdeltApiBaseParams): Promise<IImageCollageResponse> {
    return this._makeRequest<IImageCollageResponse>({
      ...params,
      mode: EMode.imageCollageInfo,
      format: EFormat.json
    });
  }

  /**
   * Gets a timeline of news coverage volume that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimeline(params: IGdeltApiBaseParams): Promise<ITimelineResponse> {
    return this._makeRequest<ITimelineResponse>({
      ...params,
      mode: EMode.timelineVolume,
      format: EFormat.json
    });
  }

  /**
   * Gets a timeline of news coverage volume with article info that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the timeline response
   */
  public async getTimelineWithArticles(params: IGdeltApiBaseParams): Promise<ITimelineResponse> {
    return this._makeRequest<ITimelineResponse>({
      ...params,
      mode: EMode.timelineVolumeInfo,
      format: EFormat.json
    });
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
  public async getTimelineTone(params: IGdeltApiBaseParams): Promise<ITimelineResponse> {
    return this._makeRequest<ITimelineResponse>({
      ...params,
      mode: EMode.timelineTone,
      format: EFormat.json
    });
  }

  /**
   * Gets a tone chart of news coverage that matches the query
   * @param params - The API parameters
   * @returns A promise that resolves to the tone chart response
   */
  public async getToneChart(params: IGdeltApiBaseParams): Promise<IToneChartResponse> {
    const response = await this._makeRequest<IToneChartResponse>({
      ...params,
      mode: EMode.toneChart,
      format: EFormat.json
    });
    
    // Ensure the response has the expected structure
    if (!response.tonechart) {
      // If the API returns an error message as a string, it will be caught in _makeRequest
      // This handles the case where the API returns a valid JSON response but without the expected structure
      throw new Error('Invalid response format from GDELT API: missing tonechart property');
    }
    
    return response;
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
  public createTimespan(value: number, unit: ETimespanUnit): string {
    return this._createTimespanString({ value, unit });
  }
}