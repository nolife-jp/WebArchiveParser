const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * ページをキャプチャする関数
 * @param {object} browser - Puppeteerのブラウザインスタンス
 * @param {string} url - キャプチャ対象のURL
 * @param {object} outputDirs - 出力先ディレクトリ情報
 * @returns {object} - ページタイトル、MHTMLパス、スクリーンショットパス
 */
const capturePage = async (browser, url, outputDirs) => {
  const page = await browser.newPage();

  // ビューポートサイズを設定
  await page.setViewport({
    width: 1280, // 任意の幅
    height: 720, // 任意の高さ
    deviceScaleFactor: 2, // 高解像度設定
  });

  // ページを開く
  await page.goto(url, { waitUntil: 'networkidle2' });

  // MHTMLの生成
  const client = await page.target().createCDPSession();
  const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });
  const mhtmlPath = path.join(outputDirs.mhtml, `${url.replace(/https?:\/\//, '').replace(/[\/:?*|"<>]/g, '_')}.mhtml`);
  fs.writeFileSync(mhtmlPath, data);

  // スクリーンショットの保存
  const screenshotPath = path.join(outputDirs.screenshots, `${url.replace(/https?:\/\//, '').replace(/[\/:?*|"<>]/g, '_')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const title = await page.title();
  await page.close();

  return { title, mhtmlPath, screenshotPath };
};

module.exports = { capturePage };
