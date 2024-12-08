import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

/**
 * Scrapes the events from ilmo.prodeko.org.
 * Returns both open events and upcoming events.
 *
 * The events are returned as an array of objects.
 * Each object contains the following fields:
 * - name: The name of the event
 * - description: The description of the event
 * - eventStartTime: The start time of the event
 * - registrationStartTime: The start time of the registration
 * - headerImageFile: The URL to the header image of the event
 *
 * @returns `{ openEvents: Array, upcomingEvents: Array }`
 * @throws If the scraping fails
 */
async function scrapeOpenEvents() {
  // Launch a headless browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set up a promise to wait for the desired response
  const responsePromise = new Promise((resolve, reject) => {
    page.on('response', async (response) => {
      try {
        if (response.url().includes('graphql')) {
          const json = await response.json();
          if ('data' in json && 'signupOpenEvents' in json.data) {
            resolve(json);
          }
        }
      } catch (error) {
        // Ignore errors
      }
    });
  });

  // Navigate to the website
  await page.goto('https://ilmo.prodeko.org');

  // Wait for the GraphQL response
  const data = await responsePromise;

  const { signupOpenEvents, signupUpcomingEvents } = data.data;
  const openEvents = signupOpenEvents.nodes;
  const upcomingEvents = signupUpcomingEvents.nodes;

  // Close the browser
  await browser.close();

  return { openEvents, upcomingEvents };
}

/**
 * Parses a description object from the GraphQL response to a single string.
 * The description object is an array of {type, children}
 * where children is an array of {type, text}
 * @param descriptionObject From the GraphQL response
 * @returns A single string of the description
 */
const parseDescriptionString = (descriptionObject) => {
  // description is an array of {type, children}
  // where children is an array of {type, text}
  // we want a single string of text
  return descriptionObject
    .map(({ children }) => children.map(({ text }) => text).join(''))
    .join('\n');
};

/**
 * Parses an event object from the GraphQL response to a more readable format.
 * The format is {name, description, eventStartTime, registrationStartTime, headerImageFile}
 * where all fields are strings.
 * headerImageFile is the URL to the header image of the event.
 *
 * @param event An object from the GraphQL response
 * @returns The parsed event object
 */
const parseEvent = (event) => {
  const {
    name,
    description,
    eventStartTime,
    registrationStartTime,
    headerImageFile,
  } = event;
  const finnishName = name.fi;
  const finnishDescription = parseDescriptionString(description.fi);
  return {
    name: finnishName,
    description: finnishDescription,
    eventStartTime,
    registrationStartTime,
    headerImageFile,
  };
};

/**
 * Returns a string of the current time in Finnish locale
 * Just used for logging purposes
 * @returns String of the current time
 */
const getLocaleTimeString = () => {
  const date = new Date();
  return date.toLocaleDateString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};

/**
 * Scrapes the open and upcoming events from ilmo.prodeko.org and saves them to a JSON file.
 * The JSON file is saved to public/events.json.
 *
 * Used as a regularly scheduled task (cron job) for updating the events
 * that can be read by the frontend.
 */
const scrapeAndSaveEventsToJSONFile = async () => {
  const FILE_PATH = process.env.EVENT_FILE_PATH || 'public/events.json';
  const timestamp = getLocaleTimeString();
  console.log(`Starting scrape ${timestamp}`);

  const { openEvents, upcomingEvents } = await scrapeOpenEvents();

  const openEventsParsed = openEvents.map(parseEvent);
  const upcomingEventsParsed = upcomingEvents.map(parseEvent);
  const events = { open: openEventsParsed, upcoming: upcomingEventsParsed };

  writeFileSync(FILE_PATH, JSON.stringify(events, null, 2));
  console.log(
    `Found ${openEventsParsed.length} open events and ${upcomingEventsParsed.length} upcoming events.`
  );
  console.log(`Saved to ${FILE_PATH}`);
  console.log('Scrape finished');
};

scrapeAndSaveEventsToJSONFile();
