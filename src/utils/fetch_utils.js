// src/utils/fetch_utils.js
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 指定されたURLからHTMLを取得し、Cheerioオブジェクトを返す
 * @param {string} url - 取得するURL
 * @returns {Promise<CheerioStatic>} - Cheerioオブジェクト
 */
async function fetchHtml(url) {
  const response = await axios.get(url);
  return cheerio.load(response.data);
}

module.exports = { fetchHtml };
