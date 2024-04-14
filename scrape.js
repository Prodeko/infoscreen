import * as puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

/**
 * Scrapes the open events from ilmo.prodeko.org.
 * The events are returned as an array of objects.
 * Each object contains the following fields:
 * - name: The name of the event
 * - description: The description of the event
 * - eventStartTime: The start time of the event
 * - registrationStartTime: The start time of the registration
 * - headerImageFile: The URL to the header image of the event
 * 
 * @returns An array of event objects
 * @throws If the scraping fails
*/
async function scrapeOpenEvents() {
    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Navigate to the website
    await page.goto('https://ilmo.prodeko.org');
  
    // Wait for JavaScript to execute for a second
    const graphqlResponse = await page.waitForResponse(async response => {
        if (response.url().includes('graphql')) {
            const json = await response.json()
            if ("data" in json) {
                return "signupOpenEvents" in json.data
            }
        }
        return false
    });

    const { data } = await graphqlResponse.json()
    const { signupOpenEvents } = data
    const events = signupOpenEvents.nodes

    // Close the browser
    await browser.close();

    return events
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
    return descriptionObject.map(({ children }) => children.map(({ text }) => text).join("")).join("\n")
}

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
    const { name, description, eventStartTime, registrationStartTime, headerImageFile } = event
    const finnishName = name.fi
    const finnishDescription = parseDescriptionString(description.fi)
    return {
        name: finnishName,
        description: finnishDescription,
        eventStartTime,
        registrationStartTime,
        headerImageFile
    }
}

/**
 * Returns a string of the current time in Finnish locale
 * Just used for logging purposes
 * @returns String of the current time
 */
const getLocaleTimeString = () => {
    const date = new Date()
    return date.toLocaleDateString("fi-FI", {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    })
}

/**
 * Scrapes the open events from ilmo.prodeko.org and saves them to a JSON file.
 * The JSON file is saved to public/events.json.
 * 
 * Used as a regularly scheduled task (cron job) for updating the events
 * that can be read by the frontend.
*/
const scrapeAndSaveEventsToJSONFile = async () => {
    const FILE_PATH = 'public/events.json'
    const timestamp = getLocaleTimeString()
    console.log(`Starting scrape ${timestamp}`)

    const rawEvents = await scrapeOpenEvents()
    const events = rawEvents.map(parseEvent)

    writeFileSync(FILE_PATH, JSON.stringify(events, null, 2))
    console.log(`Scrape finished. Found ${events.length} events. Saved to ${FILE_PATH}`)
}

scrapeAndSaveEventsToJSONFile()
