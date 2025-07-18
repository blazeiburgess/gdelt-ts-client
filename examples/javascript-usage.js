/**
 * JavaScript usage example for the GDELT API client
 *
 * This example demonstrates how to use the client in a JavaScript project,
 * showing the TypeScript and JavaScript interoperability.
 */
import {ETimespanUnit, GdeltClient, EFormat} from 'gdelt-ts-client';


// Create a new client with default configuration
const client = new GdeltClient();

/**
 * Example 1: Basic query with JavaScript
 */
async function basicJavaScriptQuery() {
  try {
    // Create a timespan of 1 day
    const timespan = client.createTimespan(1, ETimespanUnit.days);

    // Get articles about technology
    const response = await client.getArticles({
      query: '(technology OR tech OR "artificial intelligence" OR blockchain)',
      timespan,
      maxrecords: 5
    });

    console.log(`Found ${response.count} articles about technology`);
    
    // Print the titles of the articles
    response.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.domain}`);
    });
  } catch (error) {
    console.error('Error fetching technology articles:', error);
  }
}

/**
 * Example 2: Using the client with JavaScript objects
 * 
 * This example demonstrates how to use the client with plain JavaScript objects,
 * without TypeScript interfaces.
 */
async function javascriptObjectsExample() {
  try {
    // Create a custom configuration object
    const customConfig = {
      timeout: 45000,
      retry: true,
      maxRetries: 2
    };
    
    // Create a client with custom configuration
    const customClient = new GdeltClient(customConfig);
    
    // Create a query parameters object
    const params = {
      query: '(sports OR football OR soccer OR olympics)',
      timespan: '2d', // 2 days
      maxrecords: 3,
      format: EFormat.json
    };
    
    // Get articles about sports
    const response = await customClient.getArticles(params);
    
    console.log(`Found ${response.count} articles about sports`);
    
    // Print the articles
    response.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
    });
  } catch (error) {
    console.error('Error in JavaScript objects example:', error);
  }
}

/**
 * Example 3: Working with different API modes in JavaScript
 */
async function differentModesExample() {
  try {
    // Get a timeline of news coverage about a topic
    const timelineResponse = await client.getTimeline({
      query: '(economy OR economic OR finance OR "stock market")',
      timespan: '1w' // 1 week
    });
    
    console.log('Economy news timeline:');
    // Handle the nested timeline data structure
    if (timelineResponse && timelineResponse.timeline && Array.isArray(timelineResponse.timeline) && 
        timelineResponse.timeline.length > 0 && timelineResponse.timeline[0].data) {
      // Extract the data points from the nested structure
      const timelineData = timelineResponse.timeline[0].data;
      // Print the first 3 data points
      if (Array.isArray(timelineData)) {
        timelineData.slice(0, 3).forEach(point => {
          if (point && point.date && point.value !== undefined) {
            console.log(`${point.date}: ${point.value.toFixed(4)}%`);
          }
        });
      } else {
        console.log('Timeline data is not in the expected format');
      }
    } else if (timelineResponse && timelineResponse.timeline && Array.isArray(timelineResponse.timeline)) {
      // Print the first 3 data points (original structure)
      timelineResponse.timeline.slice(0, 3).forEach(point => {
        if (point && point.date && point.value !== undefined) {
          console.log(`${point.date}: ${point.value.toFixed(4)}%`);
        }
      });
    } else {
      console.log('No timeline data available');
    }
    
    // Get a tone chart for the same topic
    const toneResponse = await client.getToneChart({
      query: '(economy OR economic OR finance OR "stock market")',
      timespan: '1w' // 1 week
    });
    
    console.log('\nEconomy news tone distribution:');
    // Handle the actual tone chart response structure
    let averageTone = 0; // Initialize with a default value
    let hasToneData = false;
    
    // Check if toneResponse exists and has the expected structure
    if (toneResponse && toneResponse.tonechart && Array.isArray(toneResponse.tonechart)) {
      // Calculate average tone
      let totalTone = 0;
      let totalArticles = 0;
      
      toneResponse.tonechart.forEach(item => {
        // Use the bin value as the tone value
        totalTone += item.bin * item.count;
        totalArticles += item.count;
      });
      
      if (totalArticles > 0) {
        averageTone = totalTone / totalArticles;
        hasToneData = true;
        console.log(`Average tone: ${averageTone.toFixed(2)}`);
      } else {
        console.log('No tone data available');
      }
    } else if (toneResponse && toneResponse.bins && Array.isArray(toneResponse.bins)) {
      // Original structure
      // Calculate average tone
      let totalTone = 0;
      let totalArticles = 0;
      
      toneResponse.bins.forEach(bin => {
        // Use the midpoint of the bin as the tone value
        const toneMidpoint = (bin.min + bin.max) / 2;
        totalTone += toneMidpoint * bin.count;
        totalArticles += bin.count;
      });
      
      if (totalArticles > 0) {
        averageTone = totalTone / totalArticles;
        hasToneData = true;
        console.log(`Average tone: ${averageTone.toFixed(2)}`);
      } else {
        console.log('No tone data available');
      }
    } else {
      console.log('No tone data available');
    }
    
    // Determine if coverage is generally positive or negative
    if (hasToneData) {
      if (averageTone > 2) {
        console.log('Coverage is generally positive');
      } else if (averageTone < -2) {
        console.log('Coverage is generally negative');
      } else {
        console.log('Coverage is generally neutral');
      }
    }
  } catch (error) {
    console.error('Error in different modes example:', error);
  }
}

/**
 * Example 4: Error handling in JavaScript
 */
async function errorHandlingJavaScriptExample() {
  // Using try-catch for error handling
  try {
    // Intentionally use an invalid parameter to trigger an error
    await client.getArticles({
      query: 'test query',
      maxrecords: 'not a number' // This should be a number
    });
  } catch (error) {
    console.error('Expected error occurred:');
    console.error(`- Message: ${error.message || 'Unknown error'}`);
    
    // In JavaScript, you can check the error type using instanceof
    if (error instanceof TypeError) {
      console.log('This is a TypeError');
    } else if (error instanceof Error) {
      console.log('This is a generic Error');
    }
  }
}

// Run the examples
async function runJavaScriptExamples() {
  console.log('=== Basic JavaScript Query ===');
  await basicJavaScriptQuery();
  
  console.log('\n=== JavaScript Objects Example ===');
  await javascriptObjectsExample();
  
  console.log('\n=== Different Modes Example ===');
  await differentModesExample();
  
  console.log('\n=== Error Handling in JavaScript ===');
  await errorHandlingJavaScriptExample();
}

// Execute the examples
runJavaScriptExamples().catch(error => {
  console.error('Error running JavaScript examples:', error);
});