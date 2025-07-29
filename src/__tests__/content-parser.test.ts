/**
 * Tests for ContentParserService
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContentParserService } from '../services/content-parser';

// HTML test fixtures
const HTML_WITH_ARTICLE = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Article</title>
  <meta property="og:title" content="OG Test Title">
  <meta property="og:description" content="OG Test Description">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Twitter Test Title">
  <meta property="article:author" content="Test Author">
  <meta property="article:published_time" content="2023-01-01">
  <link rel="canonical" href="https://example.com/canonical">
</head>
<body>
  <article>
    <h1>Test Article Heading</h1>
    <div class="byline">By John Doe</div>
    <p>This is a test paragraph with some content. It contains enough words to be considered valid content.</p>
    <p>This is another paragraph with more content. The quick brown fox jumps over the lazy dog.</p>
    <p>This is a third paragraph with even more content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  </article>
</body>
</html>
`;

const HTML_WITH_PAYWALL = `
<!DOCTYPE html>
<html>
<head>
  <title>Paywall Article</title>
</head>
<body>
  <article>
    <h1>Premium Content</h1>
    <div class="paywall-message">
      This content is behind a paywall. Subscription required to read this article.
    </div>
    <p>First paragraph preview...</p>
  </article>
</body>
</html>
`;

const HTML_WITHOUT_ARTICLE = `
<!DOCTYPE html>
<html>
<head>
  <title>No Article</title>
</head>
<body>
  <div class="content">
    <h1 class="title">Test Title</h1>
    <div class="author">By Jane Smith</div>
    <p>This is a test paragraph in a div instead of an article.</p>
    <p>This is another paragraph with more content.</p>
  </div>
</body>
</html>
`;

const HTML_WITH_MINIMAL_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <title>Minimal Content</title>
</head>
<body>
  <p>Just a single short paragraph.</p>
</body>
</html>
`;

const HTML_WITH_DIFFERENT_LANGUAGE = `
<!DOCTYPE html>
<html>
<head>
  <title>Spanish Article</title>
</head>
<body>
  <article>
    <h1>El Título del Artículo</h1>
    <div class="autor">Por Juan Pérez</div>
    <p>Este es un párrafo de prueba en español. El artículo contiene suficientes palabras para ser considerado válido.</p>
    <p>Este es otro párrafo con más contenido en español. La rápida zorra marrón salta sobre el perro perezoso.</p>
  </article>
</body>
</html>
`;

describe('ContentParserService', () => {
  let service: ContentParserService;

  beforeEach(() => {
    // Create a fresh instance for each test
    service = new ContentParserService();
  });

  describe('parseHTML', () => {
    it('should parse HTML and extract content successfully', () => {
      const url = 'https://example.com/article';
      const result = service.parseHTML(HTML_WITH_ARTICLE, url);

      expect(result).toBeDefined();
      expect(result.text).toContain('This is a test paragraph');
      // The title might come from Open Graph metadata or the document title
      expect(result.title).toBeDefined();
      expect(result.author).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(20);
      expect(result.metadata).toBeDefined();
      expect(result.paywallDetected).toBe(false);
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should detect paywall content', () => {
      const url = 'https://example.com/paywall-article';
      const result = service.parseHTML(HTML_WITH_PAYWALL, url);

      expect(result).toBeDefined();
      expect(result.paywallDetected).toBe(true);
    });

    it('should extract content from non-article HTML', () => {
      const url = 'https://example.com/no-article';
      const result = service.parseHTML(HTML_WITHOUT_ARTICLE, url);

      expect(result).toBeDefined();
      expect(result.text).toContain('This is a test paragraph');
      // The title might come from the document title or other sources
      expect(result.title).toBeDefined();
      // The extraction method could be either readability or fallback depending on the HTML structure
      expect(['readability', 'fallback']).toContain(result.metadata.extractionMethod);
    });

    it('should handle minimal content', () => {
      const url = 'https://example.com/minimal';
      const result = service.parseHTML(HTML_WITH_MINIMAL_CONTENT, url);

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.wordCount).toBeLessThan(10);
      expect(result.qualityScore).toBeLessThan(0.5);
    });

    it('should handle non-English content', () => {
      const url = 'https://example.com/spanish';
      const result = service.parseHTML(HTML_WITH_DIFFERENT_LANGUAGE, url);

      expect(result).toBeDefined();
      expect(result.language).toBe('es');
    });
  });

  describe('detectPaywall', () => {
    it('should detect paywall indicators', () => {
      const result = service.detectPaywall(HTML_WITH_PAYWALL);
      expect(result).toBe(true);
    });

    it('should not detect paywall in normal content', () => {
      const result = service.detectPaywall(HTML_WITH_ARTICLE);
      expect(result).toBe(false);
    });

    it('should detect various paywall phrases', () => {
      const paywallPhrases = [
        '<p>This content is behind a paywall</p>',
        '<div>Subscription required to continue reading</div>',
        '<p>Subscribe to read the full article</p>',
        '<div>This premium content requires a subscription</div>',
        '<p>This is members only content</p>',
        '<div>Please sign up to continue reading</div>',
        '<p>Register to read more</p>',
        '<div>Unlock this article by subscribing</div>',
        '<p>This is a subscriber exclusive article</p>',
        '<div>This is subscription-only content</div>'
      ];

      paywallPhrases.forEach(phrase => {
        const html = `<html><body>${phrase}</body></html>`;
        expect(service.detectPaywall(html)).toBe(true);
      });
    });
  });

  describe('extractMetadata', () => {
    it('should extract Open Graph metadata', () => {
      const metadata = service.extractMetadata(HTML_WITH_ARTICLE);

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.['title']).toBe('OG Test Title');
      expect(metadata.openGraph?.['description']).toBe('OG Test Description');
    });

    it('should extract Twitter Card metadata', () => {
      const metadata = service.extractMetadata(HTML_WITH_ARTICLE);

      expect(metadata.twitterCard).toBeDefined();
      expect(metadata.twitterCard?.['card']).toBe('summary');
      expect(metadata.twitterCard?.['title']).toBe('Twitter Test Title');
    });

    it('should extract article metadata', () => {
      const metadata = service.extractMetadata(HTML_WITH_ARTICLE);

      expect(metadata.article).toBeDefined();
      expect(metadata.article?.['author']).toBe('Test Author');
      expect(metadata.article?.['published_time']).toBe('2023-01-01');
    });

    it('should extract canonical URL', () => {
      const metadata = service.extractMetadata(HTML_WITH_ARTICLE);

      expect(metadata.canonicalUrl).toBe('https://example.com/canonical');
    });

    it('should handle HTML without metadata', () => {
      const html = '<html><head></head><body><p>No metadata here</p></body></html>';
      const metadata = service.extractMetadata(html);

      expect(metadata).toBeDefined();
      expect(Object.keys(metadata.openGraph ?? {})).toHaveLength(0);
      expect(Object.keys(metadata.twitterCard ?? {})).toHaveLength(0);
      expect(Object.keys(metadata.article ?? {})).toHaveLength(0);
      expect(metadata.canonicalUrl).toBe('');
    });
  });

  describe('_stripHtml', () => {
    it('should strip HTML tags from content', () => {
      const html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
      const result = (service as any)._stripHtml(html);

      expect(result).toBe('This is bold and italic text.');
    });

    it('should handle empty HTML', () => {
      const result = (service as any)._stripHtml('');
      expect(result).toBe('');
    });

    it('should handle HTML with only tags', () => {
      const result = (service as any)._stripHtml('<div><span></span></div>');
      expect(result).toBe('');
    });
  });

  describe('_countWords', () => {
    it('should count words in text', () => {
      const text = 'This is a sample text with ten words in it.';
      const result = (service as any)._countWords(text);

      expect(result).toBe(10);
    });

    it('should handle empty text', () => {
      const result = (service as any)._countWords('');
      expect(result).toBe(0);
    });

    it('should handle text with extra whitespace', () => {
      const text = '  This   has  weird   spacing  ';
      const result = (service as any)._countWords(text);

      expect(result).toBe(4);
    });
  });

  describe('_detectLanguage', () => {
    it('should detect English text', () => {
      const text = 'This is a sample text in English with enough words to detect the language properly. The quick brown fox jumps over the lazy dog.';
      const result = (service as any)._detectLanguage(text);

      expect(result).toBe('en');
    });

    it('should detect Spanish text', () => {
      const text = 'Este es un texto de ejemplo en español con suficientes palabras para detectar el idioma correctamente. El zorro marrón rápido salta sobre el perro perezoso.';
      const result = (service as any)._detectLanguage(text);

      expect(result).toBe('es');
    });

    it('should return undefined for short text', () => {
      const text = 'Short text';
      const result = (service as any)._detectLanguage(text);

      expect(result).toBeUndefined();
    });

    it('should return undefined for text without language indicators', () => {
      const text = '12345 67890 !@#$% ^&*()';
      const result = (service as any)._detectLanguage(text);

      expect(result).toBeUndefined();
    });

    it('should return first matching language when multiple languages have same match count', () => {
      // This tests lines 286-289 where multiple languages have equal matches
      // The implementation returns first match: 'en', then 'es', then 'fr', then 'de'
      const text = 'le la les et pour dans avec';  // French words
      const result = (service as any)._detectLanguage(text);

      expect(result).toBe('fr');
    });

    it('should detect German text when it has most matches', () => {
      // This tests line 287 where German has the most matches
      const text = 'der die das und ist mit zu haben werden nicht';  // German words
      const result = (service as any)._detectLanguage(text);

      expect(result).toBe('de');
    });
  });

  describe('_extractDateFromMetadata', () => {
    it('should extract published_time from article metadata', () => {
      const metadata = {
        article: {} as Record<string, string>,
        openGraph: {} as Record<string, string>,
        twitterCard: {} as Record<string, string>,
        canonicalUrl: '',
        extractionMethod: 'fallback' as 'fallback' | 'readability',
        extractionConfidence: 0.5
      };
      
      // Using Record<string, string> type to avoid ESLint naming convention issues
      metadata.article['published_time'] = '2023-01-01';

      const result = (service as any)._extractDateFromMetadata(metadata);
      expect(result).toBe('2023-01-01');
    });

    it('should extract published_time from Open Graph metadata if not in article', () => {
      const metadata = {
        article: {} as Record<string, string>,
        openGraph: {} as Record<string, string>,
        twitterCard: {} as Record<string, string>,
        canonicalUrl: '',
        extractionMethod: 'fallback' as 'fallback' | 'readability',
        extractionConfidence: 0.5
      };
      
      // Using Record<string, string> type to avoid ESLint naming convention issues
      metadata.openGraph['published_time'] = '2023-01-02';

      const result = (service as any)._extractDateFromMetadata(metadata);
      expect(result).toBe('2023-01-02');
    });

    it('should extract modified_time if published_time not available', () => {
      const metadata = {
        article: {} as Record<string, string>,
        openGraph: {} as Record<string, string>,
        twitterCard: {} as Record<string, string>,
        canonicalUrl: '',
        extractionMethod: 'fallback' as 'fallback' | 'readability',
        extractionConfidence: 0.5
      };
      
      // Using Record<string, string> type to avoid ESLint naming convention issues
      metadata.article['modified_time'] = '2023-01-03';

      const result = (service as any)._extractDateFromMetadata(metadata);
      expect(result).toBe('2023-01-03');
    });

    it('should extract updated_time from Open Graph if other dates not available', () => {
      const metadata = {
        article: {} as Record<string, string>,
        openGraph: {} as Record<string, string>,
        twitterCard: {} as Record<string, string>,
        canonicalUrl: '',
        extractionMethod: 'fallback' as 'fallback' | 'readability',
        extractionConfidence: 0.5
      };
      
      // Using Record<string, string> type to avoid ESLint naming convention issues
      metadata.openGraph['updated_time'] = '2023-01-04';

      const result = (service as any)._extractDateFromMetadata(metadata);
      expect(result).toBe('2023-01-04');
    });

    it('should return undefined if no date available', () => {
      const metadata = {
        article: {},
        openGraph: {},
        twitterCard: {},
        canonicalUrl: '',
        extractionMethod: 'fallback' as 'fallback' | 'readability',
        extractionConfidence: 0.5
      };

      const result = (service as any)._extractDateFromMetadata(metadata);
      expect(result).toBeUndefined();
    });
  });

  describe('_calculateQualityScore', () => {
    it('should calculate higher score for readability extraction', () => {
      const content = '<p>This is a test paragraph with some content.</p><p>This is another paragraph with more content.</p>';
      const metadata = {
        extractionMethod: 'readability' as 'readability' | 'fallback',
        extractionConfidence: 0.9,
        openGraph: { 'title': 'Test' },
        article: { 'author': 'Test Author' },
        canonicalUrl: 'https://example.com',
        twitterCard: {}
      };

      const result = (service as any)._calculateQualityScore(content, metadata);
      expect(result).toBeGreaterThan(0.5);
    });

    it('should calculate lower score for fallback extraction', () => {
      const content = '<p>This is a test paragraph with some content.</p>';
      const metadata = {
        extractionMethod: 'fallback' as 'readability' | 'fallback',
        extractionConfidence: 0.3,
        openGraph: {},
        article: {},
        canonicalUrl: '',
        twitterCard: {}
      };

      const result = (service as any)._calculateQualityScore(content, metadata);
      expect(result).toBeLessThan(0.5);
    });

    it('should increase score for longer content', () => {
      const shortContent = '<p>Short content.</p>';
      const longContent = '<p>' + 'Long content. '.repeat(100) + '</p>';
      
      const metadata = {
        extractionMethod: 'fallback' as 'readability' | 'fallback',
        extractionConfidence: 0.5,
        openGraph: {},
        article: {},
        canonicalUrl: '',
        twitterCard: {}
      };

      const shortScore = (service as any)._calculateQualityScore(shortContent, metadata);
      const longScore = (service as any)._calculateQualityScore(longContent, metadata);

      expect(longScore).toBeGreaterThan(shortScore);
    });

    it('should increase score for more complete metadata', () => {
      const content = '<p>Test content</p>';
      
      const minimalMetadata = {
        extractionMethod: 'fallback' as 'readability' | 'fallback',
        extractionConfidence: 0.5,
        openGraph: {},
        article: {},
        canonicalUrl: '',
        twitterCard: {}
      };

      const completeMetadata = {
        extractionMethod: 'fallback' as 'readability' | 'fallback',
        extractionConfidence: 0.5,
        openGraph: { 'title': 'Test' },
        article: { 'author': 'Test Author' },
        canonicalUrl: 'https://example.com',
        twitterCard: {}
      };

      const minimalScore = (service as any)._calculateQualityScore(content, minimalMetadata);
      const completeScore = (service as any)._calculateQualityScore(content, completeMetadata);

      expect(completeScore).toBeGreaterThan(minimalScore);
    });

    it('should cap score at 1.0', () => {
      const content = '<p>' + 'Very long content. '.repeat(200) + '</p>';
      const metadata = {
        extractionMethod: 'readability' as 'readability' | 'fallback',
        extractionConfidence: 0.9,
        openGraph: { 'title': 'Test' },
        article: { 'author': 'Test Author' },
        canonicalUrl: 'https://example.com',
        twitterCard: { 'card': 'summary' }
      };

      const result = (service as any)._calculateQualityScore(content, metadata);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should calculate moderate score for content between 200-500 characters', () => {
      // This tests line 330 where content length is between 200-500 characters
      const content = '<p>' + 'a'.repeat(350) + '</p>'; // Creates content with exactly 350 characters when stripped
      const metadata = {
        extractionMethod: 'fallback' as 'readability' | 'fallback',
        extractionConfidence: 0.5,
        openGraph: {},
        article: {},
        canonicalUrl: '',
        twitterCard: {}
      };

      const result = (service as any)._calculateQualityScore(content, metadata);
      expect(result).toBeGreaterThanOrEqual(0.2);
      expect(result).toBeLessThan(0.5);
    });

    it('should calculate higher score for content between 500-1000 characters', () => {
      // This tests line 328 where content length is between 500-1000 characters
      const content = '<p>' + 'a'.repeat(750) + '</p>'; // Creates content with exactly 750 characters when stripped
      const metadata = {
        extractionMethod: 'fallback' as 'readability' | 'fallback',
        extractionConfidence: 0.5,
        openGraph: {},
        article: {},
        canonicalUrl: '',
        twitterCard: {}
      };

      const result = (service as any)._calculateQualityScore(content, metadata);
      expect(result).toBeGreaterThanOrEqual(0.3);
      expect(result).toBeLessThan(0.6);
    });
  });

  describe('_tryReadability', () => {
    it('should return null for very short content', () => {
      const html = '<html><body><p>Too short</p></body></html>';
      const url = 'https://example.com/short';
      
      const result = (service as any)._tryReadability(html, url);
      expect(result).toBeNull();
    });

    it('should extract content using Readability', () => {
      const url = 'https://example.com/article';
      const result = (service as any)._tryReadability(HTML_WITH_ARTICLE, url);

      expect(result).not.toBeNull();
      expect(result?.metadata.extractionMethod).toBe('readability');
      expect(result?.metadata.extractionConfidence).toBe(0.9);
    });
  });

  describe('_extractUsingHeuristics', () => {
    it('should extract content from article element', () => {
      const url = 'https://example.com/article';
      const result = (service as any)._extractUsingHeuristics(HTML_WITH_ARTICLE, url);

      expect(result).toBeDefined();
      expect(result.text).toContain('This is a test paragraph');
      expect(result.title).toContain('Test Article Heading');
      expect(result.metadata.extractionMethod).toBe('fallback');
    });

    it('should extract content from div when no article present', () => {
      const url = 'https://example.com/no-article';
      const result = (service as any)._extractUsingHeuristics(HTML_WITHOUT_ARTICLE, url);

      expect(result).toBeDefined();
      expect(result.text).toContain('This is a test paragraph');
      expect(result.title).toContain('Test Title');
    });

    it('should extract content from paragraphs when no container found', () => {
      const html = `
        <html>
        <head><title>No Container</title></head>
        <body>
          <h1>Test Heading</h1>
          <p>This is paragraph one with enough text to be considered.</p>
          <p>This is paragraph two with more content to extract.</p>
        </body>
        </html>
      `;
      const url = 'https://example.com/no-container';
      const result = (service as any)._extractUsingHeuristics(html, url);

      expect(result).toBeDefined();
      expect(result.text).toContain('This is paragraph one');
      expect(result.text).toContain('This is paragraph two');
    });
  });
});