const puppeteer = require("puppeteer");
const fs = require("fs");

async function launchBrowser(options) {
  const browser = await puppeteer.launch(options);
  return browser;
}

async function capturePage(browser, url, outputPaths) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // ページタイトルを取得
    const pageTitle = await page.title();

    // MHTMLスナップショットを取得
    const client = await page.target().createCDPSession();
    const { data } = await client.send("Page.captureSnapshot", { format: "mhtml" });

    // MHTMLとスクリーンショットを保存
    fs.writeFileSync(outputPaths.mhtmlPath, data);
    await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });

    return {
      title: pageTitle,
      url: url,
      mhtmlPath: outputPaths.mhtmlPath,
      screenshotPath: outputPaths.screenshotPath,
    };
  } catch (error) {
    throw new Error(`Failed to capture page: ${error.message}`);
  } finally {
    await page.close();
  }
}

module.exports = { launchBrowser, capturePage };
