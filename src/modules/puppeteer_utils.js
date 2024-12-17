// src/modules/puppeteer_utils.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * ページをキャプチャし、MHTMLとスクリーンショットを保存する関数
 * @param {puppeteer.Browser} browser - Puppeteerのブラウザインスタンス
 * @param {string} url - キャプチャ対象のURL
 * @param {object} outputPaths - 保存先のパス
 * @param {Logger} logger - ログ出力用のロガー
 * @param {boolean} captureScreenshot - スクリーンショットを取得するかどうか
 * @param {object} viewport - ビューポート設定
 * @returns {Promise<object>} - キャプチャ情報
 */
async function capturePage(browser, url, outputPaths, logger, captureScreenshot, viewport) {
  const page = await browser.newPage();
  try {
    // ビューポートを設定
    if (viewport) {
      await page.setViewport(viewport);
      await logger.debug(`Viewport set to: ${JSON.stringify(viewport)}`);
    }

    await logger.debug(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // ページタイトルを取得
    const pageTitle = await page.title();
    await logger.debug(`Page title: ${pageTitle}`);

    // MHTMLスナップショットを取得
    const client = await page.target().createCDPSession();
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });

    // MHTMLを保存
    await fs.writeFile(outputPaths.mhtmlPath, data, 'utf-8');
    await logger.debug(`Saved MHTML: ${outputPaths.mhtmlPath}`);

    let screenshotPath = null;
    await logger.debug(`Capture Screenshot Flag: ${captureScreenshot}`);
    if (captureScreenshot && outputPaths.screenshotPath) {
      // スクリーンショットを保存
      await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });
      await logger.debug(`Saved Screenshot: ${outputPaths.screenshotPath}`);
      screenshotPath = outputPaths.screenshotPath;
    } else {
      await logger.debug(`Screenshot not captured for URL: ${url}`);
    }

    return {
      title: pageTitle,
      url,
      mhtmlPath: outputPaths.mhtmlPath,
      screenshotPath, // PNGが保存されていない場合は null
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
