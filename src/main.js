const { logInfo, logDebug, logWarn, logError } = require('./utils/logger');
const { getCurrentTimestamp } = require('./utils/time_utils');
const { initializeDirectories, saveUrlList } = require('./utils/file_utils');
const { fetchUrls } = require('./modules/fetcher');
const { generateHTML } = require('./modules/html_generator');
const puppeteerUtils = require('./modules/puppeteer_utils');
const ErrorHandler = require('./modules/error_handler');

const errorHandler = new ErrorHandler('logs');

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

    const timestamp = getCurrentTimestamp();
    const baseDir = 'output';
    const targetDir = `${baseDir}/webarchive/${timestamp}`;
    const { mhtmlDir, screenshotsDir } = initializeDirectories(targetDir);

    logInfo('Fetching URLs...');
    const urls = await fetchUrls(targetUrl, maxPages);
    logInfo(`Fetched ${urls.length} URLs`);

    const urlListPath = `${targetDir}/urlList.txt`;
    saveUrlList(urlListPath, urls);
    logInfo(`Saved URL list to: ${urlListPath}`);

    const browser = await puppeteerUtils.launchBrowser();
    logInfo('Browser launched');

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
        logInfo(`${progress} Saved: ${url}`);
      } catch (error) {
        logError(`${progress} Failed to process URL: ${url}`);
        logError(`Reason: ${error.message}`);
        errors.push({ url, error });
      }
    }

    generateHTML(targetDir, urls, errors);
    logInfo(`Generated index.html at: ${targetDir}`);

    if (errors.length > 0) {
      logWarn(`${errors.length} URLs failed to process.`);
      errors.forEach(({ url, error }) => logWarn(`Failed URL: ${url}, Reason: ${error.message}`));
    }

    await browser.close();
    logInfo('WebArchiver finished');
  } catch (error) {
    errorHandler.handleCriticalError(error);
  }
})();
