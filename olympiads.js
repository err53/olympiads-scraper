const puppeteer = require("puppeteer");
const readlineSync = require("readline-sync");

const promptUser = new Promise(resolve => {
  console.log("Welcome to the Olympiads Web Scraper!");
  var email = readlineSync.question("Email: ");
  var pass = readlineSync.question("Pass: ", {
    hideEchoBack: true
  });
  resolve([email, pass]);
});

async () => {
  const [email, pass] = await promptUser();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://olympiads.ca/sign-in/", {
    waitUntil: "networkidle0"
  });

  page.once("load", () => console.log("Page loaded!"));

  await page.screenshot({ path: "./logged_in.png" });

  await page.type('input[type="email"]', email, { delay: 100 });
  await page.type('input[type="password"]', pass, { delay: 100 });
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle0" })
  ]);

  await page.screenshot({ path: "./logged_in.png" });

  await browser.close();
};
