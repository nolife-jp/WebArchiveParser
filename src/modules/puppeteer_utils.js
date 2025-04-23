// src/modules/puppeteer_utils.js
const puppeteer = require('puppeteer');
const fs        = require('fs').promises;
const os        = require('os');
const path      = require('path');

/**
 * 1 ページを保存する
 * @param {puppeteer.Browser} browser
 * @param {string}            url
 * @param {object}            outputPaths
 * @param {Logger}            logger
 * @param {boolean}           captureScreenshot
 * @param {object|null}       viewport
 * @param {number}            protoTimeout       – ms
 * @param {number}            snapshotRetries    – Page.captureSnapshot のリトライ回数
 * @param {number}            navRetries         – page.goto のリトライ回数
 */
async function capturePage (
  browser, url, outputPaths, logger, captureScreenshot,
  viewport, protoTimeout, snapshotRetries, navRetries
) {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(protoTimeout);
  page.setDefaultTimeout(protoTimeout);
  if (viewport) await page.setViewport(viewport);

  /* ------------ navigation with retries ------------ */
  let attempt = 0;
  while (true) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      break;                               // 成功
    } catch (err) {
      const isTimeout = err.message.includes('Navigation timeout');
      if (!isTimeout || attempt >= navRetries) throw err;  // もう諦める
      attempt++;
      await logger.warn(
        `Navigation timeout, retry ${attempt}/${navRetries}: ${url}`
      );
    }
  }

  const title  = await page.title();
  const client = await page.target().createCDPSession();

  /* ------------ snapshot with retries ------------ */
  let mhtml = null; attempt = 0;
  while (attempt <= snapshotRetries) {
    try {
      mhtml = (await client.send('Page.captureSnapshot', { format: 'mhtml' })).data;
      break;
    } catch (err) {
      if (!err.message.includes('timed out') || attempt === snapshotRetries) {
        if (err.message.includes('timed out'))
          await logger.warn(`Snapshot timeout (giving up): ${url}`);
        else throw err;
        break;
      }
      attempt++;
      await logger.warn(
        `Snapshot timeout, retry ${attempt}/${snapshotRetries}: ${url}`
      );
      await page.reload({ waitUntil: 'networkidle2' });
    }
  }

  if (mhtml) await fs.writeFile(outputPaths.mhtmlPath, mhtml, 'utf-8');
  let screenshotPath = null;
  if (captureScreenshot && outputPaths.screenshotPath) {
    await page.screenshot({ path: outputPaths.screenshotPath, fullPage: true });
    screenshotPath = outputPaths.screenshotPath;
  }

  await page.close();
  return { title, url, mhtmlPath: mhtml ? outputPaths.mhtmlPath : null, screenshotPath };
}

/* ------------ browser launcher ------------ */
function launchBrowser (opts) {
  const profileDir = opts.userDataDir || path.join(os.tmpdir(), 'webarchiver_profile');
  return puppeteer.launch({
    headless       : opts.headless,
    userDataDir    : profileDir,
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
