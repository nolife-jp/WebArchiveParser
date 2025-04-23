// src/main.js
const path = require('path');
const fs   = require('fs').promises;

const { getSiteFetcher }           = require('./modules/fetcher');
const { launchBrowser, capturePage }= require('./modules/puppeteer_utils');
const { initializeOutputDirs,
        generateOutputPaths }       = require('./modules/output_manager');
const Logger                        = require('./utils/logger');
const HTMLGenerator                 = require('./modules/html_generator');
const { loadConfig }                = require('../config/loader');
const { formatDate }                = require('./utils/time_utils');

(async () => {
  /* ───────────── 設定とロガー ───────────── */
  const config = await loadConfig();
  const logger = new Logger(
    config.paths.logsDir,
    config.logging.level === 'debug',
    config.timezone
  );

  /* ───────────── Puppeteer 起動 ───────────── */
  const restartInterval = config.puppeteer.restartInterval;
  let browser = await launchBrowser(config.puppeteer);

  async function restartBrowser(reason) {
    await logger.warn(`Restarting browser (${reason})…`);
    try { await browser.close(); } catch {/* ignore */}
    browser = await launchBrowser(config.puppeteer);
  }

  try {
    /* ───────────── 引数解析 ───────────── */
    const argv              = process.argv.slice(2);
    const includeMainUrl    = argv.includes('--include-main-url');
    const captureScreenshot = !argv.includes('--no-screenshot');

    await logger.info(
      `Flags - includeMainUrl: ${includeMainUrl}, captureScreenshot: ${captureScreenshot}`
    );

    /* ───────────── URL 収集 ───────────── */
    let targetUrls = [];
    let maxPages   = null;
    let indexUrls  = [];

    if (argv.length > 0 && !argv[0].startsWith('--')) {
      const rootUrl = argv[0];
      maxPages      = argv[1] ? parseInt(argv[1], 10) : null;

      const fetcher = getSiteFetcher(rootUrl);
      if (!fetcher) throw new Error(`No fetcher found for: ${rootUrl}`);

      await logger.info(`Fetching URLs for: ${rootUrl}`);
      const fetched = await fetcher(rootUrl, maxPages, logger, indexUrls);

      if (includeMainUrl) fetched.unshift(rootUrl);

      targetUrls = [...new Set(fetched)];
      await logger.info(`Fetched URLs count: ${fetched.length}`);
      await logger.info(`Target URLs after deduplication: ${targetUrls.length}`);
    } else {
      // urlList.txt を読むモード
      const listPath = path.resolve('config', 'urlList.txt');
      const urlsFromFile = (await fs.readFile(listPath, 'utf-8'))
                             .split('\n')
                             .map(l => l.trim())
                             .filter(Boolean);

      targetUrls = urlsFromFile;
      indexUrls  = [...urlsFromFile];          // ← ★ ここを追加
      await logger.info(`Loaded ${targetUrls.length} URLs from urlList.txt`);
    }

    /* ───────────── 出力先セットアップ ───────────── */
    const timestamp = formatDate(new Date(), config.timestampFormat, config.timezone);
    const outputDir = path.resolve(config.paths.outputDir, timestamp);

    const { mhtmlDir, screenshotsDir } =
      await initializeOutputDirs(outputDir, captureScreenshot);

    await logger.info(
      `Directories initialized: MHTML → ${mhtmlDir}` +
      (captureScreenshot ? `, Screenshots → ${screenshotsDir}` : '')
    );

    const htmlGen = new HTMLGenerator(outputDir, 'Captured Pages', captureScreenshot);

    /* ───────────── メインループ ───────────── */
    let processed = 0;

    for (const url of targetUrls) {
      if (processed > 0 && processed % restartInterval === 0) {
        await restartBrowser(`processed ${restartInterval} pages`);
      }
      processed++;
      await logger.info(`Processing: ${url} [${processed}/${targetUrls.length}]`);

      let pageInfo;

      try {
        const paths = generateOutputPaths({ baseDir: outputDir, url, captureScreenshot });

        pageInfo = await capturePage(
          browser,
          url,
          paths,
          logger,
          captureScreenshot,
          config.puppeteer.viewport,
          config.puppeteer.protocolTimeout,
          config.puppeteer.snapshotRetries
        );
      } catch (err) {
        // ---- クラッシュ or タイムアウト時の復旧 ----
        if (err.message.includes('Connection closed')) {
          await restartBrowser('crash detected');
          try {
            const paths = generateOutputPaths({ baseDir: outputDir, url, captureScreenshot });
            pageInfo = await capturePage(
              browser,
              url,
              paths,
              logger,
              captureScreenshot,
              config.puppeteer.viewport,
              config.puppeteer.protocolTimeout,
              config.puppeteer.snapshotRetries
            );
          } catch (err2) {
            await logger.error(`Retry failed ${url}: ${err2.message}`);
            continue;
          }
        } else {
          await logger.error(`Failed ${url}: ${err.message}`);
          continue;
        }
      }

      htmlGen.addPage(pageInfo);
      await logger.info(`Saved: ${url}`);
    }

    /* ───────────── 後片付け ───────────── */
    try { await browser.close(); } catch {/* ignore */}

    const templatesDirAbs = path.resolve(config.paths.templatesDir);
    await htmlGen.save(templatesDirAbs);
    await htmlGen.saveUrlList(targetUrls);

    // 追加保存
    await fs.writeFile(path.join(outputDir, 'indexUrls.txt'), indexUrls.join('\n'), 'utf-8');
    await fs.writeFile(path.join(outputDir, 'urlList.txt'),  targetUrls.join('\n'), 'utf-8');

    await logger.info(`All done: ${outputDir}`);
  } catch (err) {
    await logger.error(`Critical error: ${err.message}\n${err.stack}`);
    try { await browser.close(); } catch {/* ignore */}
    process.exit(1);
  }
})();
