/**
 * Enhanced query builder with TypeScript template literal types and IntelliSense support
 */

/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/naming-convention, @typescript-eslint/prefer-nullish-coalescing */

// Import only what we need to avoid circular dependencies

// ===== QUERY BUILDER CLASS =====

/**
 * Fluent query builder for constructing complex GDELT queries with type safety
 */
export class QueryBuilder {
  private components: string[] = [];

  /**
   * Add a basic search term or phrase
   */
  public search(term: string): this {
    this.components.push(term);
    return this;
  }

  /**
   * Add a phrase search (exact match)
   */
  public phrase(phrase: string): this {
    this.components.push(`"${phrase}"`);
    return this;
  }

  /**
   * Add multiple terms with OR logic
   */
  public anyOf(...terms: string[]): this {
    if (terms.length > 1) {
      this.components.push(`(${terms.join(' OR ')})`);
    } else if (terms.length === 1 && terms[0]) {
      this.components.push(terms[0]);
    }
    return this;
  }

  /**
   * Add multiple terms with AND logic
   */
  public allOf(...terms: string[]): this {
    terms.forEach(term => this.components.push(term));
    return this;
  }

  /**
   * Exclude a term or phrase
   */
  not(term: string): this {
    this.components.push(`-${term}`);
    return this;
  }

  /**
   * Filter by domain
   */
  fromDomain(domain: string, exact = false): this {
    const operator = exact ? 'domainis' : 'domain';
    this.components.push(`${operator}:${domain}`);
    return this;
  }

  /**
   * Filter by source country
   */
  fromCountry(country: string): this {
    this.components.push(`sourcecountry:${country}`);
    return this;
  }

  /**
   * Filter by source language
   */
  inLanguage(language: string): this {
    this.components.push(`sourcelang:${language}`);
    return this;
  }

  /**
   * Filter by tone (emotional sentiment)
   */
  withTone(operator: '>' | '<' | '=', value: number): this {
    this.components.push(`tone${operator}${value}`);
    return this;
  }

  /**
   * Filter by absolute tone (emotional intensity)
   */
  withAbsoluteTone(operator: '>' | '<' | '=', value: number): this {
    this.components.push(`toneabs${operator}${value}`);
    return this;
  }

  /**
   * Filter for positive tone articles
   */
  withPositiveTone(threshold = 2): this {
    return this.withTone('>', threshold);
  }

  /**
   * Filter for negative tone articles
   */
  withNegativeTone(threshold = -2): this {
    return this.withTone('<', threshold);
  }

  /**
   * Filter for neutral tone articles
   */
  withNeutralTone(range = 1): this {
    this.components.push(`toneabs<${range}`);
    return this;
  }

  /**
   * Filter for highly emotional articles (regardless of positive/negative)
   */
  withHighEmotion(threshold = 5): this {
    return this.withAbsoluteTone('>', threshold);
  }

  /**
   * Filter by GDELT theme
   */
  withTheme(theme: string): this {
    this.components.push(`theme:${theme.toUpperCase()}`);
    return this;
  }

  /**
   * Filter for images with specific tags
   */
  withImageTag(tag: string): this {
    this.components.push(`imagetag:"${tag}"`);
    return this;
  }

  /**
   * Filter for images with web tags
   */
  withImageWebTag(tag: string): this {
    this.components.push(`imagewebtag:"${tag}"`);
    return this;
  }

  /**
   * Filter for images with OCR/metadata content
   */
  withImageOCR(content: string): this {
    this.components.push(`imageocrmeta:"${content}"`);
    return this;
  }

  /**
   * Filter by image face count
   */
  withImageFaceCount(operator: '>' | '<' | '=', count: number): this {
    this.components.push(`imagenumfaces${operator}${count}`);
    return this;
  }

  /**
   * Filter by image face tone
   */
  withImageFaceTone(operator: '>' | '<' | '=', tone: number): this {
    this.components.push(`imagefacetone${operator}${tone}`);
    return this;
  }

  /**
   * Filter by how often image appears on web
   */
  withImageWebCount(operator: '>' | '<' | '=', count: number): this {
    this.components.push(`imagewebcount${operator}${count}`);
    return this;
  }

  /**
   * Filter for novel images (rarely seen on web)
   */
  withNovelImages(threshold = 10): this {
    return this.withImageWebCount('<', threshold);
  }

  /**
   * Filter for popular images (frequently seen on web)
   */
  withPopularImages(threshold = 100): this {
    return this.withImageWebCount('>', threshold);
  }

  /**
   * Add proximity constraint (words must appear within distance)
   */
  withProximity(distance: number, ...words: string[]): this {
    if (words.length >= 2) {
      this.components.push(`near${distance}:"${words.join(' ')}"`);
    }
    return this;
  }

  /**
   * Require word to appear minimum number of times
   */
  withRepeat(count: number, word: string): this {
    this.components.push(`repeat${count}:"${word}"`);
    return this;
  }

  /**
   * Add custom query component
   */
  custom(query: string): this {
    this.components.push(query);
    return this;
  }

  /**
   * Group current components with parentheses
   */
  group(): this {
    if (this.components.length > 1) {
      const grouped = `(${this.components.join(' ')})`;
      this.components = [grouped];
    }
    return this;
  }

  /**
   * Clear all components and start fresh
   */
  clear(): this {
    this.components = [];
    return this;
  }

  /**
   * Build the final query string
   */
  build(): string {
    return this.components.join(' ');
  }

  /**
   * Get a copy of the current components
   */
  getComponents(): string[] {
    return [...this.components];
  }

  /**
   * Check if the builder has any components
   */
  isEmpty(): boolean {
    return this.components.length === 0;
  }
}

// ===== SPECIALIZED QUERY BUILDERS =====

/**
 * Query builder specialized for article searches
 */
export class ArticleQueryBuilder extends QueryBuilder {
  /**
   * Search for breaking news articles
   */
  breakingNews(): this {
    return this.anyOf('breaking', 'urgent', 'just in', 'developing');
  }

  /**
   * Search for opinion articles
   */
  opinions(): this {
    return this.anyOf('opinion', 'editorial', 'commentary', 'analysis');
  }

  /**
   * Search for local news
   */
  localNews(location?: string): this {
    if (location) {
      return this.allOf('local', location);
    }
    return this.search('local');
  }
}

/**
 * Query builder specialized for image searches
 */
export class ImageQueryBuilder extends QueryBuilder {
  /**
   * Search for violent content images
   */
  violentContent(): this {
    return this.withImageTag('safesearchviolence');
  }

  /**
   * Search for medical content images
   */
  medicalContent(): this {
    return this.withImageTag('safesearchmedical');
  }

  /**
   * Search for disaster-related images
   */
  disasters(): this {
    return this.anyOf(
      'imagetag:"flood"',
      'imagetag:"fire"',
      'imagetag:"earthquake"',
      'imagetag:"rubble"'
    );
  }

  /**
   * Search for political event images
   */
  politicalEvents(): this {
    return this.anyOf(
      'imagetag:"crowd"',
      'imagetag:"protest"',
      'imagetag:"rally"',
      'imagetag:"podium"'
    );
  }

  /**
   * Search for happy/positive images
   */
  positiveImages(): this {
    return this.withImageFaceTone('>', 1);
  }

  /**
   * Search for sad/negative images
   */
  negativeImages(): this {
    return this.withImageFaceTone('<', -1);
  }
}

// ===== QUERY HELPER FUNCTIONS =====

/**
 * Create a new general query builder
 */
export function createQuery(): QueryBuilder {
  return new QueryBuilder();
}

/**
 * Create a new article-specialized query builder
 */
export function createArticleQuery(): ArticleQueryBuilder {
  return new ArticleQueryBuilder();
}

/**
 * Create a new image-specialized query builder
 */
export function createImageQuery(): ImageQueryBuilder {
  return new ImageQueryBuilder();
}

/**
 * Create a quick phrase query
 */
export function phrase(text: string): string {
  return `"${text}"`;
}

/**
 * Create a quick OR query
 */
export function anyOf(...terms: string[]): string {
  if (terms.length === 0) return '';
  if (terms.length === 1) return terms[0] || '';
  return `(${terms.join(' OR ')})`;
}

/**
 * Create a quick exclusion query
 */
export function exclude(term: string): string {
  return `-${term}`;
}

/**
 * Create a domain filter
 */
export function fromDomain(domain: string, exact = false): string {
  const operator = exact ? 'domainis' : 'domain';
  return `${operator}:${domain}`;
}

/**
 * Create a country filter
 */
export function fromCountry(country: string): string {
  return `sourcecountry:${country}`;
}

/**
 * Create a language filter
 */
export function inLanguage(language: string): string {
  return `sourcelang:${language}`;
}

/**
 * Create a tone filter
 */
export function withTone(operator: '>' | '<' | '=', value: number): string {
  return `tone${operator}${value}`;
}

/**
 * Create a theme filter
 */
export function withTheme(theme: string): string {
  return `theme:${theme.toUpperCase()}`;
}

// ===== QUERY VALIDATION HELPERS =====

/**
 * Validate that a query string is well-formed
 */
export function isValidQuery(query: string): boolean {
  if (!query || query.trim().length === 0) {
    return false;
  }

  // Check for balanced parentheses
  let parenCount = 0;
  for (const char of query) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) return false;
  }
  
  return parenCount === 0;
}

/**
 * Validate that a query has balanced quotes
 */
export function hasBalancedQuotes(query: string): boolean {
  const quotes = query.match(/"/g);
  return !quotes || quotes.length % 2 === 0;
}

/**
 * Get query complexity score (approximate)
 */
export function getQueryComplexity(query: string): number {
  let complexity = 0;
  
  // Base complexity
  complexity += query.split(' ').length;
  
  // Operators add complexity
  complexity += (query.match(/\bOR\b/g) || []).length * 2;
  complexity += (query.match(/\bAND\b/g) || []).length * 1;
  complexity += (query.match(/\bNOT\b/g) || []).length * 1;
  
  // Special operators add complexity
  complexity += (query.match(/\w+:/g) || []).length * 3;
  complexity += (query.match(/near\d+:/g) || []).length * 4;
  complexity += (query.match(/repeat\d+:/g) || []).length * 2;
  
  return complexity;
}

// ===== EXPORT EVERYTHING =====

export const QueryHelpers = {
  createQuery,
  createArticleQuery,
  createImageQuery,
  phrase,
  anyOf,
  exclude,
  fromDomain,
  fromCountry,
  inLanguage,
  withTone,
  withTheme,
  isValidQuery,
  hasBalancedQuotes,
  getQueryComplexity
} as const;