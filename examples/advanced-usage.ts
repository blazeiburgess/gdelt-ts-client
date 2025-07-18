/**
 * Advanced usage example for the GDELT API client
 * 
 * This example demonstrates more complex queries and additional features of the client.
 */

import { GdeltClient, EFormat, ESort, ETimespanUnit } from '../src';

// Create a client with custom configuration
const client = new GdeltClient({
  // Custom timeout (60 seconds)
  timeout: 60000,
  // Custom retry configuration
  retry: true,
  maxRetries: 5,
  retryDelay: 2000,
  // Default format
  defaultFormat: EFormat.json
});

/**
 * Example 1: Complex query with multiple operators
 * 
 * This example demonstrates how to use multiple query operators to create a complex search.
 */
async function complexQuery(): Promise<void> {
  try {
    // Search for articles about climate policy from specific countries
    // that have a positive tone and mention specific organizations
    // Simplified query to avoid "too long" error and fixed parentheses usage
    const response = await client.getArticles({
      query: '"climate policy" ' +
             'AND sourcecountry:unitedstates ' +
             'AND tone>2',
      timespan: client.createTimespan(2, ETimespanUnit.weeks),
      maxrecords: 15,
      sort: ESort.dateDesc // Sort by date, newest first
    });

    console.log(`Found ${response.count} articles matching complex query`);
    
    // Print the articles with their tone scores
    response.articles.forEach((article, index) => {
      console.log(`${index + 1}. [${article.tone?.toFixed(2) ?? 'N/A'}] ${article.title}`);
      console.log(`   Source: ${article.domain} (${article.sourcecountry})`);
      console.log(`   Date: ${formatDate(article.seendate)}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error executing complex query:', error);
  }
}

/**
 * Example 2: Comparing coverage across languages
 * 
 * This example demonstrates how to analyze coverage of a topic across different languages.
 */
async function compareLanguageCoverage(): Promise<void> {
  try {
    // Get a breakdown of coverage about Ukraine by language
    const response = await client.getTimelineByLanguage({
      query: '(ukraine OR ukrainian OR kyiv OR zelensky)',
      timespan: client.createTimespan(1, ETimespanUnit.months)
    });

    console.log('Coverage of Ukraine by language:');
    
    // Check if timeline has data
    if (response.timeline && response.timeline.length > 0) {
      // Get the most recent data point
      const latestDataPoint = response.timeline[response.timeline.length - 1];
      
      if (latestDataPoint?.values) {
        // Sort languages by coverage percentage (descending)
        const sortedLanguages = Object.entries(latestDataPoint.values)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Top 10 languages
        
        // Print the top languages by coverage percentage
        console.log(`Date: ${latestDataPoint.date}`);
        sortedLanguages.forEach(([language, percentage], index) => {
          // Find the language name from the labels array
          const languageName = response.labels?.find(label => label.startsWith(language + ':'))?.split(':')[1] ?? language;
          console.log(`${index + 1}. ${languageName}: ${percentage.toFixed(4)}%`);
        });
      } else {
        console.log('No language data available in the latest data point');
      }
    } else {
      console.log('No timeline data available');
    }
  } catch (error) {
    console.error('Error comparing language coverage:', error);
  }
}

/**
 * Example 3: Analyzing tone distribution
 * 
 * This example demonstrates how to analyze the tone distribution of coverage about a topic.
 */
async function analyzeToneDistribution(): Promise<void> {
  try {
    // Get a tone chart for coverage about artificial intelligence
    const response = await client.getToneChart({
      query: '("artificial intelligence" OR "machine learning" OR "deep learning" OR "neural networks" OR "computer vision")',
      timespan: client.createTimespan(2, ETimespanUnit.weeks)
    });

    console.log('Tone distribution for AI coverage:');
    
    // Group tone bins into categories
    const veryNegative = response.tonechart.filter(bin => bin.bin < -10);
    const negative = response.tonechart.filter(bin => bin.bin >= -10 && bin.bin < -2);
    const neutral = response.tonechart.filter(bin => bin.bin >= -2 && bin.bin <= 2);
    const positive = response.tonechart.filter(bin => bin.bin > 2 && bin.bin <= 10);
    const veryPositive = response.tonechart.filter(bin => bin.bin > 10);
    
    // Calculate total articles in each category
    const veryNegativeCount = veryNegative.reduce((sum, bin) => sum + bin.count, 0);
    const negativeCount = negative.reduce((sum, bin) => sum + bin.count, 0);
    const neutralCount = neutral.reduce((sum, bin) => sum + bin.count, 0);
    const positiveCount = positive.reduce((sum, bin) => sum + bin.count, 0);
    const veryPositiveCount = veryPositive.reduce((sum, bin) => sum + bin.count, 0);
    
    // Calculate total articles
    const totalCount = response.tonechart.reduce((sum, bin) => sum + bin.count, 0);
    
    // Print the distribution
    console.log(`Very Negative (< -10): ${veryNegativeCount} (${percentage(veryNegativeCount, totalCount)}%)`);
    console.log(`Negative (-10 to -2): ${negativeCount} (${percentage(negativeCount, totalCount)}%)`);
    console.log(`Neutral (-2 to 2): ${neutralCount} (${percentage(neutralCount, totalCount)}%)`);
    console.log(`Positive (2 to 10): ${positiveCount} (${percentage(positiveCount, totalCount)}%)`);
    console.log(`Very Positive (> 10): ${veryPositiveCount} (${percentage(veryPositiveCount, totalCount)}%)`);
    
    // If there are articles in the very positive or very negative categories, show examples
    if (veryPositiveCount > 0 && veryPositive[0]?.toparts && veryPositive[0].toparts.length > 0) {
      console.log('\nExample of very positive article:');
      const article = veryPositive[0].toparts[0];
      if (article) {
        console.log(`Title: ${article.title || 'N/A'}`);
        console.log(`URL: ${article.url || 'N/A'}`);
        console.log(`Tone: ~${veryPositive[0].bin}`);
      } else {
        console.log('Article details not available');
      }
    }
    
    if (veryNegativeCount > 0 && veryNegative[0]?.toparts && veryNegative[0].toparts.length > 0) {
      console.log('\nExample of very negative article:');
      const article = veryNegative[0].toparts[0];
      if (article) {
        console.log(`Title: ${article.title || 'N/A'}`);
        console.log(`URL: ${article.url || 'N/A'}`);
        console.log(`Tone: ~${veryNegative[0].bin}`);
      } else {
        console.log('Article details not available');
      }
    }
  } catch (error) {
    console.error('Error analyzing tone distribution:', error);
  }
}

/**
 * Example 4: Error handling and retry logic
 * 
 * This example demonstrates how to handle errors and use the retry logic.
 */
async function errorHandlingExample(): Promise<void> {
  try {
    // Intentionally use an invalid query to trigger an error
    await client.getArticles({
      query: '' // Empty query will cause an error
    });
  } catch (error) {
    console.error('Expected error occurred:');
    if (error instanceof Error) {
      console.error(`- Message: ${error.message}`);
    } else {
      console.error(`- Unknown error: ${String(error)}`);
    }
    
    console.log('\nNow trying with a valid query:');
    
    try {
      const response = await client.getArticles({
        query: 'example query',
        maxrecords: 1
      });
      
      console.log(`Success! Found ${response.count} articles.`);
    } catch (error) {
      console.error('Error with valid query:', error);
    }
  }
}

// Helper function to format a date string
function formatDate(dateString: string): string {
  // Format: YYYYMMDDHHMMSS to YYYY-MM-DD HH:MM:SS
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hour = dateString.substring(8, 10);
  const minute = dateString.substring(10, 12);
  const second = dateString.substring(12, 14);
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// Helper function to calculate percentage
function percentage(part: number, total: number): string {
  return (part / total * 100).toFixed(1);
}

// Run the examples
async function runAdvancedExamples(): Promise<void> {
  console.log('=== Complex Query Example ===');
  await complexQuery();
  
  console.log('\n=== Language Coverage Comparison ===');
  await compareLanguageCoverage();
  
  console.log('\n=== Tone Distribution Analysis ===');
  await analyzeToneDistribution();
  
  console.log('\n=== Error Handling Example ===');
  await errorHandlingExample();
}

// Execute the examples
runAdvancedExamples().catch(error => {
  console.error('Error running advanced examples:', error);
});