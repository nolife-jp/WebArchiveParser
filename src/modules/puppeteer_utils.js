// src/modules/puppeteer_utils.js
const puppeteer = require('puppeteer');
const fs        = require('fs').promises;
const os        = require('os');          // ★追加
const path      = require('path');        // ★追加

/**
 * ページをキャプチャし、MHTML とスクリーンショットを保存する
 * @param {puppeteer.Browser} browser
 * @param {string}             url
 * @param {object}             outputPaths
 * @param {Logger}             logger
 * @param {boolean}            captureScreenshot
 * @param {object}             viewport
 * @returns {Promise<object>}
 */
async function capturePage(
  browser,
  url,
  outputPaths,
  logger,
  captureScreenshot,
  viewport
) {
  const page = await browser.newPage();
  try {
    // ビューポート
    if (viewport) {
      await page.setViewport(viewport);
      await logger.debug(`Viewport set to: ${JSON.stringify(viewport)}`);
    }

    await logger.debug(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // タイトル取得
    const pageTitle = await page.title();
    await logger.debug(`Page title: ${pageTitle}`);

    // MHTML スナップショット
    const client   = await page.target().createCDPSession();
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });
    await fs.writeFile(outputPaths.mhtmlPath, data, 'utf-8');
    await logger.debug(`Saved MHTML: ${outputPaths.mhtmlPath}`);

    // スクリーンショット
    let screenshotPath = null;
    if (captureScreenshot && outputPaths.screenshotPath) {
      await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });
      await logger.debug(`Saved Screenshot: ${outputPaths.screenshotPath}`);
      screenshotPath = outputPaths.screenshotPath;
    }

    return { title: pageTitle, url, mhtmlPath: outputPaths.mhtmlPath, screenshotPath };
  } finally {
    await page.close();
  }
}

/**
 * Puppeteer ブラウザを起動
 *   ‑ userDataDir を自前で用意し、First‑Party Sets を無効化
 * @param {object} options
 * @returns {Promise<puppeteer.Browser>}
 */
async function launchBrowser(options) {
  const profileDir = options.userDataDir
    ? options.userDataDir
    : path.join(os.tmpdir(), 'webarchiver_profile');

  return puppeteer.launch({
    headless: options.headless,
    userDataDir: profileDir,                     // ★追加
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-features=FirstPartySets',       // ★追加
      ...(options.args || []),
    ],
  });
}

module.exports = { launchBrowser, capturePage };
