// src/modules/puppeteer_utils.js
const puppeteer = require('puppeteer');
const fs        = require('fs').promises;
const os        = require('os');
const path      = require('path');

async function capturePage (
  browser,
  url,
  outputPaths,
  logger,
  captureScreenshot,
  viewport,
  protoTimeout,
  maxRetries                           // ★ 追加
) {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(protoTimeout);
  page.setDefaultTimeout(protoTimeout);

  try {
    if (viewport) await page.setViewport(viewport);

    await page.goto(url, { waitUntil: 'networkidle2' });

    const title  = await page.title();
    const client = await page.target().createCDPSession();

    /* ---------- Snapshot with retries ---------- */
    let mhtml = null, attempt = 0;
    while (attempt <= maxRetries) {
      try {
        mhtml = (await client.send('Page.captureSnapshot', { format: 'mhtml' })).data;
        break;                       // 成功で抜ける
      } catch (err) {
        if (!err.message.includes('timed out') || attempt === maxRetries) {
          if (err.message.includes('timed out'))
            await logger.warn(`Snapshot timeout (giving up): ${url}`);
          else
            throw err;               // その他エラーは上位へ
          break;
        }
        attempt++;
        await logger.warn(`Snapshot timeout, retry ${attempt}/${maxRetries}: ${url}`);
        await page.reload({ waitUntil: 'networkidle2' });
      }
    }

    if (mhtml) {
      await fs.writeFile(outputPaths.mhtmlPath, mhtml, 'utf-8');
    }

    let screenshotPath = null;
    if (captureScreenshot && outputPaths.screenshotPath) {
      await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });
      screenshotPath = outputPaths.screenshotPath;
    }

    return {
      title,
      url,
      mhtmlPath:      mhtml ? outputPaths.mhtmlPath : null,
      screenshotPath,
    };
  } finally {
    await page.close();
  }
}

async function launchBrowser (opts) {
  const profileDir = opts.userDataDir || path.join(os.tmpdir(), 'webarchiver_profile');
  return puppeteer.launch({
    headless: opts.headless,
    userDataDir: profileDir,
    protocolTimeout: opts.protocolTimeout,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-features=FirstPartySets',
      ...opts.args,
    ],
  });
}

module.exports = { launchBrowser, capturePage };
