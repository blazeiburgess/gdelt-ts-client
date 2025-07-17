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
  private async _makeRequest<T>(params: IGdeltApiBaseParams): Promise<T> {
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
    console.log('Raw API response:', JSON.stringify(response.data, null, 2));
    
    // Handle string responses (error messages)
    if (typeof response.data === 'string') {
      throw new Error(response.data);
    }
    
    // Add missing properties to the response
    const data = response.data as any;
    
    // Add status if missing
    if (!data.status) {
      data.status = 'ok';
    }
    
    // Add count property for article list responses
    if (data.articles && !data.count) {
      data.count = data.articles.length;
    }
    
    // Add count property for image collage responses
    if (data.images && !data.count) {
      data.count = data.images.length;
    }
    
    return data as T;
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
    return this._makeRequest<IToneChartResponse>({
      ...params,
      mode: EMode.toneChart,
      format: EFormat.json
    });
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