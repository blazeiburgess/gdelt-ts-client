/**
 * Enhanced types for better developer experience and type safety
 */

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Mode constants using const assertions for better IntelliSense and extensibility
 */
export const Mode = {
  ARTICLE_LIST: 'artlist',
  ARTICLE_GALLERY: 'artgallery',
  IMAGE_COLLAGE: 'imagecollage',
  IMAGE_COLLAGE_INFO: 'imagecollageinfo',
  IMAGE_GALLERY: 'imagegallery',
  IMAGE_COLLAGE_SHARE: 'imagecollagesshare',
  TIMELINE_VOLUME: 'timelinevol',
  TIMELINE_VOLUME_RAW: 'timelinevolraw',
  TIMELINE_VOLUME_INFO: 'timelinevolinfo',
  TIMELINE_TONE: 'timelinetone',
  TIMELINE_LANGUAGE: 'timelinelang',
  TIMELINE_SOURCE_COUNTRY: 'timelinesourcecountry',
  TONE_CHART: 'tonechart',
  WORD_CLOUD_IMAGE_TAGS: 'wordcloudimagetags',
  WORD_CLOUD_IMAGE_WEB_TAGS: 'wordcloudimagewebtags'
} as const;

export type ModeType = typeof Mode[keyof typeof Mode];

/**
 * Format constants using const assertions
 */
export const Format = {
  HTML: 'html',
  CSV: 'csv',
  RSS: 'rss',
  RSS_ARCHIVE: 'rssarchive',
  JSON: 'json',
  JSONP: 'jsonp',
  JSON_FEED: 'jsonfeed'
} as const;

export type FormatType = typeof Format[keyof typeof Format];

/**
 * Timespan unit constants using const assertions
 */
export const TimespanUnit = {
  MINUTES: 'min',
  HOURS: 'h',
  DAYS: 'd',
  WEEKS: 'w',
  MONTHS: 'm'
} as const;

export type TimespanUnitType = typeof TimespanUnit[keyof typeof TimespanUnit];

/**
 * Sort option constants using const assertions
 */
export const SortOrder = {
  DATE_DESC: 'datedesc',
  DATE_ASC: 'dateasc',
  TONE_DESC: 'tonedesc',
  TONE_ASC: 'toneasc',
  HYBRID_RELEVANCE: 'hybridrel'
} as const;

export type SortOrderType = typeof SortOrder[keyof typeof SortOrder];

// ===== TEMPLATE LITERAL TYPES FOR QUERY VALIDATION =====

/**
 * Template literal types for timespan validation
 */
export type TimespanString = 
  | `${number}min`
  | `${number}h`
  | `${number}d`
  | `${number}w`
  | `${number}m`;

/**
 * Template literal types for datetime validation (YYYYMMDDHHMMSS)
 */
export type DateTimeString = `${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}`;

/**
 * Template literal types for tone queries
 */
export type ToneQuery = 
  | `tone>${number}`
  | `tone<${number}`
  | `tone=${number}`
  | `toneabs>${number}`
  | `toneabs<${number}`
  | `toneabs=${number}`;

/**
 * Template literal types for domain queries
 */
export type DomainQuery = `domain:${string}` | `domainis:${string}`;

/**
 * Template literal types for source queries
 */
export type SourceQuery = 
  | `sourcecountry:${string}`
  | `sourcelang:${string}`;

/**
 * Template literal types for image queries
 */
export type ImageQuery = 
  | `imagetag:"${string}"`
  | `imagewebtag:"${string}"`
  | `imageocrmeta:"${string}"`
  | `imagefacetone>${number}`
  | `imagefacetone<${number}`
  | `imagenumfaces>${number}`
  | `imagenumfaces<${number}`
  | `imagenumfaces=${number}`
  | `imagewebcount>${number}`
  | `imagewebcount<${number}`;

/**
 * Template literal types for proximity queries
 */
export type ProximityQuery = `near${number}:"${string}"`;

/**
 * Template literal types for repeat queries
 */
export type RepeatQuery = `repeat${number}:"${string}"`;

/**
 * Template literal types for theme queries
 */
export type ThemeQuery = `theme:${string}`;

// ===== UTILITY TYPES FOR COMMON OPERATIONS =====

/**
 * Utility type for creating strongly typed query builders
 */
export type QueryComponent = 
  | string
  | ToneQuery
  | DomainQuery
  | SourceQuery
  | ImageQuery
  | ProximityQuery
  | RepeatQuery
  | ThemeQuery;

/**
 * Utility type for boolean OR queries
 */
export type BooleanOrQuery<T extends string = string> = `(${T}${` OR ${T}`})`;

/**
 * Utility type for phrase queries
 */
export type PhraseQuery<T extends string = string> = `"${T}"`;

/**
 * Utility type for negation queries
 */
export type NegationQuery<T extends QueryComponent = QueryComponent> = `-${T}`;

/**
 * Complex query type that combines multiple query components
 */
export type ComplexQuery = 
  | QueryComponent
  | BooleanOrQuery<string>
  | PhraseQuery<string>
  | NegationQuery<QueryComponent>
  | `${QueryComponent} AND ${QueryComponent}`
  | `${QueryComponent} OR ${QueryComponent}`
  | `${QueryComponent} NOT ${QueryComponent}`;

// ===== MODE-SPECIFIC PARAMETER TYPES =====

/**
 * Parameters specific to article list modes
 */
export interface ArticleListParams {
  maxrecords?: number;
  sort?: SortOrderType;
}

/**
 * Parameters specific to timeline modes
 */
export interface TimelineParams {
  timelinesmooth?: number;
  timezoom?: 'yes' | 'no';
}

/**
 * Parameters specific to image modes
 */
export interface ImageParams {
  maxrecords?: number;
}

/**
 * Conditional parameter types based on mode
 */
export type ModeSpecificParams<T extends ModeType> = 
  T extends typeof Mode.ARTICLE_LIST | typeof Mode.ARTICLE_GALLERY ? ArticleListParams :
  T extends typeof Mode.TIMELINE_VOLUME | typeof Mode.TIMELINE_VOLUME_RAW | typeof Mode.TIMELINE_VOLUME_INFO | typeof Mode.TIMELINE_TONE | typeof Mode.TIMELINE_LANGUAGE | typeof Mode.TIMELINE_SOURCE_COUNTRY ? TimelineParams :
  T extends typeof Mode.IMAGE_COLLAGE | typeof Mode.IMAGE_COLLAGE_INFO | typeof Mode.IMAGE_GALLERY | typeof Mode.IMAGE_COLLAGE_SHARE ? ImageParams :
  Record<string, never>;

// ===== ENHANCED PARAMETER TYPES =====

/**
 * Enhanced base parameters with stronger typing
 */
export interface EnhancedGdeltApiParams<TMode extends ModeType = ModeType> {
  /**
   * The search query with enhanced type validation
   */
  query: string | ComplexQuery;

  /**
   * The output mode with const assertion types
   */
  mode?: TMode;

  /**
   * The output format with const assertion types
   */
  format?: FormatType;

  /**
   * Strongly typed timespan parameter
   */
  timespan?: TimespanString;

  /**
   * Strongly typed start datetime
   */
  startdatetime?: DateTimeString;

  /**
   * Strongly typed end datetime
   */
  enddatetime?: DateTimeString;

  /**
   * Translation options
   */
  trans?: 'googtrans';

  /**
   * JSONP callback (only when format is JSONP)
   */
  callback?: FormatType extends typeof Format.JSONP ? string : never;
}

/**
 * Complete parameter type that combines base params with mode-specific params
 */
export type CompleteGdeltApiParams<TMode extends ModeType = ModeType> = 
  EnhancedGdeltApiParams<TMode> & ModeSpecificParams<TMode>;

// ===== UTILITY TYPES FOR COMMON PATTERNS =====

/**
 * Utility type for extracting the return type based on mode
 */
export type ResponseTypeForMode<T extends ModeType> = 
  T extends typeof Mode.ARTICLE_LIST | typeof Mode.ARTICLE_GALLERY ? 'ArticleListResponse' :
  T extends typeof Mode.IMAGE_COLLAGE | typeof Mode.IMAGE_COLLAGE_INFO | typeof Mode.IMAGE_GALLERY | typeof Mode.IMAGE_COLLAGE_SHARE ? 'ImageResponse' :
  T extends typeof Mode.TIMELINE_VOLUME | typeof Mode.TIMELINE_VOLUME_RAW | typeof Mode.TIMELINE_VOLUME_INFO | typeof Mode.TIMELINE_TONE ? 'TimelineResponse' :
  T extends typeof Mode.TIMELINE_LANGUAGE | typeof Mode.TIMELINE_SOURCE_COUNTRY ? 'TimelineBreakdownResponse' :
  T extends typeof Mode.TONE_CHART ? 'ToneChartResponse' :
  T extends typeof Mode.WORD_CLOUD_IMAGE_TAGS | typeof Mode.WORD_CLOUD_IMAGE_WEB_TAGS ? 'WordCloudResponse' :
  'UnknownResponse';

/**
 * Utility type for creating type-safe method overloads
 */
export interface MethodOverload<TParams, TReturn> {
  (params: TParams): Promise<TReturn>;
  (query: string): Promise<TReturn>;
  (query: string, options: Partial<TParams>): Promise<TReturn>;
}

// ===== BRANDED TYPES FOR ADDITIONAL SAFETY =====

/**
 * Branded type for validated queries
 */
export type ValidatedQuery = string & { readonly __brand: 'ValidatedQuery' };

/**
 * Branded type for validated timespan
 */
export type ValidatedTimespan = string & { readonly __brand: 'ValidatedTimespan' };

/**
 * Branded type for validated datetime
 */
export type ValidatedDateTime = string & { readonly __brand: 'ValidatedDateTime' };

// ===== TYPE PREDICATES AND GUARDS =====

/**
 * Type predicate for validating timespan format
 */
export function isValidTimespan(value: string): value is TimespanString {
  return /^\d+(min|h|d|w|m)$/.test(value);
}

/**
 * Type predicate for validating datetime format
 */
export function isValidDateTime(value: string): value is DateTimeString {
  return /^\d{14}$/.test(value);
}

/**
 * Type predicate for validating maxrecords range
 */
export function isValidMaxRecords(value: number): value is number {
  return Number.isInteger(value) && value >= 1 && value <= 250;
}

/**
 * Type predicate for validating timelinesmooth range
 */
export function isValidTimelineSmooth(value: number): value is number {
  return Number.isInteger(value) && value >= 1 && value <= 30;
}