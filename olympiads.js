const puppeteer = require("puppeteer");
const readlineSync = require("readline-sync");

const promptUser = () => {
  console.log("Welcome to the Olympiads Web Scraper!");
  var email = readlineSync.question("Email: ");
  var pass = readlineSync.question("Pass: ", {
    hideEchoBack: true
  });
  return [email, pass];
};

const findByLink = async (page, linkString) => {
  const links = await page.$$("a");
  for (var i = 0; i < links.length; i++) {
    let valueHandle = await links[i].getProperty("innerText");
    let linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    if (linkString == text) {
      console.log(linkString);
      console.log(text);
      console.log("Found");
      return links[i];
    }
  }
  return null;
};

(async () => {
  const [email, pass] = await promptUser();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://olympiads.ca/sign-in/", {
    waitUntil: "networkidle0"
  });

  page.once("load", () => console.log("Page loaded!"));

  await page.screenshot({ path: "./home.png" });

  await page.type('input[name="email"]', email, { delay: 100 });
  await page.type('input[name="password"]', pass, { delay: 100 });
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle0" })
  ]);

  await page.screenshot({ path: "./logged_in.png" });

  await browser.close();
})();
