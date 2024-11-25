const axios = require('axios');

/**
 * URLをフェッチする
 * @param {string} targetUrl - 対象のURL
 * @param {number|null} maxPages - 最大ページ数
 * @returns {Promise<string[]>} - URLの配列
 */
const fetchUrls = async (targetUrl, maxPages = null) => {
  // サンプルのフェッチロジック
  console.log(`Fetching URLs from: ${targetUrl}`);
  const fetchedUrls = [];

  for (let i = 1; i <= (maxPages || 10); i++) {
    const response = await axios.get(`${targetUrl}?page=${i}`);
    // URLのパースロジックを追加
    // ...
    fetchedUrls.push(`${targetUrl}?page=${i}`);
  }

  return fetchedUrls;
};

module.exports = { fetchUrls };
