/**
 * Enhanced query builder with TypeScript template literal types and IntelliSense support
 */

/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/naming-convention, @typescript-eslint/prefer-nullish-coalescing */

// Import lookup types for better type safety
import type { CountryCode, CountryName, LanguageCode, LanguageName, GKGTheme, ImageTag, ImageWebTag } from './lookups';

// ===== QUERY BUILDER CLASS =====

/**
 * Fluent query builder for constructing complex GDELT queries with type safety
 */
export class QueryBuilder {
  private components: string[] = [];
  
  // Track which filters have been applied to prevent conflicts
  private appliedFilters: {
    domain?: string;
    sourcecountry?: string;
    sourcelang?: string;
    tone?: boolean;
    toneabs?: boolean;
    imagefacetone?: boolean;
    imagenumfaces?: boolean;
    imagewebcount?: boolean;
  } = {};

  /**
   * Add a basic search term or phrase
   * 
   * This method can be chained multiple times to add different search terms.
   * Each term will be added as a separate component in the query.
   * 
   * @example
   * ```typescript
   * // Searches for articles containing both "climate" and "change"
   * createQuery().search("climate").search("change").build();
   * // Result: "climate change"
   * ```
   * 
   * @param term - The search term to add
   * @returns The query builder instance for chaining
   */
  public search(term: string): this {
    this.components.push(term);
    return this;
  }

  /**
   * Add a phrase search (exact match)
   * 
   * This method adds an exact phrase search to the query. The phrase will be enclosed
   * in quotes, requiring all words to appear together in the exact order specified.
   * 
   * This method can be chained multiple times to search for different phrases.
   * 
   * @example
   * ```typescript
   * // Search for the exact phrase "climate change"
   * createQuery().phrase("climate change").build();
   * // Result: '"climate change"'
   * 
   * // Search for multiple exact phrases
   * createQuery().phrase("climate change").phrase("global warming").build();
   * // Result: '"climate change" "global warming"'
   * ```
   * 
   * @param phrase - The exact phrase to search for
   * @returns The query builder instance for chaining
   */
  public phrase(phrase: string): this {
    this.components.push(`"${phrase}"`);
    return this;
  }

  /**
   * Add multiple terms with OR logic
   * 
   * This method adds multiple terms with OR logic, meaning articles matching
   * any of the terms will be included in the results.
   * 
   * This method can be chained multiple times to create complex OR conditions.
   * 
   * @example
   * ```typescript
   * // Search for articles mentioning either "climate" or "warming" or "environment"
   * createQuery().anyOf("climate", "warming", "environment").build();
   * // Result: '(climate OR warming OR environment)'
   * 
   * // Combine multiple OR conditions
   * createQuery()
   *   .anyOf("climate", "warming")
   *   .anyOf("protest", "activism")
   *   .build();
   * // Result: '(climate OR warming) (protest OR activism)'
   * ```
   * 
   * @param terms - The terms to combine with OR logic
   * @returns The query builder instance for chaining
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
   * 
   * This method adds multiple terms with AND logic, meaning articles must match
   * all of the terms to be included in the results.
   * 
   * This method can be chained multiple times to add more required terms.
   * Note that chaining this method is equivalent to calling search() multiple times.
   * 
   * @example
   * ```typescript
   * // Search for articles mentioning both "climate" and "policy"
   * createQuery().allOf("climate", "policy").build();
   * // Result: 'climate policy'
   * 
   * // Require multiple sets of terms
   * createQuery()
   *   .allOf("climate", "change")
   *   .allOf("policy", "action")
   *   .build();
   * // Result: 'climate change policy action'
   * ```
   * 
   * @param terms - The terms to combine with AND logic
   * @returns The query builder instance for chaining
   */
  public allOf(...terms: string[]): this {
    terms.forEach(term => this.components.push(term));
    return this;
  }

  /**
   * Exclude a term or phrase
   * 
   * This method excludes articles containing the specified term or phrase
   * from the search results.
   * 
   * This method can be chained multiple times to exclude multiple terms or phrases.
   * 
   * @example
   * ```typescript
   * // Search for "climate" but exclude "hoax"
   * createQuery().search("climate").not("hoax").build();
   * // Result: 'climate -hoax'
   * 
   * // Exclude multiple terms
   * createQuery()
   *   .search("climate")
   *   .not("hoax")
   *   .not("conspiracy")
   *   .build();
   * // Result: 'climate -hoax -conspiracy'
   * ```
   * 
   * @param term - The term or phrase to exclude
   * @returns The query builder instance for chaining
   */
  not(term: string): this {
    this.components.push(`-${term}`);
    return this;
  }

  /**
   * Filter by domain
   * 
   * This method filters articles to those from a specific domain.
   * By default, it will match subdomains (e.g., 'domain:cnn.com' matches 'edition.cnn.com').
   * Set exact=true to match only the exact domain.
   * 
   * Note: Calling this method multiple times will replace any previous domain filter.
   * The GDELT API does not support filtering by multiple domains in an AND relationship.
   * To filter by multiple domains with OR logic, use anyOf() with multiple domain filters.
   * 
   * @example
   * ```typescript
   * // Filter for CNN articles
   * createQuery().fromDomain("cnn.com").build();
   * // Result: "domain:cnn.com"
   * 
   * // Filter for exact domain match
   * createQuery().fromDomain("un.org", true).build();
   * // Result: "domainis:un.org"
   * 
   * // Filter for multiple domains (OR relationship)
   * createQuery().anyOf(
   *   fromDomain("cnn.com"),
   *   fromDomain("bbc.com")
   * ).build();
   * // Result: "(domain:cnn.com OR domain:bbc.com)"
   * ```
   * 
   * @param domain - The domain to filter by
   * @param exact - Whether to match the exact domain only (default: false)
   * @returns The query builder instance for chaining
   */
  fromDomain(domain: string, exact = false): this {
    const operator = exact ? 'domainis' : 'domain';
    const filterValue = `${operator}:${domain}`;
    
    // Find and replace the existing domain filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('domain:') || c.startsWith('domainis:'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.domain = domain;
    
    return this;
  }

  /**
   * Filter by source country (with IntelliSense support)
   * 
   * This method filters articles to those published in a specific country.
   * It supports both country codes and full country names with IntelliSense.
   * 
   * Note: Calling this method multiple times will replace any previous country filter.
   * The GDELT API does not support filtering by multiple countries in an AND relationship.
   * To filter by multiple countries with OR logic, use anyOf() with multiple country filters.
   * 
   * @example
   * ```typescript
   * // Filter for US articles
   * createQuery().fromCountry("US").build();
   * // Result: "sourcecountry:us"
   * 
   * // Filter for multiple countries (OR relationship)
   * createQuery().anyOf(
   *   fromCountry("US"),
   *   fromCountry("United Kingdom")
   * ).build();
   * // Result: "(sourcecountry:us OR sourcecountry:unitedkingdom)"
   * ```
   * 
   * @param country - The country code or name to filter by
   * @returns The query builder instance for chaining
   */
  fromCountry(country: CountryCode | CountryName | string): this {
    // Support both normalized country names and display names
    const normalizedCountry = typeof country === 'string' ? 
      country.toLowerCase().replace(/\s+/g, '') : country;
    const filterValue = `sourcecountry:${normalizedCountry}`;
    
    // Find and replace the existing country filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('sourcecountry:'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.sourcecountry = normalizedCountry;
    
    return this;
  }

  /**
   * Filter by source language (with IntelliSense support)
   * 
   * This method filters articles to those published in a specific language.
   * It supports both language codes and full language names with IntelliSense.
   * 
   * Note: Calling this method multiple times will replace any previous language filter.
   * The GDELT API does not support filtering by multiple languages in an AND relationship.
   * To filter by multiple languages with OR logic, use anyOf() with multiple language filters.
   * 
   * @example
   * ```typescript
   * // Filter for English articles
   * createQuery().inLanguage("english").build();
   * // Result: "sourcelang:english"
   * 
   * // Filter for multiple languages (OR relationship)
   * createQuery().anyOf(
   *   inLanguage("english"),
   *   inLanguage("spanish")
   * ).build();
   * // Result: "(sourcelang:english OR sourcelang:spanish)"
   * ```
   * 
   * @param language - The language code or name to filter by
   * @returns The query builder instance for chaining
   */
  inLanguage(language: LanguageCode | LanguageName | string): this {
    // Support both language codes and names
    const normalizedLanguage = typeof language === 'string' ? 
      language.toLowerCase().replace(/\s+/g, '') : language;
    const filterValue = `sourcelang:${normalizedLanguage}`;
    
    // Find and replace the existing language filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('sourcelang:'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.sourcelang = normalizedLanguage;
    
    return this;
  }

  /**
   * Filter by tone (emotional sentiment)
   * 
   * This method filters articles based on their emotional tone score.
   * The tone score typically ranges from -10 (very negative) to +10 (very positive).
   * 
   * Note: Calling this method multiple times will replace any previous tone filter.
   * Using multiple tone filters or mixing with other tone-related methods 
   * (withPositiveTone, withNegativeTone, etc.) may create conflicting constraints.
   * 
   * @example
   * ```typescript
   * // Filter for positive articles
   * createQuery().withTone('>', 2).build();
   * // Result: "tone>2"
   * 
   * // Filter for negative articles
   * createQuery().withTone('<', -2).build();
   * // Result: "tone<-2"
   * 
   * // Filter for articles with exact tone
   * createQuery().withTone('=', 0).build();
   * // Result: "tone=0"
   * ```
   * 
   * @param operator - The comparison operator ('>', '<', or '=')
   * @param value - The tone value to compare against
   * @returns The query builder instance for chaining
   */
  withTone(operator: '>' | '<' | '=', value: number): this {
    const filterValue = `tone${operator}${value}`;
    
    // Find and replace the existing tone filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('tone') && !c.startsWith('toneabs'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.tone = true;
    
    return this;
  }

  /**
   * Filter by absolute tone (emotional intensity)
   * 
   * This method filters articles based on the absolute value of their emotional tone,
   * which measures emotional intensity regardless of whether it's positive or negative.
   * 
   * Note: Calling this method multiple times will replace any previous absolute tone filter.
   * Using this with withNeutralTone or withHighEmotion may create conflicting constraints.
   * 
   * @example
   * ```typescript
   * // Filter for emotionally intense articles
   * createQuery().withAbsoluteTone('>', 5).build();
   * // Result: "toneabs>5"
   * 
   * // Filter for neutral articles
   * createQuery().withAbsoluteTone('<', 1).build();
   * // Result: "toneabs<1"
   * ```
   * 
   * @param operator - The comparison operator ('>', '<', or '=')
   * @param value - The absolute tone value to compare against
   * @returns The query builder instance for chaining
   */
  withAbsoluteTone(operator: '>' | '<' | '=', value: number): this {
    const filterValue = `toneabs${operator}${value}`;
    
    // Find and replace the existing absolute tone filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('toneabs'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.toneabs = true;
    
    return this;
  }

  /**
   * Filter for positive tone articles
   * 
   * This is a convenience method that filters for articles with a positive tone
   * above the specified threshold.
   * 
   * Note: This method uses withTone() internally and will replace any previous tone filter.
   * 
   * @example
   * ```typescript
   * // Filter for positive articles
   * createQuery().withPositiveTone().build();
   * // Result: "tone>2"
   * 
   * // Filter for very positive articles
   * createQuery().withPositiveTone(5).build();
   * // Result: "tone>5"
   * ```
   * 
   * @param threshold - The positive tone threshold (default: 2)
   * @returns The query builder instance for chaining
   */
  withPositiveTone(threshold = 2): this {
    return this.withTone('>', threshold);
  }

  /**
   * Filter for negative tone articles
   * 
   * This is a convenience method that filters for articles with a negative tone
   * below the specified threshold.
   * 
   * Note: This method uses withTone() internally and will replace any previous tone filter.
   * 
   * @example
   * ```typescript
   * // Filter for negative articles
   * createQuery().withNegativeTone().build();
   * // Result: "tone<-2"
   * 
   * // Filter for very negative articles
   * createQuery().withNegativeTone(-5).build();
   * // Result: "tone<-5"
   * ```
   * 
   * @param threshold - The negative tone threshold (default: -2)
   * @returns The query builder instance for chaining
   */
  withNegativeTone(threshold = -2): this {
    return this.withTone('<', threshold);
  }

  /**
   * Filter for neutral tone articles
   * 
   * This is a convenience method that filters for articles with a neutral tone,
   * meaning the absolute value of their tone is below the specified range.
   * 
   * Note: This method uses withAbsoluteTone() internally and will replace any previous
   * absolute tone filter.
   * 
   * @example
   * ```typescript
   * // Filter for neutral articles
   * createQuery().withNeutralTone().build();
   * // Result: "toneabs<1"
   * 
   * // Filter for slightly emotional articles
   * createQuery().withNeutralTone(2).build();
   * // Result: "toneabs<2"
   * ```
   * 
   * @param range - The maximum absolute tone value for neutral articles (default: 1)
   * @returns The query builder instance for chaining
   */
  withNeutralTone(range = 1): this {
    return this.withAbsoluteTone('<', range);
  }

  /**
   * Filter for highly emotional articles (regardless of positive/negative)
   * 
   * This is a convenience method that filters for articles with high emotional intensity,
   * regardless of whether the emotion is positive or negative.
   * 
   * Note: This method uses withAbsoluteTone() internally and will replace any previous
   * absolute tone filter.
   * 
   * @example
   * ```typescript
   * // Filter for emotional articles
   * createQuery().withHighEmotion().build();
   * // Result: "toneabs>5"
   * 
   * // Filter for extremely emotional articles
   * createQuery().withHighEmotion(8).build();
   * // Result: "toneabs>8"
   * ```
   * 
   * @param threshold - The minimum absolute tone value for emotional articles (default: 5)
   * @returns The query builder instance for chaining
   */
  withHighEmotion(threshold = 5): this {
    return this.withAbsoluteTone('>', threshold);
  }

  /**
   * Filter by GDELT theme (with IntelliSense support)
   * 
   * This method filters articles by GDELT Global Knowledge Graph (GKG) themes.
   * GKG themes offer a powerful way to search for complex topics, as they can include
   * hundreds or thousands of different phrases under a single heading.
   * 
   * This method can be chained multiple times to filter for articles matching multiple themes.
   * 
   * @example
   * ```typescript
   * // Filter for articles about terrorism
   * createQuery().withTheme("TERROR").build();
   * // Result: "theme:TERROR"
   * 
   * // Filter for articles about both terrorism and protests
   * createQuery().withTheme("TERROR").withTheme("PROTEST").build();
   * // Result: "theme:TERROR theme:PROTEST"
   * ```
   * 
   * @param theme - The GKG theme to filter by (with IntelliSense support)
   * @returns The query builder instance for chaining
   */
  withTheme(theme: GKGTheme | string): this {
    // Ensure theme is uppercase as required by the API
    const themeValue = typeof theme === 'string' ? 
      theme.toUpperCase() : theme;
    this.components.push(`theme:${themeValue}`);
    return this;
  }

  /**
   * Filter for images with specific tags (with IntelliSense support)
   * 
   * This method filters for images that have been tagged with specific objects or activities
   * by Google's deep learning algorithms. These tags represent what is actually visible
   * in the image itself.
   * 
   * This method can be chained multiple times to filter for images matching multiple tags.
   * 
   * @example
   * ```typescript
   * // Filter for images of floods
   * createImageQuery().withImageTag("flood").build();
   * // Result: 'imagetag:"flood"'
   * 
   * // Filter for images containing both fire and smoke
   * createImageQuery().withImageTag("fire").withImageTag("smoke").build();
   * // Result: 'imagetag:"fire" imagetag:"smoke"'
   * ```
   * 
   * @param tag - The image tag to filter by (with IntelliSense support)
   * @returns The query builder instance for chaining
   */
  withImageTag(tag: ImageTag | string): this {
    this.components.push(`imagetag:"${tag}"`);
    return this;
  }

  /**
   * Filter for images with web tags (with IntelliSense support)
   * 
   * This method filters for images based on how they've been described across the web.
   * Web tags are derived from captions and context where the image has appeared online.
   * 
   * This method can be chained multiple times to filter for images matching multiple web tags.
   * 
   * @example
   * ```typescript
   * // Filter for images described as "drone" across the web
   * createImageQuery().withImageWebTag("drone").build();
   * // Result: 'imagewebtag:"drone"'
   * 
   * // Filter for images described as both "protest" and "violence"
   * createImageQuery().withImageWebTag("protest").withImageWebTag("violence").build();
   * // Result: 'imagewebtag:"protest" imagewebtag:"violence"'
   * ```
   * 
   * @param tag - The image web tag to filter by (with IntelliSense support)
   * @returns The query builder instance for chaining
   */
  withImageWebTag(tag: ImageWebTag | string): this {
    this.components.push(`imagewebtag:"${tag}"`);
    return this;
  }

  /**
   * Filter for images with OCR/metadata content
   * 
   * This method filters for images based on text found in the image itself (via OCR),
   * metadata embedded in the image file (EXIF, etc.), or the textual caption provided
   * for the image.
   * 
   * This method can be chained multiple times to filter for images matching multiple
   * OCR/metadata content strings.
   * 
   * @example
   * ```typescript
   * // Filter for images containing "climate change" in OCR text, metadata, or caption
   * createImageQuery().withImageOCR("climate change").build();
   * // Result: 'imageocrmeta:"climate change"'
   * 
   * // Filter for images containing both "election" and "ballot" in OCR/metadata/caption
   * createImageQuery().withImageOCR("election").withImageOCR("ballot").build();
   * // Result: 'imageocrmeta:"election" imageocrmeta:"ballot"'
   * ```
   * 
   * @param content - The text content to search for in image OCR, metadata, or caption
   * @returns The query builder instance for chaining
   */
  withImageOCR(content: string): this {
    this.components.push(`imageocrmeta:"${content}"`);
    return this;
  }

  /**
   * Filter by image face count
   * 
   * This method filters for images containing a specific number of human faces.
   * Only unobstructed human faces facing toward the camera in the foreground are counted.
   * Large crowd scenes may not be counted accurately.
   * 
   * Note: Calling this method multiple times will replace any previous image face count filter.
   * 
   * @example
   * ```typescript
   * // Filter for images with exactly 2 faces
   * createImageQuery().withImageFaceCount('=', 2).build();
   * // Result: "imagenumfaces=2"
   * 
   * // Filter for images with more than 3 faces
   * createImageQuery().withImageFaceCount('>', 3).build();
   * // Result: "imagenumfaces>3"
   * 
   * // Filter for images with fewer than 5 faces
   * createImageQuery().withImageFaceCount('<', 5).build();
   * // Result: "imagenumfaces<5"
   * ```
   * 
   * @param operator - The comparison operator ('>', '<', or '=')
   * @param count - The number of faces to compare against
   * @returns The query builder instance for chaining
   */
  withImageFaceCount(operator: '>' | '<' | '=', count: number): this {
    const filterValue = `imagenumfaces${operator}${count}`;
    
    // Find and replace the existing image face count filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('imagenumfaces'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.imagenumfaces = true;
    
    return this;
  }

  /**
   * Filter by image face tone
   * 
   * This method filters for images based on the average emotional tone of human faces.
   * Only human faces that appear large enough to accurately gauge facial emotion are considered.
   * The tone score typically ranges from +2 (very happy) to -2 (very sad).
   * 
   * Note: Calling this method multiple times will replace any previous image face tone filter.
   * 
   * @example
   * ```typescript
   * // Filter for images with happy faces
   * createImageQuery().withImageFaceTone('>', 1).build();
   * // Result: "imagefacetone>1"
   * 
   * // Filter for images with sad faces
   * createImageQuery().withImageFaceTone('<', -1).build();
   * // Result: "imagefacetone<-1"
   * ```
   * 
   * @param operator - The comparison operator ('>', '<', or '=')
   * @param tone - The face tone value to compare against
   * @returns The query builder instance for chaining
   */
  withImageFaceTone(operator: '>' | '<' | '=', tone: number): this {
    const filterValue = `imagefacetone${operator}${tone}`;
    
    // Find and replace the existing image face tone filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('imagefacetone'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.imagefacetone = true;
    
    return this;
  }

  /**
   * Filter by how often image appears on web
   * 
   * This method filters images based on how many times they've been seen on the web.
   * It can be used to find novel (rarely seen) or popular (frequently seen) images.
   * 
   * Note: Calling this method multiple times will replace any previous image web count filter.
   * Using this with withNovelImages or withPopularImages may create conflicting constraints.
   * 
   * @example
   * ```typescript
   * // Filter for novel images (seen on fewer than 10 web pages)
   * createImageQuery().withImageWebCount('<', 10).build();
   * // Result: "imagewebcount<10"
   * 
   * // Filter for popular images (seen on more than 100 web pages)
   * createImageQuery().withImageWebCount('>', 100).build();
   * // Result: "imagewebcount>100"
   * ```
   * 
   * @param operator - The comparison operator ('>', '<', or '=')
   * @param count - The web appearance count to compare against
   * @returns The query builder instance for chaining
   */
  withImageWebCount(operator: '>' | '<' | '=', count: number): this {
    const filterValue = `imagewebcount${operator}${count}`;
    
    // Find and replace the existing image web count filter if it exists
    const existingIndex = this.components.findIndex(c => 
      c.startsWith('imagewebcount'));
    
    if (existingIndex >= 0) {
      // Replace the existing filter
      this.components[existingIndex] = filterValue;
    } else {
      // Add a new filter
      this.components.push(filterValue);
    }
    
    // Update the applied filters tracking
    this.appliedFilters.imagewebcount = true;
    
    return this;
  }

  /**
   * Filter for novel images (rarely seen on web)
   * 
   * This is a convenience method that filters for images that have appeared
   * on fewer than the specified number of web pages.
   * 
   * Note: This method uses withImageWebCount() internally and will replace
   * any previous image web count filter.
   * 
   * @example
   * ```typescript
   * // Filter for novel images (default threshold)
   * createImageQuery().withNovelImages().build();
   * // Result: "imagewebcount<10"
   * 
   * // Filter for very novel images
   * createImageQuery().withNovelImages(5).build();
   * // Result: "imagewebcount<5"
   * ```
   * 
   * @param threshold - The maximum number of web appearances (default: 10)
   * @returns The query builder instance for chaining
   */
  withNovelImages(threshold = 10): this {
    return this.withImageWebCount('<', threshold);
  }

  /**
   * Filter for popular images (frequently seen on web)
   * 
   * This is a convenience method that filters for images that have appeared
   * on more than the specified number of web pages.
   * 
   * Note: This method uses withImageWebCount() internally and will replace
   * any previous image web count filter.
   * 
   * @example
   * ```typescript
   * // Filter for popular images (default threshold)
   * createImageQuery().withPopularImages().build();
   * // Result: "imagewebcount>100"
   * 
   * // Filter for very popular images
   * createImageQuery().withPopularImages(500).build();
   * // Result: "imagewebcount>500"
   * ```
   * 
   * @param threshold - The minimum number of web appearances (default: 100)
   * @returns The query builder instance for chaining
   */
  withPopularImages(threshold = 100): this {
    return this.withImageWebCount('>', threshold);
  }

  /**
   * Add proximity constraint (words must appear within distance)
   * 
   * This method filters for articles where all the specified words appear within
   * a certain distance of each other. The distance is measured in words.
   * 
   * Note: The order of words matters. If the words appear in a different order
   * than specified, each ordering difference increments the word distance.
   * 
   * This method can be chained multiple times to add different proximity constraints.
   * 
   * @example
   * ```typescript
   * // Find articles where "trump" and "putin" appear within 20 words of each other
   * createQuery().withProximity(20, "trump", "putin").build();
   * // Result: 'near20:"trump putin"'
   * 
   * // Find articles where "climate" and "change" and "action" appear close together
   * createQuery().withProximity(10, "climate", "change", "action").build();
   * // Result: 'near10:"climate change action"'
   * ```
   * 
   * @param distance - The maximum distance (in words) between the specified words
   * @param words - The words that must appear within the specified distance
   * @returns The query builder instance for chaining
   */
  withProximity(distance: number, ...words: string[]): this {
    if (words.length >= 2) {
      this.components.push(`near${distance}:"${words.join(' ')}"`);
    }
    return this;
  }

  /**
   * Require word to appear minimum number of times
   * 
   * This method filters for articles where a specific word appears at least
   * a certain number of times. This helps find articles that focus on a topic
   * rather than just mentioning it in passing.
   * 
   * This method can be chained multiple times to add requirements for different words.
   * 
   * @example
   * ```typescript
   * // Find articles that mention "climate" at least 3 times
   * createQuery().withRepeat(3, "climate").build();
   * // Result: 'repeat3:"climate"'
   * 
   * // Find articles that mention both "climate" and "crisis" multiple times
   * createQuery().withRepeat(3, "climate").withRepeat(2, "crisis").build();
   * // Result: 'repeat3:"climate" repeat2:"crisis"'
   * ```
   * 
   * @param count - The minimum number of times the word must appear
   * @param word - The word that must be repeated
   * @returns The query builder instance for chaining
   */
  withRepeat(count: number, word: string): this {
    this.components.push(`repeat${count}:"${word}"`);
    return this;
  }

  /**
   * Add custom query component
   * 
   * This method allows you to add any custom query component directly.
   * Use this for advanced query features not covered by other methods.
   * 
   * This method can be chained multiple times to add different custom components.
   * 
   * @example
   * ```typescript
   * // Add a custom query component
   * createQuery().custom("somespecialoperator:value").build();
   * // Result: "somespecialoperator:value"
   * 
   * // Combine custom components with standard methods
   * createQuery()
   *   .search("climate")
   *   .custom("specialfilter:xyz")
   *   .fromCountry("US")
   *   .build();
   * // Result: "climate specialfilter:xyz sourcecountry:us"
   * ```
   * 
   * @param query - The custom query component to add
   * @returns The query builder instance for chaining
   */
  custom(query: string): this {
    this.components.push(query);
    return this;
  }

  /**
   * Group current components with parentheses
   * 
   * This method groups all current query components together with parentheses,
   * creating a single logical unit. This is useful when you want to apply
   * additional filters to a complex query.
   * 
   * IMPORTANT: The GDELT API only allows parentheses around OR'd statements.
   * Using this method with non-OR statements may result in queries that are
   * rejected by the API with the error "Parentheses may only be used around OR'd statements."
   * 
   * This method checks if the components contain OR statements and only groups them
   * if they do. If not, it logs a warning and does not apply grouping.
   * 
   * Note: This method modifies the internal state of the query builder by
   * replacing all current components with a single grouped component.
   * 
   * @example
   * ```typescript
   * // Correct usage with OR statements
   * createQuery()
   *   .anyOf("climate", "environment", "warming")
   *   .group()
   *   .fromCountry("US")
   *   .build();
   * // Result: '(climate OR environment OR warming) sourcecountry:us'
   * 
   * // Incorrect usage with non-OR statements (will log warning and not group)
   * createQuery()
   *   .search("climate")
   *   .phrase("global warming")
   *   .group() // Warning: No OR statements found, grouping not applied
   *   .fromCountry("US")
   *   .build();
   * // Result: 'climate "global warming" sourcecountry:us'
   * ```
   * 
   * @returns The query builder instance for chaining
   */
  group(): this {
    if (this.components.length > 1) {
      // Check if any component contains " OR " (indicating an OR statement)
      const hasOrStatements = this.components.some(component => 
        component.includes(' OR ') || 
        (component.startsWith('(') && component.includes(' OR '))
      );
      
      if (hasOrStatements) {
        const grouped = `(${this.components.join(' ')})`;
        this.components = [grouped];
      } else {
        // Log a warning but don't apply grouping to avoid API rejection
        console.warn('Warning: The GDELT API only allows parentheses around OR\'d statements. ' +
          'Grouping not applied to avoid API rejection. Use anyOf() to create OR statements.');
      }
    }
    return this;
  }

  /**
   * Clear all components and start fresh
   * 
   * This method removes all query components and resets the query builder
   * to its initial state. This includes clearing all applied filters.
   * 
   * @example
   * ```typescript
   * // Build a query, then clear and start over
   * const builder = createQuery().search("climate").fromCountry("US");
   * console.log(builder.build()); // "climate sourcecountry:us"
   * 
   * builder.clear().search("politics");
   * console.log(builder.build()); // "politics"
   * ```
   * 
   * @returns The query builder instance for chaining
   */
  clear(): this {
    this.components = [];
    // Reset all applied filters
    this.appliedFilters = {};
    return this;
  }

  /**
   * Build the final query string
   * 
   * This method combines all query components into a single string
   * that can be used with the GDELT API.
   * 
   * @example
   * ```typescript
   * // Build a query string
   * const query = createQuery()
   *   .search("climate")
   *   .phrase("global warming")
   *   .fromCountry("US")
   *   .build();
   * console.log(query); // "climate "global warming" sourcecountry:us"
   * ```
   * 
   * @returns The final query string
   */
  build(): string {
    return this.components.join(' ');
  }

  /**
   * Get a copy of the current components
   * 
   * This method returns a copy of the internal components array,
   * which can be useful for debugging or advanced query manipulation.
   * 
   * @example
   * ```typescript
   * // Get the current components
   * const builder = createQuery().search("climate").fromCountry("US");
   * const components = builder.getComponents();
   * console.log(components); // ["climate", "sourcecountry:us"]
   * ```
   * 
   * @returns A copy of the current query components
   */
  getComponents(): string[] {
    return [...this.components];
  }

  /**
   * Check if the builder has any components
   * 
   * This method checks if the query builder has any components.
   * It returns true if the builder is empty, false otherwise.
   * 
   * @example
   * ```typescript
   * // Check if the builder is empty
   * const builder = createQuery();
   * console.log(builder.isEmpty()); // true
   * 
   * builder.search("climate");
   * console.log(builder.isEmpty()); // false
   * ```
   * 
   * @returns True if the builder has no components, false otherwise
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
 * 
 * This function creates a new instance of the QueryBuilder class,
 * which provides a fluent interface for building GDELT queries.
 * 
 * @example
 * ```typescript
 * // Create a new query builder and build a query
 * const query = createQuery()
 *   .search("climate")
 *   .fromCountry("US")
 *   .build();
 * ```
 * 
 * @returns A new QueryBuilder instance
 */
export function createQuery(): QueryBuilder {
  return new QueryBuilder();
}

/**
 * Create a new article-specialized query builder
 * 
 * This function creates a new instance of the ArticleQueryBuilder class,
 * which extends the base QueryBuilder with article-specific methods.
 * 
 * @example
 * ```typescript
 * // Create an article query for breaking news
 * const query = createArticleQuery()
 *   .breakingNews()
 *   .fromCountry("US")
 *   .build();
 * ```
 * 
 * @returns A new ArticleQueryBuilder instance
 */
export function createArticleQuery(): ArticleQueryBuilder {
  return new ArticleQueryBuilder();
}

/**
 * Create a new image-specialized query builder
 * 
 * This function creates a new instance of the ImageQueryBuilder class,
 * which extends the base QueryBuilder with image-specific methods.
 * 
 * @example
 * ```typescript
 * // Create an image query for disaster images
 * const query = createImageQuery()
 *   .disasters()
 *   .withNovelImages()
 *   .build();
 * ```
 * 
 * @returns A new ImageQueryBuilder instance
 */
export function createImageQuery(): ImageQueryBuilder {
  return new ImageQueryBuilder();
}

/**
 * Create a quick phrase query
 * 
 * This helper function creates an exact phrase search string without
 * using the query builder. It's useful for creating simple phrase queries
 * or for use with the anyOf() helper.
 * 
 * @example
 * ```typescript
 * // Create a phrase query
 * const query = phrase("climate change");
 * // Result: '"climate change"'
 * 
 * // Use with anyOf
 * const orQuery = anyOf(
 *   phrase("climate change"),
 *   phrase("global warming")
 * );
 * // Result: '("climate change" OR "global warming")'
 * ```
 * 
 * @param text - The exact phrase to search for
 * @returns A phrase query string
 */
export function phrase(text: string): string {
  return `"${text}"`;
}

/**
 * Create a quick OR query
 * 
 * This helper function creates an OR query string without using the query builder.
 * It combines multiple terms with OR logic, meaning results matching any of the
 * terms will be included.
 * 
 * @example
 * ```typescript
 * // Create an OR query
 * const query = anyOf("climate", "warming", "environment");
 * // Result: '(climate OR warming OR environment)'
 * 
 * // Use with other helpers
 * const complexQuery = anyOf(
 *   phrase("climate change"),
 *   fromCountry("US"),
 *   fromCountry("UK")
 * );
 * // Result: '("climate change" OR sourcecountry:us OR sourcecountry:uk)'
 * ```
 * 
 * @param terms - The terms to combine with OR logic
 * @returns An OR query string
 */
export function anyOf(...terms: string[]): string {
  if (terms.length === 0) return '';
  if (terms.length === 1) return terms[0] || '';
  return `(${terms.join(' OR ')})`;
}

/**
 * Create a quick exclusion query
 * 
 * This helper function creates an exclusion query string without using the query builder.
 * It excludes results containing the specified term.
 * 
 * @example
 * ```typescript
 * // Create an exclusion query
 * const query = exclude("hoax");
 * // Result: '-hoax'
 * 
 * // Use with other terms
 * const fullQuery = `climate ${exclude("hoax")}`;
 * // Result: 'climate -hoax'
 * ```
 * 
 * @param term - The term to exclude
 * @returns An exclusion query string
 */
export function exclude(term: string): string {
  return `-${term}`;
}

/**
 * Create a domain filter
 * 
 * This helper function creates a domain filter string without using the query builder.
 * It filters results to those from a specific domain.
 * 
 * @example
 * ```typescript
 * // Create a domain filter
 * const query = fromDomain("cnn.com");
 * // Result: 'domain:cnn.com'
 * 
 * // Create an exact domain filter
 * const exactQuery = fromDomain("un.org", true);
 * // Result: 'domainis:un.org'
 * ```
 * 
 * @param domain - The domain to filter by
 * @param exact - Whether to match the exact domain only (default: false)
 * @returns A domain filter string
 */
export function fromDomain(domain: string, exact = false): string {
  const operator = exact ? 'domainis' : 'domain';
  return `${operator}:${domain}`;
}

/**
 * Create a country filter (with IntelliSense support)
 * 
 * This helper function creates a country filter string without using the query builder.
 * It filters results to those from a specific country.
 * 
 * @example
 * ```typescript
 * // Create a country filter
 * const query = fromCountry("US");
 * // Result: 'sourcecountry:us'
 * 
 * // Create a country filter with full name
 * const ukQuery = fromCountry("United Kingdom");
 * // Result: 'sourcecountry:unitedkingdom'
 * ```
 * 
 * @param country - The country code or name to filter by (with IntelliSense support)
 * @returns A country filter string
 */
export function fromCountry(country: CountryCode | CountryName | string): string {
  const normalizedCountry = typeof country === 'string' ? 
    country.toLowerCase().replace(/\s+/g, '') : country;
  return `sourcecountry:${normalizedCountry}`;
}

/**
 * Create a language filter (with IntelliSense support)
 * 
 * This helper function creates a language filter string without using the query builder.
 * It filters results to those in a specific language.
 * 
 * @example
 * ```typescript
 * // Create a language filter
 * const query = inLanguage("english");
 * // Result: 'sourcelang:english'
 * 
 * // Create a language filter with code
 * const spanishQuery = inLanguage("spa");
 * // Result: 'sourcelang:spa'
 * ```
 * 
 * @param language - The language code or name to filter by (with IntelliSense support)
 * @returns A language filter string
 */
export function inLanguage(language: LanguageCode | LanguageName | string): string {
  const normalizedLanguage = typeof language === 'string' ? 
    language.toLowerCase().replace(/\s+/g, '') : language;
  return `sourcelang:${normalizedLanguage}`;
}

/**
 * Create a tone filter
 * 
 * This helper function creates a tone filter string without using the query builder.
 * It filters results based on their emotional tone score.
 * 
 * @example
 * ```typescript
 * // Create a positive tone filter
 * const positiveQuery = withTone('>', 2);
 * // Result: 'tone>2'
 * 
 * // Create a negative tone filter
 * const negativeQuery = withTone('<', -2);
 * // Result: 'tone<-2'
 * ```
 * 
 * @param operator - The comparison operator ('>', '<', or '=')
 * @param value - The tone value to compare against
 * @returns A tone filter string
 */
export function withTone(operator: '>' | '<' | '=', value: number): string {
  return `tone${operator}${value}`;
}

/**
 * Create a theme filter (with IntelliSense support)
 * 
 * This helper function creates a theme filter string without using the query builder.
 * It filters results to those matching a specific GDELT theme.
 * 
 * @example
 * ```typescript
 * // Create a theme filter
 * const query = withTheme("TERROR");
 * // Result: 'theme:TERROR'
 * ```
 * 
 * @param theme - The GKG theme to filter by (with IntelliSense support)
 * @returns A theme filter string
 */
export function withTheme(theme: GKGTheme | string): string {
  return `theme:${theme.toUpperCase()}`;
}

/**
 * Create an image tag filter (with IntelliSense support)
 * 
 * This helper function creates an image tag filter string without using the query builder.
 * It filters results to images tagged with a specific object or activity.
 * 
 * @example
 * ```typescript
 * // Create an image tag filter
 * const query = withImageTag("flood");
 * // Result: 'imagetag:"flood"'
 * ```
 * 
 * @param tag - The image tag to filter by (with IntelliSense support)
 * @returns An image tag filter string
 */
export function withImageTag(tag: ImageTag | string): string {
  return `imagetag:"${tag}"`;
}

/**
 * Create an image web tag filter (with IntelliSense support)
 * 
 * This helper function creates an image web tag filter string without using the query builder.
 * It filters results to images described with a specific tag across the web.
 * 
 * @example
 * ```typescript
 * // Create an image web tag filter
 * const query = withImageWebTag("drone");
 * // Result: 'imagewebtag:"drone"'
 * ```
 * 
 * @param tag - The image web tag to filter by (with IntelliSense support)
 * @returns An image web tag filter string
 */
export function withImageWebTag(tag: ImageWebTag | string): string {
  return `imagewebtag:"${tag}"`;
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
  const operatorPattern = /\b(?:domain|domainis|sourcecountry|sourcelang|theme|tone|toneabs|imagetag|imagewebtag|imageocrmeta|imagenumfaces|imagefacetone|imagewebcount):/g;
  complexity += (query.match(operatorPattern) || []).length * 3;
  
  // Proximity and repeat operators
  complexity += (query.match(/\bnear\d+:/g) || []).length * 4;
  complexity += (query.match(/\brepeat\d+:/g) || []).length * 2;
  
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
  withImageTag,
  withImageWebTag,
  isValidQuery,
  hasBalancedQuotes,
  getQueryComplexity
} as const;