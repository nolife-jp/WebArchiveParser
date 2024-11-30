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

        const items = $(".eventlist__item a.eventlist__wrap");
        if (items.length === 0) {
          console.log(`ページ ${page} にイベントが見つかりませんでした。処理を終了します。`);
          break; // イベントがない場合はループを抜ける
        }

        items.each((_, element) => {
          const href = $(element).attr("href");
          if (href && href.startsWith("/ticket/live_domestic")) {
            fetchedUrls.push(`https://ticketjam.jp${href}`);
          }
        });
      } else {
        console.error(`ページ ${page} の取得に失敗しました。ステータスコード: ${response.status}`);
        break; // ページ取得に失敗した場合はループを抜ける
      }
    }
  } catch (error) {
    console.error(`URL の取得中にエラーが発生しました: ${error.message}`);
  }

  return fetchedUrls;
}

module.exports = { fetchTicketJamUrls };
