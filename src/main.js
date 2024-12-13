// src/main.js
const path = require('path');
const fs = require('fs').promises;
const { getSiteFetcher } = require('./modules/fetcher');
const { launchBrowser, capturePage } = require('./modules/puppeteer_utils');
const {
  initializeOutputDirs,
  generateOutputPaths,
} = require('./modules/output_manager');
const Logger = require('./utils/logger');
const HTMLGenerator = require('./modules/html_generator');
const { loadConfig } = require('../config/loader');
const { formatDate } = require('./utils/time_utils');

(async () => {
  const config = await loadConfig();
  const logger = new Logger(
    config.paths.logsDir,
    config.logging.level === 'debug',
    config.timezone
  );

  try {
    const args = process.argv.slice(2);
    let targetUrls = [];
    let maxPages = null;

    if (args.length > 0) {
      const targetUrl = args[0];
      maxPages = args[1] ? parseInt(args[1], 10) : null;
      const fetcher = getSiteFetcher(targetUrl);

      if (!fetcher) {
        await logger.error(`No fetcher available for the provided URL: ${targetUrl}`);
        process.exit(1);
      }

      await logger.info(`Fetching URLs for: ${targetUrl}`);
      targetUrls = await fetcher(targetUrl, maxPages, logger);
    } else {
      const urlListPath = path.resolve('config', 'urlList.txt');
      try {
        await fs.access(urlListPath);
      } catch {
        await logger.error('No URLs specified in arguments and config/urlList.txt is missing.');
        process.exit(1);
      }
      const fileContent = await fs.readFile(urlListPath, 'utf-8');
      targetUrls = fileContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0); // 空行を除外
      maxPages = null; // リストからの処理ではページ制限なし
      await logger.info('Using target URLs from urlList.txt.');
    }

    // "Target URLs" のログを件数のみ表示
    await logger.info(`Total Target URLs: ${targetUrls.length}`);

    await logger.info('WebArchiver started');
    await logger.info(`Max Pages: ${maxPages || 'Not Applicable'}`);

    const timestamp = formatDate(new Date(), config.timestampFormat, config.timezone);
    const outputDir = path.resolve(config.paths.outputDir, timestamp);

    const { mhtmlDir, screenshotsDir } = await initializeOutputDirs(outputDir);
    await logger.debug(`Directories initialized: MHTML -> ${mhtmlDir}, Screenshots -> ${screenshotsDir}`);

    const browser = await launchBrowser(config.puppeteer);
    await logger.info('Browser launched');

    const htmlGenerator = new HTMLGenerator(outputDir, 'Captured Pages');

    // 処理済み件数のカウンター
    let processedCount = 0;
    const totalCount = targetUrls.length;

    // シーケンシャル処理
    for (const targetUrl of targetUrls) {
      try {
        processedCount++;
        await logger.info(`Processing URL: [${processedCount}/${totalCount}] ${targetUrl}`);
        const outputPaths = generateOutputPaths({ baseDir: outputDir, url: targetUrl });
        const pageInfo = await capturePage(browser, targetUrl, outputPaths, logger); // loggerを渡す
        htmlGenerator.addPage(pageInfo);
        await logger.info(`Saved: [${processedCount}/${totalCount}] ${targetUrl}`);
      } catch (error) {
        await logger.error(`Failed to capture ${targetUrl}: ${error.message}`);
      }
    }

    await browser.close();
    await htmlGenerator.save(config.paths.templatesDir);
    await htmlGenerator.saveUrlList(targetUrls);
    await logger.info(`Generated index.html at: ${outputDir}`);
    await logger.info('WebArchiver finished');
  } catch (error) {
    await logger.error(`Critical Error: ${error.message}\n${error.stack}`);
    process.exit(1);
  }
})();
