// src/sites/ticketjam.js
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * TicketJamからURLをフェッチする関数
 * @param {string} baseUrl - 基本URL
 * @param {number|null} maxPages - 最大ページ数
 * @param {Logger} logger - Loggerインスタンス
 * @param {Array} indexUrls - フェッチ元URLを格納する配列
 * @returns {Array} - フェッチされたURLの配列
 */
async function fetchTicketJamUrls(baseUrl, maxPages, logger, indexUrls) {
  const fetchedUrls = [];
  let currentPage = 1;

  while (true) {
    if (maxPages && currentPage > maxPages) {
      logger.info(`Reached maxPages limit: ${maxPages}. Stopping fetch.`);
      break;
    }

    // URLクラスを使用してクエリパラメータを適切に設定
    let urlObj;
    try {
      urlObj = new URL(baseUrl);
    } catch (error) {
      logger.error(`Invalid baseUrl: ${baseUrl} - ${error.message}`);
      break;
    }
    urlObj.searchParams.set('page', currentPage);
    const pageUrl = urlObj.toString();

    logger.info(`Fetching TicketJam URLs from: ${pageUrl}`);
    indexUrls.push(pageUrl); // フェッチ元URLを追加

    try {
      const response = await axios.get(pageUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      // 実際のセレクタに合わせて調整してください
      const pageUrls = [];
      $('a.eventlist__wrap').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/ticket/live_domestic')) {
          try {
            const absoluteUrl = new URL(href, 'https://ticketjam.jp').href;
            pageUrls.push(absoluteUrl);
          } catch (urlError) {
            logger.error(`Invalid href: ${href} - ${urlError.message}`);
          }
        }
      });

      // ページにURLが存在しない場合、終了
      if (pageUrls.length === 0) {
        logger.info(`No URLs found on page ${currentPage}. Stopping fetch.`);
        break;
      }

      fetchedUrls.push(...pageUrls);

      // 次ページが存在しない場合、終了
      const hasNextPage = $('a[rel=next]').length > 0; // セレクタを修正
      if (!hasNextPage) {
        logger.info(`No next page found after page ${currentPage}. Stopping fetch.`);
        break;
      }

      currentPage++;
    } catch (error) {
      logger.error(`Failed to fetch URLs from ${pageUrl}: ${error.message}`);
      break;
    }
  }

  return fetchedUrls;
}

module.exports = { fetchTicketJamUrls };
