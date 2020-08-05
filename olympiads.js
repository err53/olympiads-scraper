require("dotenv").config();
const puppeteer = require("puppeteer");
const https = require("https");
const url = require("url");
const fs = require("fs");
const util = require("util");

const mkdir = util.promisify(fs.mkdir);

(async () => {
  // Get login from user
  const { EMAIL, PASS, PREFIX } = process.env;

  // Start Puppeteer
  let browser, page;
  try {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  } catch (err) {
    console.error(err);
    console.error("Unable to launch browser. Aborting...");
    return;
  }

  // Navigate to sign-in page
  try {
    await page.goto("https://olympiads.ca/sign-in/", {
      waitUntil: "networkidle0",
    });
  } catch (err) {
    console.error(err);
    console.error("Unable to navigate to the sign-in page. Aborting...");
    return;
  }

  // Wait for load
  page.once("load", () => console.log("Page loaded!"));

  // Input Credentials
  try {
    await page.type('input[name="email"]', EMAIL, { delay: 100 });
    await page.type('input[name="password"]', PASS, { delay: 100 });
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);
  } catch (err) {
    console.error(err);
    console.error("Unable to sign into the homework section. Aborting...");
    return;
  }

  console.log(`Logged into ${EMAIL}`);
  // Grab links
  let aElements;
  try {
    const divElement = await page.$(".margin15");
    aElements = await divElement.$$("a");
  } catch (err) {
    console.error(err);
    console.error("Cannot find links! Aborting...");
    return;
  }

  await Promise.all(
    aElements.map(async (element) => {
      const link = await (await element.getProperty("href")).jsonValue();
      console.log(`Found link: ${link}`);
      // Parse URL
      const queryObject = url.parse(link, true).query;

      // Filter linkbacks to olympiads.ca homepage
      if (link === "https://www.olympiads.ca/") return;

      try {
        // Create directory requested
        await mkdir(`${PREFIX}${queryObject.subject}`, { recursive: true });

        // Create Filestream
        const file = fs.createWriteStream(
          `${PREFIX}${queryObject.subject}/${queryObject.file}`
        );

        console.log(`Downloading ${file.path}`);

        // Download File
        https.get(link, (res) => {
          res.pipe(file);
        });
      } catch (err) {
        console.error(err);
        console.error(`Unable to download ${link}!`);
      }
    })
  );

  // Exit
  try {
    await browser.close();
  } catch (err) {
    console.error(err);
    console.error("Unable to cleanly close browser! Aborting...");
    return;
  }
})();
