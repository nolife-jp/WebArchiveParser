// src/utils/url_utils.js
const { URL } = require('url');

/**
 * フォームからURLを生成するユーティリティ関数
 * @param {string} action - フォームのaction属性
 * @param {string} baseUrl - ベースURL
 * @param {object} [params] - クエリパラメータのオブジェクト
 * @returns {string} - 完全なURL文字列
 */
function generateUrlFromForm(action, baseUrl, params = {}) {
  try {
    const url = new URL(action, baseUrl);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });
    return url.toString();
  } catch (error) {
    throw new Error(`Invalid URL action: ${action} - ${error.message}`);
  }
}

module.exports = { generateUrlFromForm };
