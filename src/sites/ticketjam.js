// src/sites/ticketjam.js
const { fetchHtml } = require('../utils/fetch_utils');
const { URL } = require('url');

/**
 * TicketJam ページから `/ticket/live_domestic` 配下の URL を取得します。
 * @param {string} baseUrl - スクレイピングを開始する基点の URL
 * @param {number} maxPages - スクレイピングする最大ページ数
 * @param {Logger} logger - ログ出力用のロガー
 * @returns {Promise<string[]>} - 取得した URL の配列
 */
async function fetchTicketJamUrls(baseUrl, maxPages = 1, logger = console) {
  const fetchedUrls = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${baseUrl}?page=${page}`;
      logger.info(`Fetching TicketJam URLs from: ${url}`);
      let $;
      try {
        $ = await fetchHtml(url);
      } catch (axiosError) {
        logger.error(`Failed to fetch page ${page}: ${axiosError.message}`);
        break; // ページ取得に失敗した場合はループを抜ける
      }

      const items = $('.eventlist__item a.eventlist__wrap');
      if (items.length === 0) {
        logger.info(`No events found on page ${page}. Terminating fetch.`);
        break; // イベントがない場合はループを抜ける
      }

      items.each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/ticket/live_domestic')) {
          try {
            const fullUrl = new URL(href, 'https://ticketjam.jp').toString();
            fetchedUrls.push(fullUrl);
          } catch (urlError) {
            logger.error(`Invalid href: ${href} - ${urlError.message}`);
          }
        }
      });
    }
  } catch (error) {
    logger.error(`Error fetching TicketJam URLs: ${error.message}`);
    throw error; // エラーを上位に伝播させる
  }

  return fetchedUrls;
}

module.exports = { fetchTicketJamUrls };
