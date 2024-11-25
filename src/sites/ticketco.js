const cheerio = require('cheerio');
const axios = require('axios');

/**
 * TicketCo の URL を取得
 * @param {string} targetUrl - 対象 URL
 * @param {number|null} maxPages - 最大ページ数
 * @returns {Promise<string[]>} - 取得した URL の配列
 */
const fetchTicketCoUrls = async (targetUrl, maxPages = null) => {
  const urls = [];
  let currentPage = 1;

  while (!maxPages || currentPage <= maxPages) {
    const response = await axios.get(`${targetUrl}?page=${currentPage}`);
    const $ = cheerio.load(response.data);

    $('.event-link').each((_, element) => {
      const url = $(element).attr('href');
      if (url) urls.push(new URL(url, targetUrl).toString());
    });

    if (!$('.next-button').length) break; // 次ページがない場合終了
    currentPage++;
  }

  return urls;
};

module.exports = { fetchTicketCoUrls };
