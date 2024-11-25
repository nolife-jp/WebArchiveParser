const puppeteer = require('puppeteer');

/**
 * Puppeteerでブラウザを起動
 * @returns {Promise<Browser>} 起動したブラウザインスタンス
 */
const launchBrowser = async () => {
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
};

/**
 * ページをキャプチャし、スクリーンショットとMHTMLを保存
 * @param {Browser} browser - Puppeteerブラウザインスタンス
 * @param {string} url - 対象URL
 * @param {Object} paths - 保存先のパス
 * @returns {Object} - 保存結果
 */
const capturePage = async (browser, url, paths) => {
  const { mhtmlDir, screenshotsDir } = paths;
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const title = (await page.title()) || 'No Title';
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');

  const screenshotPath = `${screenshotsDir}/${safeTitle}.png`;
  const mhtmlPath = `${mhtmlDir}/${safeTitle}.mhtml`;

  await page.screenshot({ path: screenshotPath, fullPage: true });
  const mhtmlContent = await page.evaluate(() => document.documentElement.outerHTML);
  require('fs').writeFileSync(mhtmlPath, mhtmlContent);

  await page.close();

  return { title, screenshotPath, mhtmlPath };
};

module.exports = { launchBrowser, capturePage };
