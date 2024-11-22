const { loadConfig } = require('./config');
const Logger = require('./logger');
const { createDir, readUrlList } = require('./file_utils');
const { capturePage } = require('./puppeteer_utils');
const HTMLGenerator = require('./html_generator');

(async () => {
  const config = loadConfig();
  const baseDir = config.paths.base_dir;
  const urlListPath = config.paths.url_list;

  const logger = new Logger(`${baseDir}/logs`);
  const mhtmlDir = createDir(baseDir, 'webarchive_temp', 'MHTML');
  const screenshotDir = createDir(baseDir, 'webarchive_temp', 'Screenshots');
  const htmlGenerator = new HTMLGenerator(`${baseDir}/webarchive`, new Date().toLocaleString('ja-JP'));

  const urls = readUrlList(urlListPath);
  const browser = await puppeteer.launch();

  for (const url of urls) {
    try {
      const result = await capturePage(browser, url, { mhtml: mhtmlDir, screenshots: screenshotDir });
      htmlGenerator.addPage(result.title, url, result.mhtmlPath, result.screenshotPath);
      logger.logInfo(`Saved: ${url}`);
    } catch (error) {
      logger.logError(`Failed to save ${url}: ${error.message}`);
    }
  }

  htmlGenerator.save();
  await browser.close();
})();
