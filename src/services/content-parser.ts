/**
 * Content parser service with multi-layered content extraction
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { IArticleContent, IContentMetadata } from '../interfaces/content-responses';

export class ContentParserService {
  /**
   * Parse HTML content and extract clean article text
   * @param html - Raw HTML content
   * @param url - Original URL for context
   * @returns Parsed article content
   */
  public parseHTML(html: string, url: string): IArticleContent {
    try {
      // 1. Try Mozilla Readability for best results
      const readabilityResult = this._tryReadability(html, url);
      if (readabilityResult) {
        return readabilityResult;
      }
    } catch (error) {
      console.warn('Readability extraction failed:', error);
    }

    // 2. Fallback to heuristic extraction
    return this._extractUsingHeuristics(html, url);
  }

  /**
   * Detect if content appears to be behind a paywall
   * @param html - Raw HTML content
   * @returns True if paywall detected, false otherwise
   */
  public detectPaywall(html: string): boolean {
    const paywallIndicators = [
      'paywall',
      'subscription required',
      'subscribe to read',
      'premium content',
      'members only',
      'sign up to continue',
      'register to read',
      'unlock this article',
      'subscriber exclusive',
      'subscription-only'
    ];

    const lowerHtml = html.toLowerCase();
    return paywallIndicators.some(indicator => lowerHtml.includes(indicator));
  }

  /**
   * Extract metadata from HTML content
   * @param html - Raw HTML content
   * @returns Content metadata
   */
  public extractMetadata(html: string): IContentMetadata {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const openGraph: Record<string, string> = {};
    const twitterCard: Record<string, string> = {};
    const article: Record<string, string> = {};
    
    // Extract Open Graph metadata
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property')?.replace('og:', '');
      const content = tag.getAttribute('content');
      if (property && content) {
        openGraph[property] = content;
      }
    });
    
    // Extract Twitter Card metadata
    const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
    twitterTags.forEach(tag => {
      const name = tag.getAttribute('name')?.replace('twitter:', '');
      const content = tag.getAttribute('content');
      if (name && content) {
        twitterCard[name] = content;
      }
    });
    
    // Extract article metadata
    const articleTags = document.querySelectorAll('meta[property^="article:"]');
    articleTags.forEach(tag => {
      const property = tag.getAttribute('property')?.replace('article:', '');
      const content = tag.getAttribute('content');
      if (property && content) {
        article[property] = content;
      }
    });
    
    // Extract canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = canonicalLink?.getAttribute('href') ?? undefined;
    
    return {
      openGraph,
      twitterCard,
      article,
      canonicalUrl: canonicalUrl ?? '',
      extractionMethod: 'fallback',
      extractionConfidence: 0.5
    };
  }

  /**
   * Try Mozilla Readability for content extraction
   * @param html - Raw HTML content
   * @param url - Original URL
   * @returns Parsed content or null if failed
   * @private
   */
  private _tryReadability(html: string, url: string): IArticleContent | null {
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;
    
    const reader = new Readability(document);
    
    // Note: isProbablyReaderable() is not available in newer versions of Readability
    
    const article = reader.parse();
    if (!article?.content || article.content.length < 200) {
      return null;
    }
    
    const metadata = this.extractMetadata(html);
    metadata.extractionMethod = 'readability';
    metadata.extractionConfidence = 0.9;
    
    return {
      text: this._stripHtml(article.content),
      title: article.title ?? '',
      author: article.byline ?? '',
      publishDate: this._extractDateFromMetadata(metadata) ?? '',
      language: this._detectLanguage(article.content) ?? '',
      wordCount: this._countWords(this._stripHtml(article.content)),
      metadata,
      paywallDetected: this.detectPaywall(html),
      qualityScore: this._calculateQualityScore(article.content, metadata)
    };
  }


  /**
   * Extract content using heuristic methods
   * @param html - Raw HTML content
   * @param url - Original URL
   * @returns Parsed content
   * @private
   */
  private _extractUsingHeuristics(html: string, url: string): IArticleContent {
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;
    
    // Remove script and style elements
    const scriptsAndStyles = document.querySelectorAll('script, style, nav, header, footer, aside');
    scriptsAndStyles.forEach(element => element.remove());
    
    // Look for article content in common containers
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.article-body',
      '.post-content',
      '.entry-content',
      '.content',
      '.story-body',
      '.article-content',
      'main'
    ];
    
    let content = '';
    let title = '';
    let author = '';
    
    // Try to find title
    const titleElement = document.querySelector('h1, .title, .headline, .article-title');
    if (titleElement) {
      title = titleElement.textContent?.trim() ?? '';
    }
    
    // Try to find author
    const authorElement = document.querySelector('.author, .byline, [rel="author"], .writer');
    if (authorElement) {
      author = authorElement.textContent?.trim() ?? '';
    }
    
    // Try to find content
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = element.textContent?.trim() ?? '';
        if (content.length > 200) {
          break;
        }
      }
    }
    
    // If still no content, try to extract from paragraphs
    if (content.length < 200) {
      const paragraphs = document.querySelectorAll('p');
      const texts: string[] = [];
      
      paragraphs.forEach(p => {
        const text = p.textContent?.trim();
        if (text && text.length > 50) {
          texts.push(text);
        }
      });
      
      content = texts.join('\n\n');
    }
    
    const metadata = this.extractMetadata(html);
    metadata.extractionMethod = 'fallback';
    metadata.extractionConfidence = 0.3;
    
    return {
      text: content,
      title: title || '',
      author: author || '',
      publishDate: this._extractDateFromMetadata(metadata) ?? '',
      language: this._detectLanguage(content) ?? '',
      wordCount: this._countWords(content),
      metadata,
      paywallDetected: this.detectPaywall(html),
      qualityScore: this._calculateQualityScore(content, metadata)
    };
  }

  /**
   * Strip HTML tags from content
   * @param html - HTML content
   * @returns Plain text
   * @private
   */
  private _stripHtml(html: string): string {
    // Create a new JSDOM instance with the HTML content
    const dom = new JSDOM(`<body>${html}</body>`);
    return dom.window.document.body.textContent ?? '';
  }

  /**
   * Count words in text
   * @param text - Plain text
   * @returns Word count
   * @private
   */
  private _countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Simple language detection based on common words
   * @param text - Plain text
   * @returns Language code or undefined
   * @private
   */
  private _detectLanguage(text: string): string | undefined {
    const lowerText = text.toLowerCase();
    
    // Simple heuristics for common languages
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'];
    const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'];
    const germanWords = ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'];
    
    const englishMatches = englishWords.filter(word => lowerText.includes(` ${word} `)).length;
    const spanishMatches = spanishWords.filter(word => lowerText.includes(` ${word} `)).length;
    const frenchMatches = frenchWords.filter(word => lowerText.includes(` ${word} `)).length;
    const germanMatches = germanWords.filter(word => lowerText.includes(` ${word} `)).length;
    
    const maxMatches = Math.max(englishMatches, spanishMatches, frenchMatches, germanMatches);
    
    if (maxMatches < 2) {
      return undefined;
    }
    
    if (englishMatches === maxMatches) return 'en';
    if (spanishMatches === maxMatches) return 'es';
    if (frenchMatches === maxMatches) return 'fr';
    if (germanMatches === maxMatches) return 'de';
    
    return undefined;
  }

  /**
   * Extract publish date from metadata
   * @param metadata - Content metadata
   * @returns Date string or undefined
   * @private
   */
  private _extractDateFromMetadata(metadata: IContentMetadata): string | undefined {
    return metadata.article?.['published_time'] ??
           metadata.openGraph?.['published_time'] ??
           metadata.article?.['modified_time'] ??
           metadata.openGraph?.['updated_time'] ??
           undefined;
  }

  /**
   * Calculate content quality score
   * @param content - Content text
   * @param metadata - Content metadata
   * @returns Quality score between 0 and 1
   * @private
   */
  private _calculateQualityScore(content: string, metadata: IContentMetadata): number {
    let score = 0;
    
    // Base score from extraction method
    if (metadata.extractionMethod === 'readability') {
      score += 0.4;
    } else {
      score += 0.1;
    }
    
    // Content length score
    const textLength = this._stripHtml(content).length;
    if (textLength > 1000) {
      score += 0.3;
    } else if (textLength > 500) {
      score += 0.2;
    } else if (textLength > 200) {
      score += 0.1;
    }
    
    // Metadata completeness score
    if (metadata.openGraph && Object.keys(metadata.openGraph).length > 0) {
      score += 0.1;
    }
    
    if (metadata.article && Object.keys(metadata.article).length > 0) {
      score += 0.1;
    }
    
    if (metadata.canonicalUrl) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }
}