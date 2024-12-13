const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * ブラウザを起動
 * @param {Object} options - Puppeteerの起動オプション
 * @returns {Promise<Browser>} - Puppeteerのブラウザインスタンス
 */
async function launchBrowser(options) {
  try {
    const browser = await puppeteer.launch(options);
    return browser;
  } catch (error) {
    throw new Error(`Failed to launch browser: ${error.message}`);
  }
}

/**
 * ページをキャプチャ（スクリーンショットとMHTML）
 * @param {Browser} browser - Puppeteerのブラウザインスタンス
 * @param {string} url - キャプチャ対象のURL
 * @param {Object} outputPaths - 出力パス
 * @returns {Promise<Object>} - キャプチャ情報
 */
async function capturePage(browser, url, outputPaths) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // ページタイトルを取得
    const pageTitle = await page.title();

    // MHTMLスナップショットを取得
    const client = await page.target().createCDPSession();
    const { data } = await client.send('Page.captureSnapshot', {
      format: 'mhtml',
    });

    // MHTMLとスクリーンショットを保存
    await fs.writeFile(outputPaths.mhtmlPath, data, 'utf-8');
    await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });

    return {
      title: pageTitle,
      url: url,
      mhtmlPath: outputPaths.mhtmlPath,
      screenshotPath: outputPaths.screenshotPath,
    };
  } catch (error) {
    throw new Error(`Failed to capture page (${url}): ${error.message}`);
  } finally {
    await page.close();
  }
}

module.exports = { launchBrowser, capturePage };
