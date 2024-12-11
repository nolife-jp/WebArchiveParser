const path = require("path");
const fs = require("fs");
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
    const config = loadConfig();
    let targetUrls = [];
    let maxPages = null;

    if (args.length > 0) {
      // 引数が指定されている場合
      const targetUrl = args[0];
      maxPages = args[1] ? parseInt(args[1], 10) : null;
      const fetcher = getSiteFetcher(targetUrl);

      if (!fetcher) {
        logger.error(`No fetcher available for the provided URL: ${targetUrl}`);
        process.exit(1);
      }

      logger.info(`Fetching URLs for: ${targetUrl}`);
      targetUrls = await fetcher(targetUrl, maxPages);
    } else {
      // 引数がない場合はurlList.txtを使用
      const urlListPath = path.resolve("config", "urlList.txt");
      if (!fs.existsSync(urlListPath)) {
        logger.error("No URLs specified in arguments and config/urlList.txt is missing.");
        process.exit(1);
      }
      const fileContent = fs.readFileSync(urlListPath, "utf-8");
      targetUrls = fileContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0); // 空行を除外
      maxPages = null; // リストからの処理ではページ制限なし
      logger.info("Using target URLs from urlList.txt.");
    }

    logger.info("WebArchiver started");
    logger.info(`Target URLs: ${targetUrls.join(", ")}`);
    logger.info(`Max Pages: ${maxPages || "Not Applicable"}`);

    const timestamp = getCurrentTimestamp(config.timestampFormat);
    const outputDir = path.resolve(config.paths.outputDir, timestamp);

    const { mhtmlDir, screenshotsDir } = initializeOutputDirs(outputDir);
    logger.debug(`Directories initialized: MHTML -> ${mhtmlDir}, Screenshots -> ${screenshotsDir}`);

    const browser = await launchBrowser(config.puppeteer);
    logger.info("Browser launched");

    const htmlGenerator = new HTMLGenerator(outputDir, "Captured Pages");

    for (const targetUrl of targetUrls) {
      logger.info(`Processing URL: ${targetUrl}`);
      try {
        const outputPaths = generateOutputPaths({
          baseDir: outputDir,
          url: targetUrl,
        });

        const pageInfo = await capturePage(browser, targetUrl, outputPaths);
        htmlGenerator.addPage(pageInfo);

        logger.info(`Saved: ${targetUrl}`);
      } catch (error) {
        logger.error(`Failed: ${error.message}`);
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
