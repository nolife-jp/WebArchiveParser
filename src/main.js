const path = require("path");
const { getSiteFetcher } = require("./modules/fetcher");
const { launchBrowser, capturePage } = require("./modules/puppeteer_utils");
const { initializeOutputDirs, generateOutputPaths } = require("./modules/output_manager");
const Logger = require("./utils/logger");
const HTMLGenerator = require("./modules/html_generator");
const { loadConfig } = require("../config/loader");
const { getCurrentTimestamp } = require("./utils/time_utils");

(async () => {
  const logger = new Logger("logs");
  try {
    const args = process.argv.slice(2);
    if (args.length < 1) {
      logger.error("Usage: node src/main.js <URL> [max_pages]");
      process.exit(1);
    }

    const targetUrl = args[0];
    const maxPages = args[1] ? parseInt(args[1], 10) : null;

    logger.info("WebArchiver started");
    logger.info(`Target URL: ${targetUrl}`);
    logger.info(`Max Pages: ${maxPages || "Unlimited"}`);

    const config = loadConfig();
    const timestamp = getCurrentTimestamp(config.timestampFormat);
    const outputDir = path.resolve(config.paths.outputDir, timestamp);

    const { mhtmlDir, screenshotsDir } = initializeOutputDirs(outputDir);
    logger.debug(`Directories initialized: MHTML -> ${mhtmlDir}, Screenshots -> ${screenshotsDir}`);

    const fetchSiteUrls = getSiteFetcher(targetUrl);
    if (!fetchSiteUrls) {
      throw new Error("No valid fetch function returned by getSiteFetcher");
    }

    logger.info("Fetching URLs...");
    const urls = await fetchSiteUrls(targetUrl, maxPages);
    logger.info(`Fetched ${urls.length} URLs`);

    const browser = await launchBrowser(config.puppeteer);
    logger.info("Browser launched");

    const htmlGenerator = new HTMLGenerator(outputDir, "Captured Pages");

    // URLリストを保存
    htmlGenerator.saveUrlList(urls); // 新しい機能をここに追加

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      logger.info(`[${i + 1}/${urls.length}] Processing URL: ${url}`);
      try {
        const outputPaths = generateOutputPaths({
          baseDir: outputDir,
          url: url,
        });

        // capturePage関数からページ情報を取得
        const pageInfo = await capturePage(browser, url, outputPaths);

        // ページ情報をHTMLGeneratorに追加
        htmlGenerator.addPage(pageInfo);

        logger.info(`[${i + 1}/${urls.length}] Saved: ${url}`);
      } catch (error) {
        logger.error(`[${i + 1}/${urls.length}] Failed: ${error.message}`);
      }
    }

    await browser.close();

    htmlGenerator.save();
    logger.info(`Generated index.html at: ${outputDir}`);
    logger.info("WebArchiver finished");
  } catch (error) {
    logger.error(`Critical Error: ${error.message}`);
    process.exit(1);
  }
})();
