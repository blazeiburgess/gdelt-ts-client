# GDELT TypeScript Client

A comprehensive TypeScript client for the GDELT API that provides strongly-typed access to global news data, events, and media analysis. This library supports both TypeScript and JavaScript projects with full type safety and intelligent code completion.

## Features

- **Complete API Coverage**: Access all GDELT API endpoints including articles, images, timelines, tone analysis, and more
- **Type Safety**: Comprehensive TypeScript definitions for all parameters, responses, and configuration options
- **Query Building**: Fluent API for constructing complex search queries with type safety
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

#### Article-specific Query Builder

```typescript
const articleQuery = client.articleQuery()
  .breakingNews()
  .fromDomain('cnn.com')
  .build();

const articles = await client.getArticles(articleQuery);
```

#### Image-specific Query Builder

```typescript
const imageQuery = client.imageQuery()
  .disasters()
  .withNovelImages()
  .build();

const images = await client.getImages(imageQuery);
```

### Query Validation

Validate queries before execution:

```typescript
const validation = client.validateQuery('climate change AND (weather OR temperature)');

if (!validation.valid) {
  console.error('Query errors:', validation.errors);
}

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