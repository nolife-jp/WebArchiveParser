// src/sites/ticketco.js
const cheerio = require('cheerio');
const axios = require('axios');
const { generateSafeFileName } = require('../utils/file_utils');
const { generateUrlFromForm } = require('../utils/url_utils');

/**
 * TicketCoサイトのURLを取得するフェッチャー
 * @param {string} targetUrl - ベースURL
 * @param {number} maxPages - 最大ページ数
 * @param {Logger} logger - ログ出力用のロガー
 * @returns {Promise<string[]>} - 取得したURLリスト
 */
async function fetchTicketCoUrls(targetUrl, maxPages = 10, logger = console) {
  const urls = [];
  let currentPage = 0;
  let nextPageUrl = targetUrl;

  try {
    while (nextPageUrl && (maxPages === null || currentPage < maxPages)) {
      logger.info(`Fetching TicketCo URLs from: ${nextPageUrl}`);
      try {
        const response = await axios.get(nextPageUrl);
        const $ = cheerio.load(response.data);

        // <form> タグからURLを生成
        $('form.js-order_form').each((_, form) => {
          const action = $(form).attr('action');

          if (action) {
            try {
              // フォームのinput[name][value]を取得してクエリパラメータとして追加
              const formData = {};
              $(form)
                .find('input[name][value]')
                .each((_, input) => {
                  const name = $(input).attr('name');
                  const value = $(input).attr('value');
                  if (name && value) {
                    formData[name] = value;
                  }
                });
              const url = generateUrlFromForm(action, targetUrl, formData);
              urls.push(url);
              logger.debug(`Generated URL from form: ${url}`);
            } catch (urlError) {
              logger.error(`Invalid URL action in form: ${action} - ${urlError.message}`);
            }
          } else {
            logger.warn(`Form without action attribute found.`);
          }
        });

        // 次ページリンクを取得
        const nextPageElement = $('.pager-next a').attr('href');
        nextPageUrl = nextPageElement
          ? new URL(nextPageElement, targetUrl).toString()
          : null;

        currentPage++;
        logger.debug(`Current Page: ${currentPage}, Next Page URL: ${nextPageUrl}`);
      } catch (error) {
        logger.error(`Failed to fetch page ${currentPage + 1}: ${error.message}`);
        break; // ページ取得に失敗した場合はループを抜ける
      }
    }
  } catch (error) {
    logger.error(`Error fetching TicketCo URLs: ${error.message}`);
  }

  logger.debug(`Total fetched URLs from TicketCo: ${urls.length}`);
  return urls;
}

module.exports = { fetchTicketCoUrls };
