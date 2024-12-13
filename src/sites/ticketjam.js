const cheerio = require('cheerio');
const axios = require('axios');
const Logger = require('../utils/logger');

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
      logger.info(`TicketJam から URL を取得中: ${url}`);
      let response;
      try {
        response = await axios.get(url);
      } catch (axiosError) {
        logger.error(
          `ページ ${page} の取得中にエラーが発生しました: ${axiosError.message}`
        );
        break; // ページ取得に失敗した場合はループを抜ける
      }

      if (response.status === 200) {
        const $ = cheerio.load(response.data);

        const items = $('.eventlist__item a.eventlist__wrap');
        if (items.length === 0) {
          logger.info(
            `ページ ${page} にイベントが見つかりませんでした。処理を終了します。`
          );
          break; // イベントがない場合はループを抜ける
        }

        items.each((_, element) => {
          const href = $(element).attr('href');
          if (href && href.startsWith('/ticket/live_domestic')) {
            const fullUrl = new URL(href, 'https://ticketjam.jp').toString();
            fetchedUrls.push(fullUrl);
          }
        });
      } else {
        logger.error(
          `ページ ${page} の取得に失敗しました。ステータスコード: ${response.status}`
        );
        break; // ページ取得に失敗した場合はループを抜ける
      }
    }
  } catch (error) {
    logger.error(`URL の取得中にエラーが発生しました: ${error.message}`);
    throw error; // エラーを上位に伝播させる
  }

  return fetchedUrls;
}

module.exports = { fetchTicketJamUrls };
