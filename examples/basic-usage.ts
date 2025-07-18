/**
 * Basic usage example for the GDELT API client
 * 
 * This example demonstrates how to create a client and make simple requests.
 */

import { GdeltClient, ETimespanUnit, ITimelineResponse } from '../src';

// Create a new client with default configuration
const client = new GdeltClient();

/**
 * Example 1: Get articles about climate change from the last day
 */
async function getClimateChangeArticles(): Promise<void> {
  try {
    // Create a timespan of 1 day
    const timespan = client.createTimespan(1, ETimespanUnit.days);

    // Get articles about climate change
    const response = await client.getArticles({
      query: '("climate change" OR "global warming")',
      timespan,
      maxrecords: 10
    });

    console.log(`Found ${response.count} articles about climate change`);
    
    // Print the titles of the articles
    response.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.domain})`);
    });
  } catch (error) {
    console.error('Error fetching climate change articles:', error);
  }
}

/**
 * Example 2: Get a timeline of coverage about a specific topic
 */
async function getCovidTimeline(): Promise<void> {
  try {
    // Get a timeline of COVID-19 coverage over the last month
    const timespan = client.createTimespan(1, ETimespanUnit.months);
    
    const response: ITimelineResponse = await client.getTimeline({
      query: '(covid OR coronavirus OR "covid-19")',
      timespan,
      timelinesmooth: 3 // Apply smoothing to the timeline
    });

    console.log('COVID-19 coverage timeline:');
    
    // Check if timeline data exists
    if (response.timeline && response.timeline.length > 0) {
      // Process the timeline data points
      response.timeline.forEach(point => {
        if (point && typeof point.value === 'number' && point.date) {
          console.log(`${point.date}: ${point.value.toFixed(4)}%`);
        }
      });
    } else {
      console.log('No timeline data available');
    }
  } catch (error) {
    console.error('Error fetching COVID-19 timeline:', error);
  }
}

/**
 * Example 3: Get images related to natural disasters
 */
async function getDisasterImages(): Promise<void> {
  try {
    // Get images of natural disasters from the last week
    const timespan = client.createTimespan(1, ETimespanUnit.weeks);
    
    const response = await client.getImages({
      query: '(imagetag:"flood" OR imagetag:"fire" OR imagetag:"earthquake" OR imagetag:"hurricane")',
      timespan,
      maxrecords: 5
    });

    console.log(`Found ${response.count || 0} images of natural disasters`);
    
    // Print the image URLs and their article sources
    if (response.images && response.images.length > 0) {
      response.images.forEach((image, index) => {
        console.log(`${index + 1}. ${image.url || 'No URL available'}`);
        console.log(`   Article: ${image.articleurl || 'No article URL available'}`);
        if (image.tags && image.tags.length > 0) {
          console.log(`   Tags: ${image.tags.join(', ')}`);
        } else {
          console.log(`   Tags: No tags available`);
        }
        console.log('---');
      });
    } else {
      console.log('No images found or images data not available');
    }
  } catch (error) {
    console.error('Error fetching disaster images:', error);
  }
}

// Run the examples
async function runExamples(): Promise<void> {
  console.log('=== Climate Change Articles ===');
  await getClimateChangeArticles();
  
  console.log('\n=== COVID-19 Timeline ===');
  await getCovidTimeline();
  
  console.log('\n=== Natural Disaster Images ===');
  await getDisasterImages();
}

// Execute the examples
runExamples().catch(error => {
  console.error('Error running examples:', error);
});