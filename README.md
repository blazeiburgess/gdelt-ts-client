# GDELT TypeScript Client

A comprehensive TypeScript client for the GDELT API that provides strongly-typed access to global news data, events, and media analysis. This library supports both TypeScript and JavaScript projects with full type safety and intelligent code completion.

## Features

- **Complete API Coverage**: Access all GDELT API endpoints including articles, images, timelines, tone analysis, and more
- **Type Safety**: Comprehensive TypeScript definitions for all parameters, responses, and configuration options
- **Query Building**: Fluent API for constructing complex search queries with type safety
- **Article Content**: Fetch and parse the full content of articles returned by GDELT API calls
- **Validation**: Built-in parameter validation with helpful error messages
- **Retry Logic**: Configurable retry mechanism for handling transient network errors
- **Response Validation**: Type guards and validation for ensuring data integrity
- **Method Overloads**: Simplified method signatures for common use cases
- **JavaScript Compatible**: Works in both TypeScript and JavaScript environments

## Installation

```bash
npm install gdelt-ts-client
```

## Quick Start

### TypeScript Example

```typescript
import { GdeltClient, TimespanUnit } from 'gdelt-ts-client';

const client = new GdeltClient();

async function getRecentNews() {
  const response = await client.getArticles({
    query: 'climate change',
    timespan: '1d',
    maxrecords: 10
  });
  
  console.log(`Found ${response.count} articles`);
  response.articles.forEach(article => {
    console.log(`${article.title} (${article.domain})`);
  });
}

getRecentNews();
```

### JavaScript Example

```javascript
const { GdeltClient } = require('gdelt-ts-client');

const client = new GdeltClient();

async function getRecentNews() {
  const response = await client.getArticles({
    query: 'technology',
    timespan: '1d',
    maxrecords: 10
  });
  
  console.log(`Found ${response.count} articles`);
  response.articles.forEach(article => {
    console.log(`${article.title} (${article.domain})`);
  });
}

getRecentNews();
```

## API Reference

### Client Configuration

Create a client with optional configuration:

```typescript
const client = new GdeltClient({
  timeout: 30000,        // Request timeout in milliseconds
  retry: true,           // Enable retry on failures
  maxRetries: 3,         // Maximum number of retries
  retryDelay: 1000,      // Delay between retries in milliseconds
  defaultFormat: 'json'  // Default response format
});
```

### Core Methods
8
#### Article Search

Get articles matching your query:

```typescript
// Simple query
const articles = await client.getArticles('climate change');

// With options
const articles = await client.getArticles('climate change', {
  timespan: '1w',
  maxrecords: 50
});

// Full parameter object
const articles = await client.getArticles({
  query: 'climate change',
  timespan: '1w',
  maxrecords: 50,
  sort: 'datedesc'
});
```

#### Image Search

Find images related to your query:

```typescript
// Simple image search
const images = await client.getImages('natural disasters');

// With filtering
const images = await client.getImages('natural disasters', {
  timespan: '1d',
  maxrecords: 20
});
```

#### Timeline Analysis

Get timeline data for coverage volume:

```typescript
// Simple timeline
const timeline = await client.getTimeline('covid-19', '1m');

// With smoothing
const timeline = await client.getTimeline('covid-19', {
  timespan: '1m',
  timelinesmooth: 7
});
```

#### Tone Analysis

Analyze emotional tone of coverage:

```typescript
const toneChart = await client.getToneChart('election 2024');

// Process tone distribution
toneChart.tonechart.forEach(bin => {
  console.log(`Tone ${bin.bin}: ${bin.count} articles`);
});
```

### Enhanced Query Building

Use the fluent query builder for complex searches:

```typescript
// Create a complex query
const query = client.query()
  .phrase('climate change')
  .fromCountry('us')
  .withPositiveTone(3)
  .not('opinion')
  .build();

const articles = await client.getArticles(query);
```

#### Advanced Query Builder Capabilities

The query builder provides a comprehensive set of methods for constructing complex queries:

```typescript
// Basic query operations
const query = client.query()
  .search('climate')                                // Simple search term
  .phrase('global warming')                         // Exact phrase match
  .anyOf('policy', 'agreement', 'treaty')           // Match any of these terms
  .allOf('emissions', 'reduction', 'targets')       // Match all of these terms
  .not('opinion')                                   // Exclude this term
  .build();

// Source filtering
const sourceQuery = client.query()
  .phrase('artificial intelligence')
  .fromDomain('techcrunch.com', true)               // Exact domain match
  .fromCountry('US')                                // Filter by country
  .inLanguage('english')                            // Filter by language
  .build();

// Tone analysis
const toneQuery = client.query()
  .phrase('economic outlook')
  .withTone('>', 5)                                 // Articles with positive tone
  .withAbsoluteTone('>', 7)                         // High emotional content
  .withPositiveTone(3)                              // Alternative for positive tone
  .withNegativeTone(-3)                             // Articles with negative tone
  .withNeutralTone(1)                               // Articles with neutral tone
  .withHighEmotion(5)                               // Articles with high emotional content
  .build();

// Content filtering
const themeQuery = client.query()
  .phrase('climate change')
  .withTheme('ENV_CLIMATE')                         // Filter by GDELT theme
  .build();

// Image-specific queries
const imageQuery = client.query()
  .phrase('natural disaster')
  .withImageTag('flood')                            // Filter by image tag
  .withImageWebTag('emergency')                     // Filter by web image tag
  .withImageOCR('rescue')                           // Filter by text in image
  .withImageFaceCount('>', 3)                       // Images with more than 3 faces
  .withImageFaceTone('<', 0)                        // Images with negative face expressions
  .withImageWebCount('>', 10)                       // Images with high web presence
  .withNovelImages(0.7)                             // Filter for novel images
  .withPopularImages(0.8)                           // Filter for popular images
  .build();

// Advanced text operations
const textQuery = client.query()
  .withProximity(5, ['climate', 'action'])          // Terms within 5 words of each other
  .withRepeat(3, 'urgent')                          // Term appears at least 3 times
  .build();

// Custom query components
const customQuery = client.query()
  .custom('domain:nytimes.com OR domain:washingtonpost.com')  // Custom query string
  .build();

// Grouping for complex logic
const groupedQuery = client.query()
  .phrase('climate change')
  .group()                                          // Group the previous terms
  .anyOf('policy', 'legislation', 'regulation')     // Match any of these terms
  .build();
```

#### Article-specific Query Builder

The specialized ArticleQueryBuilder provides methods tailored for article searches:

```typescript
const articleQuery = client.articleQuery()
  .breakingNews()                                   // Filter for breaking news
  .opinions()                                       // Filter for opinion pieces
  .localNews('New York')                            // Filter for local news
  .fromDomain('cnn.com')
  .withPositiveTone(2)
  .build();

const articles = await client.getArticles(articleQuery);
```

#### Image-specific Query Builder

The specialized ImageQueryBuilder provides methods tailored for image searches:

```typescript
const imageQuery = client.imageQuery()
  .disasters()                                      // Filter for disaster images
  .politicalEvents()                                // Filter for political events
  .medicalContent()                                 // Filter for medical content
  .positiveImages()                                 // Filter for positive images
  .negativeImages()                                 // Filter for negative images
  .withNovelImages()
  .build();

const images = await client.getImages(imageQuery);
```

#### Query Validation and Optimization

The client provides methods to validate and optimize queries:

```typescript
// Validate a query before execution
const validation = client.validateQuery('climate change AND (weather OR temperature)');

if (!validation.valid) {
  console.error('Query errors:', validation.errors);
}

// Check query complexity
const complexity = client.getQueryComplexity('climate change AND (weather OR temperature)');
console.log(`Query complexity: ${complexity}`);

// Check for balanced parentheses and quotes
const balanced = client.hasBalancedQuotes('climate "change');
console.log(`Query has balanced quotes: ${balanced}`);

// Get optimization suggestions
const suggestions = client.getQueryOptimizations('very complex query here');
suggestions.forEach(suggestion => {
  console.log('Suggestion:', suggestion);
});
```

### Available Methods

| Method | Description |
|--------|-------------|
| `getArticles()` | Search for news articles |
| `getArticlesWithContent()` | Search for news articles and fetch their full content |
| `fetchContentForArticles()` | Fetch full content for existing articles |
| `getImages()` | Search for images and photos |
| `getTimeline()` | Get timeline of coverage volume |
| `getTimelineWithArticles()` | Get timeline with article details |
| `getTimelineByLanguage()` | Get timeline broken down by language |
| `getTimelineByCountry()` | Get timeline broken down by country |
| `getTimelineTone()` | Get timeline of average tone |
| `getToneChart()` | Get tone distribution chart |
| `getImageTagCloud()` | Get word cloud of image tags |
| `getImageWebTagCloud()` | Get word cloud of web image tags |

### Query Parameters

All methods support these parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search query (required) |
| `timespan` | string | Time period (e.g., '1d', '1w', '1m') |
| `startdatetime` | string | Start date (YYYYMMDDHHMMSS format) |
| `enddatetime` | string | End date (YYYYMMDDHHMMSS format) |
| `maxrecords` | number | Maximum results (1-250, default 75) |
| `sort` | string | Sort order ('datedesc', 'dateasc', 'tonedesc', 'toneasc') |
| `timelinesmooth` | number | Timeline smoothing (1-30) |
| `format` | string | Response format ('json', 'csv', 'html') |

### Query Operators

Build powerful queries using GDELT operators:

```typescript
// Domain filtering
const query = 'climate change domain:cnn.com';

// Country filtering
const query = 'elections sourcecountry:unitedstates';

// Language filtering
const query = 'brexit sourcelang:english';

// Tone filtering
const query = 'economy tone>5';  // Positive tone articles

// Theme filtering
const query = 'theme:ENV_CLIMATE';

// Image filtering
const query = 'imagetag:"flood"';

// Complex combinations
const query = 'climate change AND sourcecountry:germany AND tone>2';
```

### Error Handling

The client provides comprehensive error handling:

```typescript
try {
  const response = await client.getArticles({
    query: 'climate change',
    maxrecords: 300  // Invalid: exceeds 250 limit
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Handle specific error types
  }
}
```

### Type Safety

Take advantage of full TypeScript support:

```typescript
import { 
  GdeltClient, 
  IArticleListResponse, 
  IImageCollageResponse,
  TimespanUnit,
  Mode,
  Format
} from 'gdelt-ts-client';

// Strongly typed responses
const articles: IArticleListResponse = await client.getArticles('query');
const images: IImageCollageResponse = await client.getImages('query');

// Type-safe constants
const timespan = client.createTimespan(1, TimespanUnit.DAYS);
```

## Advanced Usage

### Custom Configuration

```typescript
const client = new GdeltClient({
  timeout: 60000,
  retry: true,
  maxRetries: 5,
  retryDelay: 2000,
  defaultFormat: Format.JSON
});
```

### Complex Query Building

```typescript
const complexQuery = client.query()
  .phrase('artificial intelligence')
  .anyOf('machine learning', 'deep learning', 'neural networks')
  .fromCountry('us')
  .withTheme('SCI_TECH')
  .withPositiveTone(3)
  .not('opinion')
  .group()
  .build();

const response = await client.getArticles(complexQuery, {
  timespan: '1w',
  maxrecords: 100,
  sort: 'datedesc'
});
```

### Response Processing

```typescript
const response = await client.getArticles('climate change');

// Process articles with null safety
response.articles.forEach(article => {
  if (article.title && article.url) {
    console.log(`${article.title}`);
    console.log(`URL: ${article.url}`);
    console.log(`Tone: ${article.tone?.toFixed(2) ?? 'N/A'}`);
    console.log(`Date: ${article.seendate}`);
  }
});
```

### Article Content Fetching

The client provides methods to fetch and parse the full content of articles returned by GDELT API calls:

```typescript
import { GdeltClient } from 'gdelt-ts-client';

const client = new GdeltClient({
  contentFetcher: {
    concurrencyLimit: 3,        // Maximum number of concurrent requests
    requestDelay: 1500,         // Delay between requests to the same domain (ms)
    userAgent: 'MyApp/1.0.0',   // Custom user agent
    respectRobotsTxt: true      // Whether to respect robots.txt
  }
});

// Fetch articles with content in one call
const articlesWithContent = await client.getArticlesWithContent({
  query: 'climate change',
  timespan: '1d',
  maxrecords: 10
});

console.log(`Fetched ${articlesWithContent.contentStats.successCount} articles with content`);

articlesWithContent.articles.forEach(article => {
  if (article.content) {
    console.log(`Title: ${article.title}`);
    console.log(`Word Count: ${article.content.wordCount}`);
    console.log(`Content Preview: ${article.content.text.substring(0, 200)}...`);
  }
});
```

#### Fetching Content for Existing Articles

You can also fetch content for articles you've already retrieved:

```typescript
// Get articles first
const articles = await client.getArticles({
  query: 'technology news',
  timespan: '2h',
  maxrecords: 20
});

// Then selectively fetch content
const articlesWithContent = await client.fetchContentForArticles(
  articles.articles,
  {
    allowedDomains: ['bbc.com', 'reuters.com', 'apnews.com'],  // Only fetch from these domains
    concurrencyLimit: 2,                                       // Limit concurrent requests
    onProgress: (completed, total) => {                        // Track progress
      console.log(`Progress: ${completed}/${total} articles processed`);
    },
    includeFailures: true,      // Include articles where content fetching failed
    parseContent: true,         // Parse and clean the content
    includeRawHTML: false       // Don't include raw HTML in the response
  }
);

// Filter successful content fetches
const successfulArticles = articlesWithContent.filter(
  article => article.contentResult.success
);

console.log(`Successfully fetched content for ${successfulArticles.length} articles`);
```

#### Content Fetching Configuration

The content fetcher can be configured with various options:

```typescript
const client = new GdeltClient({
  contentFetcher: {
    // Request control
    concurrencyLimit: 5,        // Maximum concurrent requests
    requestDelay: 1000,         // Delay between requests to same domain (ms)
    timeout: 10000,             // Request timeout (ms)
    maxRetries: 2,              // Maximum retries per request
    
    // Rate limiting
    maxRequestsPerSecond: 1,    // Maximum requests per second per domain
    maxRequestsPerMinute: 30,   // Maximum requests per minute per domain
    
    // Ethical scraping
    respectRobotsTxt: true,     // Respect robots.txt files
    userAgent: 'MyApp/1.0.0',   // User agent string
    
    // Domain filtering
    skipDomains: ['paywall.com', 'subscription-only.com'],  // Skip these domains
    
    // Request behavior
    followRedirects: true,      // Follow redirects
    maxRedirects: 5,            // Maximum redirects to follow
    customHeaders: {            // Custom headers for requests
      'Accept-Language': 'en-US,en;q=0.9'
    }
  }
});
```

#### Content Fetching Statistics

You can access statistics about the content fetching process:

```typescript
const result = await client.getArticlesWithContent({
  query: 'breaking news',
  timespan: '1h',
  maxrecords: 50
});

// Check content fetching statistics
console.log('Content Fetching Statistics:');
console.log(`Success Rate: ${(result.contentStats.successCount / result.count * 100).toFixed(1)}%`);
console.log(`Average Fetch Time: ${result.contentStats.averageFetchTime}ms`);
console.log(`Total Time: ${result.contentStats.totalFetchTime}ms`);

// Log failure reasons
Object.entries(result.contentStats.failureReasons).forEach(([reason, count]) => {
  console.log(`${reason}: ${count} failures`);
});
```

### Timeline Analysis

```typescript
const timeline = await client.getTimeline('covid-19', '1m');

if (timeline.timeline && timeline.timeline.length > 0) {
  timeline.timeline.forEach(point => {
    if (point && point.date && typeof point.value === 'number') {
      console.log(`${point.date}: ${point.value.toFixed(4)}%`);
    }
  });
}
```

## Examples

### Basic News Search

```typescript
import { GdeltClient } from 'gdelt-ts-client';

const client = new GdeltClient();

async function searchNews() {
  const articles = await client.getArticles({
    query: 'renewable energy',
    timespan: '1d',
    maxrecords: 20
  });
  
  console.log(`Found ${articles.count} articles about renewable energy`);
  
  articles.articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   Source: ${article.domain}`);
    console.log(`   Date: ${article.seendate}`);
    console.log(`   Tone: ${article.tone?.toFixed(2) ?? 'N/A'}`);
  });
}

searchNews();
```

### Image Analysis

```typescript
async function analyzeImages() {
  const images = await client.getImages({
    query: 'imagetag:"protest"',
    timespan: '1w',
    maxrecords: 10
  });
  
  console.log(`Found ${images.count} protest images`);
  
  images.images.forEach((image, index) => {
    console.log(`${index + 1}. ${image.url}`);
    console.log(`   Article: ${image.articleurl}`);
    console.log(`   Tags: ${image.tags?.join(', ') ?? 'None'}`);
  });
}
```

### Tone Distribution Analysis

```typescript
async function analyzeTone() {
  const toneChart = await client.getToneChart({
    query: 'cryptocurrency',
    timespan: '1w'
  });
  
  console.log('Tone distribution for cryptocurrency coverage:');
  
  const totalArticles = toneChart.tonechart.reduce((sum, bin) => sum + bin.count, 0);
  
  toneChart.tonechart.forEach(bin => {
    const percentage = (bin.count / totalArticles * 100).toFixed(1);
    console.log(`Tone ${bin.bin}: ${bin.count} articles (${percentage}%)`);
  });
}
```

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome. Please ensure all tests pass and maintain code coverage above 90%.

## Support

For bug reports and feature requests, please use the GitHub issues page.