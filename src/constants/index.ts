/**
 * Constants for the GDELT API
 */

/**
 * Base URL for the GDELT API
 */
export const API_BASE_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

/**
 * Enum for the different output modes of the GDELT API
 * @enum {string}
 */
export enum EMode {
  /**
   * Simple list of news articles that matched the query
   */
  articleList = 'artlist',
  
  /**
   * High design visual layout of articles with social sharing images
   */
  articleGallery = 'artgallery',
  
  /**
   * Displays all matching images processed by GDELT Visual Global Knowledge Graph
   */
  imageCollage = 'imagecollage',
  
  /**
   * Same as imageCollage but with additional information about each image
   */
  imageCollageInfo = 'imagecollageinfo',
  
  /**
   * High design visual layout of images
   */
  imageGallery = 'imagegallery',
  
  /**
   * List of social sharing images from matching articles
   */
  imageCollageShare = 'imagecollagesshare',
  
  /**
   * Timeline of news coverage volume by day/hour/15 minutes
   */
  timelineVolume = 'timelinevol',
  
  /**
   * Same as timelineVolume but returns raw counts instead of percentages
   */
  timelineVolumeRaw = 'timelinevolraw',
  
  /**
   * Same as timelineVolume but displays top 10 most relevant articles for each time step
   */
  timelineVolumeInfo = 'timelinevolinfo',
  
  /**
   * Timeline of average tone of matching coverage
   */
  timelineTone = 'timelinetone',
  
  /**
   * Timeline of coverage volume broken down by language
   */
  timelineLanguage = 'timelinelang',
  
  /**
   * Timeline of coverage volume broken down by source country
   */
  timelineSourceCountry = 'timelinesourcecountry',
  
  /**
   * Emotional histogram showing tonal distribution of coverage
   */
  toneChart = 'tonechart',
  
  /**
   * Word cloud of image tags from VGKG-processed images
   */
  wordCloudImageTags = 'wordcloudimagetags',
  
  /**
   * Word cloud of image web tags from VGKG-processed images
   */
  wordCloudImageWebTags = 'wordcloudimagewebtags'
}

/**
 * Enum for the different output formats of the GDELT API
 * @enum {string}
 */
export enum EFormat {
  /**
   * Browser-based visualization or display
   */
  html = 'html',
  
  /**
   * Comma-delimited format
   */
  csv = 'csv',
  
  /**
   * RSS 2.0 format (only available in ArticleList mode)
   */
  rss = 'rss',
  
  /**
   * Extended RSS format with mobile/AMP versions (only available in ArticleList mode)
   */
  rssArchive = 'rssarchive',
  
  /**
   * JSON format
   */
  json = 'json',
  
  /**
   * JSONP format
   */
  jsonp = 'jsonp',
  
  /**
   * JSONFeed 1.0 format (only available in ArticleList mode)
   */
  jsonFeed = 'jsonfeed'
}

/**
 * Enum for the different timespan units of the GDELT API
 * @enum {string}
 */
export enum ETimespanUnit {
  /**
   * Minutes
   */
  minutes = 'min',
  
  /**
   * Hours
   */
  hours = 'h',
  
  /**
   * Days
   */
  days = 'd',
  
  /**
   * Weeks
   */
  weeks = 'w',
  
  /**
   * Months
   */
  months = 'm'
}

/**
 * Enum for the different sort options of the GDELT API
 * @enum {string}
 */
export enum ESort {
  /**
   * Sort by date, newest first
   */
  dateDesc = 'datedesc',
  
  /**
   * Sort by date, oldest first
   */
  dateAsc = 'dateasc',
  
  /**
   * Sort by tone, most positive first
   */
  toneDesc = 'tonedesc',
  
  /**
   * Sort by tone, most negative first
   */
  toneAsc = 'toneasc',
  
  /**
   * Default relevance sorting mode
   */
  hybridRelevance = 'hybridrel'
}

/**
 * Enum for the different translation options of the GDELT API
 * @enum {string}
 */
export enum ETranslation {
  /**
   * Google Translate Widget
   */
  googleTranslate = 'googtrans'
}

/**
 * Enum for the different time zoom options of the GDELT API
 * @enum {string}
 */
export enum ETimeZoom {
  /**
   * Enable interactive zooming
   */
  enabled = 'yes',
  
  /**
   * Disable interactive zooming
   */
  disabled = 'no'
}