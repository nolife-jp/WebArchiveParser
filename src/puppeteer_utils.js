const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const launchBrowser = async () => {
  return puppeteer.launch();
};

const capturePage = async (browser, url, { mhtmlDir, screenshotsDir }) => {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // ページタイトルを取得
    const title = await page.title() || 'No Title';

    // URLに基づいたファイル名生成
    const sanitizedUrl = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
    const mhtmlPath = path.join(mhtmlDir, `${sanitizedUrl}.mhtml`);
    const screenshotPath = path.join(screenshotsDir, `${sanitizedUrl}.png`);

    // MHTML保存
    const cdp = await page.target().createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    fs.writeFileSync(mhtmlPath, data);

    // スクリーンショット保存
    await page.screenshot({ path: screenshotPath });

    return { title, url, mhtmlPath, screenshotPath };
  } finally {
    await page.close();
  }
};

module.exports = { launchBrowser, capturePage };
