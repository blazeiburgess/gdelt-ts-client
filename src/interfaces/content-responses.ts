/**
 * Interfaces for content fetcher response types
 */

import { IArticle, IGdeltApiResponse } from './api-responses';

export interface IArticleContent {
  /**
   * Clean, parsed article text
   */
  text: string;

  /**
   * Extracted article title
   */
  title?: string;

  /**
   * Extracted author information
   */
  author?: string;

  /**
   * Extracted publish date
   */
  publishDate?: string;

  /**
   * Article language (detected)
   */
  language?: string;

  /**
   * Word count of the article
   */
  wordCount: number;

  /**
   * Raw HTML content (if requested)
   */
  rawHTML?: string;

  /**
   * Content extraction metadata
   */
  metadata: IContentMetadata;

  /**
   * Whether a paywall was detected
   */
  paywallDetected: boolean;

  /**
   * Content quality score (0-1)
   */
  qualityScore: number;
}

export interface IContentMetadata {
  /**
   * Open Graph metadata
   */
  openGraph?: Record<string, string>;

  /**
   * Twitter Card metadata
   */
  twitterCard?: Record<string, string>;

  /**
   * Article metadata
   */
  article?: Record<string, string>;

  /**
   * Canonical URL
   */
  canonicalUrl?: string;

  /**
   * Content extraction method used
   */
  extractionMethod: 'readability' | 'article-parser' | 'fallback';

  /**
   * Content extraction confidence (0-1)
   */
  extractionConfidence: number;
}

export interface IArticleContentResult {
  /**
   * Original article URL
   */
  url: string;

  /**
   * Whether content fetching was successful
   */
  success: boolean;

  /**
   * Article content (if successful)
   */
  content?: IArticleContent;

  /**
   * Error information (if failed)
   */
  error?: {
    message: string;
    code: string;
    statusCode?: number;
    retryCount: number;
  };

  /**
   * Fetch timing information
   */
  timing: {
    /**
     * Time taken to fetch content (ms)
     */
    fetchTime: number;

    /**
     * Time taken to parse content (ms)
     */
    parseTime: number;

    /**
     * Total time (ms)
     */
    totalTime: number;
  };
}

export interface IArticleWithContent extends IArticle {
  /**
   * Full article content
   */
  content?: IArticleContent;

  /**
   * Content fetch result
   */
  contentResult: IArticleContentResult;
}

export interface IArticleListWithContentResponse extends IGdeltApiResponse {
  /**
   * Articles with content
   */
  articles: IArticleWithContent[];

  /**
   * Total number of articles
   */
  count: number;

  /**
   * Content fetching statistics
   */
  contentStats: {
    /**
     * Number of articles with successfully fetched content
     */
    successCount: number;

    /**
     * Number of articles with failed content fetching
     */
    failureCount: number;

    /**
     * Average fetch time per article (ms)
     */
    averageFetchTime: number;

    /**
     * Total time spent fetching content (ms)
     */
    totalFetchTime: number;

    /**
     * Most common failure reasons
     */
    failureReasons: Record<string, number>;
  };
}