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
    config.logging.level === 'debug', // ログレベルに基づいて DEBUG フラグを設定
    config.timezone
  );

  try {
    // コマンドライン引数の解析
    const args = process.argv.slice(2);
    const includeMainUrl = args.includes('--include-main-url');
    const captureScreenshot = !args.includes('--no-screenshot');

    // フラグの解析状態をログに出力
    await logger.info(`Flags - includeMainUrl: ${includeMainUrl}, captureScreenshot: ${captureScreenshot}`);

    let targetUrls = [];
    let maxPages = null;
    let indexUrls = []; // フェッチ元URLを格納する配列

    if (args.length > 0) {
      const targetUrl = args[0];
      maxPages = args[1] ? parseInt(args[1], 10) : null;
      const fetcher = getSiteFetcher(targetUrl);

      if (!fetcher) {
        await logger.error(`No fetcher available for the provided URL: ${targetUrl}`);
        process.exit(1);
      }

      await logger.info(`Fetching URLs for: ${targetUrl}`);

      // ページ数の制限を考慮してフェッチ
      const fetchedUrls = await fetcher(targetUrl, maxPages, logger, indexUrls);

      // fetchedUrls の件数をログに出力
      await logger.info(`Fetched URLs count: ${fetchedUrls.length}`);

      if (includeMainUrl) {
        // メインURLをキャプチャ対象に含めるが、urlList.txtには含めない
        targetUrls.unshift(targetUrl);
        await logger.info(`Including main URL in capture: ${targetUrl}`);
      }

      // fetchedUrls を targetUrls に追加
      targetUrls = [...targetUrls, ...fetchedUrls];
      await logger.info(`Target URLs before deduplication: ${targetUrls.length}`);

      // 重複を排除
      targetUrls = [...new Set(targetUrls)];
      await logger.info(`Target URLs after deduplication: ${targetUrls.length}`);
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

    // 総対象URL件数をログに出力
    await logger.info(`Total Target URLs: ${targetUrls.length}`);

    await logger.info('WebArchiver started');
    await logger.info(`Max Pages: ${maxPages || 'Not Applicable'}`);

    const timestamp = formatDate(new Date(), config.timestampFormat, config.timezone);
    const outputDir = path.resolve(config.paths.outputDir, timestamp);

    // initializeOutputDirs に captureScreenshot を渡す
    const { mhtmlDir, screenshotsDir } = await initializeOutputDirs(outputDir, captureScreenshot);
    if (captureScreenshot) {
      await logger.info(`Directories initialized: MHTML -> ${mhtmlDir}, Screenshots -> ${screenshotsDir}`);
    } else {
      await logger.info(`Directories initialized: MHTML -> ${mhtmlDir}`);
    }

    const browser = await launchBrowser(config.puppeteer);
    await logger.info('Browser launched');

    const htmlGenerator = new HTMLGenerator(outputDir, 'Captured Pages', captureScreenshot);

    // 処理済み件数のカウンター
    let processedCount = 0;
    const totalCount = targetUrls.length;

    // シーケンシャル処理
    for (const targetUrl of targetUrls) {
      try {
        processedCount++;
        await logger.info(`Processing URL: ${targetUrl} [${processedCount}/${totalCount}]`);
        const outputPaths = generateOutputPaths({ baseDir: outputDir, url: targetUrl, captureScreenshot });
        await logger.debug(`Generated Output Paths: MHTML -> ${outputPaths.mhtmlPath}${captureScreenshot ? `, Screenshot -> ${outputPaths.screenshotPath}` : ''}`);
        const pageInfo = await capturePage(browser, targetUrl, outputPaths, logger, captureScreenshot); // loggerとフラグを渡す
        htmlGenerator.addPage(pageInfo);
        await logger.info(`Saved: ${targetUrl} [${processedCount}/${totalCount}]`);
      } catch (error) {
        await logger.error(`Failed to capture ${targetUrl}: ${error.message}`);
      }
    }

    await browser.close();
    await htmlGenerator.save(config.paths.templatesDir);
    await htmlGenerator.saveUrlList(targetUrls.filter(url => url !== args[0])); // main URLを除外

    // indexUrls.txt の保存
    const indexUrlsPath = path.join(outputDir, 'indexUrls.txt');
    await fs.writeFile(indexUrlsPath, indexUrls.join('\n'), 'utf-8');
    await logger.info(`Generated indexUrls.txt at: ${indexUrlsPath}`);

    // urlList.txt の保存
    const urlListPath = path.join(outputDir, 'urlList.txt');
    await fs.writeFile(urlListPath, targetUrls.join('\n'), 'utf-8');
    await logger.info(`Generated urlList.txt at: ${urlListPath}`);

    await logger.info(`Generated index.html at: ${outputDir}`);
    await logger.info('WebArchiver finished');
  } catch (error) {
    await logger.error(`Critical Error: ${error.message}\n${error.stack}`);
    process.exit(1);
  }
})();
