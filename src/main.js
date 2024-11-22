const puppeteer = require('puppeteer');
const { loadConfig } = require('./config');
const Logger = require('./logger');
const { createDir, readUrlList } = require('./file_utils');
const { capturePage } = require('./puppeteer_utils');
const HTMLGenerator = require('./html_generator');

// JST時刻を取得するヘルパー関数
const getJSTTime = () => {
  const now = new Date();
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return formattedTime;
};

// ディレクトリ用の日時フォーマットを生成
const formatDirDate = (jstTime) => {
  const [date, time] = jstTime.split(' ');
  const formattedTime = time.replace(/:/g, '').slice(0, 4); // 秒を削除
  return `${date}_${formattedTime}`;
};

// 初期化処理をまとめた関数
const initializeDirectories = (baseDir, dirDate) => {
  const finalDir = createDir(baseDir, 'webarchive', dirDate);
  const mhtmlDir = createDir(finalDir, 'MHTML');
  const screenshotDir = createDir(finalDir, 'Screenshots');
  return { finalDir, mhtmlDir, screenshotDir };
};

// メイン処理
(async () => {
  const config = loadConfig();
  const baseDir = config.paths.base_dir;
  const urlListPath = config.paths.url_list;

  const displayDate = getJSTTime();
  const dirDate = formatDirDate(displayDate);

  const isDebugMode = process.argv.includes('--debug'); // デバッグモードの判定
  const logger = new Logger(`${baseDir}/logs`, isDebugMode);

  logger.info('WebArchiver started');

  // 初期化処理
  const { finalDir, mhtmlDir, screenshotDir } = initializeDirectories(baseDir, dirDate);
  logger.debug(`Directories initialized: ${finalDir}, ${mhtmlDir}, ${screenshotDir}`);

  // HTMLGenerator の初期化
  const htmlGenerator = new HTMLGenerator(finalDir, displayDate);

  // URLリストの読み込み
  const urls = readUrlList(urlListPath);
  const totalUrls = urls.length;

  logger.info(`Total URLs to process: ${totalUrls}`);

  const browser = await puppeteer.launch();
  logger.debug('Puppeteer launched');

  // URL処理ループ
  let errors = [];
  await Promise.all(
    urls.map(async (url, index) => {
      const progress = `[${index + 1}/${totalUrls}]`;

      try {
        logger.debug(`${progress} Processing URL: ${url}`);
        const result = await capturePage(browser, url, { mhtml: mhtmlDir, screenshots: screenshotDir });
        htmlGenerator.addPage(result.title, url, result.mhtmlPath, result.screenshotPath);
        logger.info(`${progress} INFO: Saved: ${url}`);
      } catch (error) {
        errors.push({ url, error });
        logger.error(`${progress} ERROR: Failed to save ${url}: ${error.message}`);
      }
    })
  );

  // エラーログのまとめ出力
  if (errors.length > 0) {
    logger.warn(`${errors.length} URLs failed to process.`);
    errors.forEach(({ url, error }) => logger.warn(`Failed URL: ${url}, Reason: ${error.message}`));
  }

  htmlGenerator.save();
  logger.info(`Index page generated at: ${finalDir}/index.html`);

  await browser.close();
  logger.info('WebArchiver finished');
})();
