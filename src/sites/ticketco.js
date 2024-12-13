const cheerio = require('cheerio');
const axios = require('axios');

/**
 * TicketCoサイトのURLを取得するフェッチャー
 * @param {string} targetUrl - ベースURL
 * @param {number} maxPages - 最大ページ数
 * @returns {Promise<string[]>} - 取得したURLリスト
 */
async function fetchTicketCoUrls(targetUrl, maxPages = 10) {
  const urls = [];
  let currentPage = 0;
  let nextPageUrl = targetUrl;

  try {
    while (nextPageUrl && (maxPages === null || currentPage < maxPages)) {
      const response = await axios.get(nextPageUrl);
      const $ = cheerio.load(response.data);

      // <form> タグからURLを生成
      $('form.js-order_form').each((_, form) => {
        const action = $(form).attr('action');

        if (action) {
          try {
            const url = new URL(action, targetUrl);
            $(form)
              .find('input[name][value]')
              .each((_, input) => {
                const name = $(input).attr('name');
                const value = $(input).attr('value');
                if (name && value) {
                  url.searchParams.append(name, value);
                }
              });
            urls.push(url.toString());
          } catch (urlError) {
            console.error(
              `Invalid URL action in form: ${action} - ${urlError.message}`
            );
          }
        }
      });

      // 次ページリンクを取得
      const nextPageElement = $('.pager-next a').attr('href');
      nextPageUrl = nextPageElement
        ? new URL(nextPageElement, targetUrl).toString()
        : null;

      currentPage++;
    }
  } catch (error) {
    console.error(`Error fetching TicketCo URLs: ${error.message}`);
  }

  return urls;
}

module.exports = { fetchTicketCoUrls };
