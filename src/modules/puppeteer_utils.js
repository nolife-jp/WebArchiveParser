const puppeteer = require("puppeteer");

const launchBrowser = async (config) => {
  return await puppeteer.launch({
    headless: config.headless,
    defaultViewport: config.viewport,
  });
};

const capturePage = async (browser, url, mhtmlDir, screenshotsDir) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const title = (await page.title()) || "No_Title";
  const sanitizedTitle = title.replace(/[<>:"/\\|?*]+/g, "_");

  const mhtmlPath = `${mhtmlDir}/${sanitizedTitle}.mhtml`;
  const screenshotPath = `${screenshotsDir}/${sanitizedTitle}.png`;

  await page.screenshot({ path: screenshotPath });
  const mhtmlContent = await page.content();
  require("fs").writeFileSync(mhtmlPath, mhtmlContent);

  await page.close();
  return { title, mhtmlPath, screenshotPath };
};

module.exports = { launchBrowser, capturePage };
