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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to sign-in page
  await page.goto("https://olympiads.ca/sign-in/", {
    waitUntil: "networkidle0",
  });

  page.once("load", () => console.log("Page loaded!"));

  // await page.screenshot({ path: "./home.png" });

  // Input Credentials
  await page.type('input[name="email"]', EMAIL, { delay: 100 });
  await page.type('input[name="password"]', PASS, { delay: 100 });
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  // await page.screenshot({ path: "./logged_in.png" });

  console.log(`Logged into ${EMAIL}`);
  // Grab links

  const divElement = await page.$(".margin15");
  const aElements = await divElement.$$("a");
  const items = await Promise.all(
    aElements.map(async (element) => {
      return await (await element.getProperty("href")).jsonValue();
    })
  );

  // Delete linkback to olympiads.ca homepage
  items.pop();

  await Promise.all(
    items.map(async (link) => {
    // Parse URL
    const queryObject = url.parse(link, true).query;

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
    })
  );

  // Exit
  await browser.close();
})();
