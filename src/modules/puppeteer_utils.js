// src/modules/puppeteer_utils.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * ページをキャプチャし、MHTMLとスクリーンショットを保存する関数
 * @param {puppeteer.Browser} browser - Puppeteerのブラウザインスタンス
 * @param {string} url - キャプチャ対象のURL
 * @param {object} outputPaths - 保存先のパス
 * @param {Logger} logger - ログ出力用のロガー
 * @returns {Promise<object>} - キャプチャ情報
 */
async function capturePage(browser, url, outputPaths, logger) {
  const page = await browser.newPage();
  try {
    await logger.debug(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // ページタイトルを取得
    const pageTitle = await page.title();
    await logger.debug(`Page title: ${pageTitle}`);

    // MHTMLスナップショットを取得
    const client = await page.target().createCDPSession();
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });

    // MHTMLとスクリーンショットを保存
    await fs.writeFile(outputPaths.mhtmlPath, data, 'utf-8');
    await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });

    return {
      title: pageTitle,
      url,
      mhtmlPath: outputPaths.mhtmlPath,
      screenshotPath: outputPaths.screenshotPath,
    };
  } catch (error) {
    throw new Error(`Failed to capture page (${url}): ${error.message}`);
  } finally {
    await page.close();
  }
}

/**
 * Puppeteerのブラウザを起動する関数
 * @param {object} options - Puppeteerの起動オプション
 * @returns {Promise<puppeteer.Browser>} - Puppeteerのブラウザインスタンス
 */
async function launchBrowser(options) {
  try {
    const browser = await puppeteer.launch({
      headless: options.headless,
      args: options.args,
    });
    return browser;
  } catch (error) {
    throw new Error(`Failed to launch browser: ${error.message}`);
  }
}

module.exports = { launchBrowser, capturePage };
