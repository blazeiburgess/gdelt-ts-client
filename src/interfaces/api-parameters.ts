import { EFormat, EMode, ESort, ETimeZoom, ETranslation, ETimespanUnit } from '../constants';

/**
 * Interface for the GDELT API query operators
 * These operators are used within the query parameter
 */
export interface IQueryOperators {
  /**
   * Returns all coverage from the specified domain
   * @example domain:cnn.com
   */
  domain?: string;

  /**
   * Requires an exact match for domain, allowing searching for common short domains
   * @example domainis:un.org
   */
  domainIs?: string;

  /**
   * Searches the average "tone" of human facial emotions in each image
   * @example imagefacetone<-1.5
   */
  imageFaceTone?: string;

  /**
   * Searches the total number of foreground human faces in the image
   * @example imagenumfaces>3
   */
  imageNumFaces?: string;

  /**
   * Searches a combination of OCR results, metadata, and caption
   * @example imageocrmeta:"zika"
   */
  imageOCRMeta?: string;

  /**
   * Searches for images with specific tags assigned by Google's algorithms
   * @example imagetag:"safesearchviolence"
   */
  imageTag?: string;

  /**
   * Searches for images that have appeared a certain number of times on the web
   * @example imagewebcount<10
   */
  imageWebCount?: string;

  /**
   * Searches for images with specific tags derived from web captions
   * @example imagewebtag:"drone"
   */
  imageWebTag?: string;

  /**
   * Allows specifying words that must appear within a given distance of each other
   * @example near20:"trump putin"
   */
  near?: string;

  /**
   * Requires a word to appear at least a certain number of times in a document
   * @example repeat3:"trump"
   */
  repeat?: string;

  /**
   * Searches for articles published in outlets located in a particular country
   * @example sourcecountry:france
   */
  sourceCountry?: string;

  /**
   * Searches for articles originally published in the given language
   * @example sourcelang:spanish
   */
  sourceLang?: string;

  /**
   * Searches for any of the GDELT Global Knowledge Graph (GKG) Themes
   * @example theme:TERROR
   */
  theme?: string;

  /**
   * Filters for articles above or below a particular tone score
   * @example tone<-5
   */
  tone?: string;

  /**
   * Searches for high emotion or low emotion articles, regardless of positive/negative
   * @example toneabs>10
   */
  toneAbs?: string;
}

/**
 * Interface for the GDELT API base parameters
 */
export interface IGdeltApiBaseParams {
  /**
   * The search query
   * Can include keywords, phrases, and operators
   */
  query: string;

  /**
   * The output mode
   * Determines the type of visualization or data returned
   */
  mode?: EMode;

  /**
   * The output format
   * Determines the format of the returned data (HTML, JSON, CSV, etc.)
   */
  format?: EFormat;

  /**
   * The timespan to search
   * Specifies the number of months, weeks, days, hours, or minutes to search
   * @example "1d" for 1 day, "2h" for 2 hours, "30min" for 30 minutes
   */
  timespan?: string;

  /**
   * The start date/time to search
   * Format: YYYYMMDDHHMMSS
   * Must be within the last 3 months
   */
  startdatetime?: string;

  /**
   * The end date/time to search
   * Format: YYYYMMDDHHMMSS
   * Must be within the last 3 months
   */
  enddatetime?: string;

  /**
   * The maximum number of records to return
   * Only applies to ArticleList and ImageCollage modes
   * Default: 75, Maximum: 250
   */
  maxrecords?: number;

  /**
   * The number of time steps to smooth over
   * Only available in Timeline modes
   * Maximum: 30
   */
  timelinesmooth?: number;

  /**
   * The translation widget to embed
   * Only available in ArticleList mode with HTML output
   */
  trans?: ETranslation;

  /**
   * The sort order for results
   * Default: relevance
   */
  sort?: ESort;

  /**
   * Whether to enable interactive zooming of the timeline
   * Only available for timeline modes in HTML format
   */
  timezoom?: ETimeZoom;

  /**
   * The callback function name for JSONP format
   * Only used when format is JSONP
   */
  callback?: string;
}

/**
 * Interface for creating a timespan parameter
 */
export interface ITimespan {
  /**
   * The value of the timespan
   */
  value: number;

  /**
   * The unit of the timespan
   */
  unit: ETimespanUnit;
}

/**
 * Interface for the GDELT API client configuration
 */
export interface IGdeltClientConfig {
  /**
   * The base URL for the GDELT API
   * @default "https://api.gdeltproject.org/api/v2/doc/doc"
   */
  baseUrl?: string;

  /**
   * The default format for API responses
   * @default EFormat.json
   */
  defaultFormat?: EFormat;

  /**
   * The timeout for API requests in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Whether to retry failed requests
   * @default true
   */
  retry?: boolean;

  /**
   * The maximum number of retries for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * The delay between retries in milliseconds
   * @default 1000 (1 second)
   */
  retryDelay?: number;
}