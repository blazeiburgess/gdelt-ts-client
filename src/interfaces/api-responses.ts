/**
 * Interfaces for GDELT API responses
 */

/**
 * Base interface for all GDELT API responses
 */
export interface IGdeltApiResponse {
  /**
   * Status of the API request
   */
  status: string;
}

/**
 * Interface for an article in the GDELT API response
 */
export interface IArticle {
  /**
   * The URL of the article
   */
  url: string;

  /**
   * The title of the article
   */
  title: string;

  /**
   * The date the article was published
   * Format: YYYYMMDDHHMMSS
   */
  seendate: string;

  /**
   * The domain of the article
   */
  domain: string;

  /**
   * The country where the article was published
   */
  sourcecountry: string;

  /**
   * The language the article was originally published in
   */
  sourcelanguage: string;

  /**
   * The URL of the social sharing image for the article
   */
  socialimage?: string;

  /**
   * The tone score of the article
   * Range: -100 (extremely negative) to +100 (extremely positive)
   */
  tone?: number;
}

/**
 * Interface for the article list response
 */
export interface IArticleListResponse extends IGdeltApiResponse {
  /**
   * The list of articles that matched the query
   */
  articles: IArticle[];

  /**
   * The total number of articles that matched the query
   */
  count: number;
}

/**
 * Interface for an image in the GDELT API response
 */
export interface IImage {
  /**
   * The URL of the image
   */
  url: string;

  /**
   * The URL of the article containing the image
   */
  articleurl: string;

  /**
   * The date the image was seen
   * Format: YYYYMMDDHHMMSS
   */
  seendate: string;

  /**
   * The number of times the image has been seen on the web
   * Only available in ImageCollageInfo mode
   */
  webcount?: number;

  /**
   * The list of URLs where the image has been seen before
   * Only available in ImageCollageInfo mode
   */
  webexamples?: string[];

  /**
   * The date the image was captured according to its metadata
   * Format: YYYYMMDDHHMMSS
   * Only available in ImageCollageInfo mode
   */
  capturedate?: string;

  /**
   * Whether the image is older than 72 hours
   * Only available in ImageCollageInfo mode
   */
  oldimage?: boolean;

  /**
   * The tags assigned to the image by Google's algorithms
   * Only available when using imagetag in the query
   */
  tags?: string[];

  /**
   * The web tags derived from captions across the web
   * Only available when using imagewebtag in the query
   */
  webtags?: string[];

  /**
   * The average tone of human facial emotions in the image
   * Only available when using imagefacetone in the query
   */
  facetone?: number;

  /**
   * The number of human faces in the image
   * Only available when using imagenumfaces in the query
   */
  numfaces?: number;
}

/**
 * Interface for the image collage response
 */
export interface IImageCollageResponse extends IGdeltApiResponse {
  /**
   * The list of images that matched the query
   */
  images: IImage[];

  /**
   * The total number of images that matched the query
   */
  count: number;
}

/**
 * Interface for a timeline data point
 */
export interface ITimelineDataPoint {
  /**
   * The date of the data point
   * Format varies based on the timespan
   */
  date: string;

  /**
   * The value of the data point
   * For TimelineVol: percentage of all global coverage
   * For TimelineVolRaw: raw count of articles
   * For TimelineTone: average tone
   */
  value: number;

  /**
   * The total number of all articles monitored during that time interval
   * Only available in TimelineVolRaw mode
   */
  norm?: number;

  /**
   * The top 10 most relevant articles for this time step
   * Only available in TimelineVolInfo mode
   */
  articles?: IArticle[];
}

/**
 * Interface for the timeline response
 */
export interface ITimelineResponse extends IGdeltApiResponse {
  /**
   * The timeline data points
   */
  timeline: ITimelineDataPoint[];
}

/**
 * Interface for a language or country data point in timeline responses
 */
export interface ITimelineBreakdownDataPoint {
  /**
   * The date of the data point
   */
  date: string;

  /**
   * The values for each language or country
   * Key: language code or country code
   * Value: percentage or count
   */
  values: Record<string, number>;
}

/**
 * Interface for the timeline language or country breakdown response
 */
export interface ITimelineBreakdownResponse extends IGdeltApiResponse {
  /**
   * The timeline data points with language or country breakdown
   */
  timeline: ITimelineBreakdownDataPoint[];

  /**
   * The list of languages or countries in the response
   */
  labels: string[];
}

/**
 * Interface for a tone bin in the tone chart response
 */
export interface IToneBin {
  /**
   * The lower bound of the tone bin
   */
  min: number;

  /**
   * The upper bound of the tone bin
   */
  max: number;

  /**
   * The number of articles in this tone bin
   */
  count: number;

  /**
   * The top 10 most relevant articles in this tone bin
   */
  articles?: IArticle[];
}

/**
 * Interface for the tone chart response
 */
export interface IToneChartResponse extends IGdeltApiResponse {
  /**
   * The tone bins
   */
  bins: IToneBin[];
}

/**
 * Interface for a word cloud tag
 */
export interface IWordCloudTag {
  /**
   * The tag text
   */
  tag: string;

  /**
   * The weight of the tag (frequency)
   */
  weight: number;
}

/**
 * Interface for the word cloud response
 */
export interface IWordCloudResponse extends IGdeltApiResponse {
  /**
   * The word cloud tags
   */
  tags: IWordCloudTag[];
}