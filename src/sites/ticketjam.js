// ファイルパス: src/sites/ticketjam.js

const cheerio = require('cheerio');
const axios = require('axios');

/**
 * TicketJam ページから `/ticket/live_domestic` 配下の URL を取得します。
 * @param {string} baseUrl - スクレイピングを開始する基点の URL
 * @param {number} maxPages - スクレイピングする最大ページ数
 * @returns {Promise<string[]>} - 取得した URL の配列
 */
async function fetchTicketJamUrls(baseUrl, maxPages = 1) {
  const fetchedUrls = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${baseUrl}?page=${page}`;
      console.log(`TicketJam から URL を取得中: ${url}`);
      const response = await axios.get(url);

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        $(".eventlist__item a.eventlist__wrap").each((_, element) => {
          const href = $(element).attr("href");
          if (href && href.startsWith("/ticket/live_domestic")) {
            fetchedUrls.push(`https://ticketjam.jp${href}`);
          }
        });
      } else {
        console.error(`ページ ${page} の取得に失敗しました。ステータスコード: ${response.status}`);
      }
    }
  } catch (error) {
    console.error(`URL の取得中にエラーが発生しました: ${error.message}`);
  }

  return fetchedUrls;
}

module.exports = { fetchTicketJamUrls };
