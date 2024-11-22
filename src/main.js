const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');
const { logInfo, logDebug, logWarn, logError } = require('./logger');
const { initializeDirectories, saveUrlList } = require('./file_utils');
const fetcher = require('./fetcher');
const puppeteerUtils = require('./puppeteer_utils');
const HTMLGenerator = require('./html_generator');

(async () => {
  try {
    const args = process.argv.slice(2);
    if (args.length < 1) {
      logError('Usage: node src/main.js <URL> [max_pages]');
      process.exit(1);
    }

    const targetUrl = args[0];
    const maxPages = args[1] ? parseInt(args[1], 10) : null;

    logInfo('WebArchiver started');
    logInfo(`Target URL: ${targetUrl}`);
    logInfo(`Max Pages: ${maxPages || 'Unlimited'}`);

    const config = loadConfig();
    const baseDir = path.resolve(config.paths.base_dir);

    // 修正: 正しいディレクトリ形式でタイムスタンプを生成
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/-|:/g, '').replace('T', '_');
    const targetDir = path.join(baseDir, 'webarchive', timestamp);
    const { mhtmlDir, screenshotsDir } = initializeDirectories(targetDir);
    logDebug(`Directories initialized: ${targetDir}, ${mhtmlDir}, ${screenshotsDir}`);

    logInfo('Fetching URLs...');
    const urls = await fetcher.fetchUrls(targetUrl, maxPages);
    logInfo(`Fetched ${urls.length} URLs`);

    const urlListPath = path.join(targetDir, 'urlList.txt');
    saveUrlList(urlListPath, urls);
    logInfo(`Saved URL list to: ${urlListPath}`);

    const browser = await puppeteerUtils.launchBrowser();
    logInfo('Browser launched');

    const htmlGenerator = new HTMLGenerator(targetDir, new Date().toISOString());
    const errors = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const progress = `[${i + 1}/${urls.length}]`;

      try {
        logInfo(`${progress} Processing URL: ${url}`);
        const result = await puppeteerUtils.capturePage(browser, url, {
          mhtmlDir,
          screenshotsDir,
        });
        htmlGenerator.addPage(result.title, url, result.mhtmlPath, result.screenshotPath);
        logInfo(`${progress} Saved: ${url}`);
      } catch (error) {
        logError(`${progress} Failed to process URL: ${url}`);
        logError(`Reason: ${error.message}`);
        errors.push({ url, error });
      }
    }

    htmlGenerator.save();
    logInfo(`Generated index.html at: ${targetDir}`);

    if (errors.length > 0) {
      logWarn(`${errors.length} URLs failed to process.`);
      errors.forEach(({ url, error }) => logWarn(`Failed URL: ${url}, Reason: ${error.message}`));
    }

    await browser.close();
    logInfo('WebArchiver finished');
  } catch (error) {
    logError(`Critical Error: ${error.message}`);
    process.exit(1);
  }
})();
