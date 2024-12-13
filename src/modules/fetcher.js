// src/modules/fetcher.js
const { fetchTicketJamUrls } = require('../sites/ticketjam');
const { fetchTicketCoUrls } = require('../sites/ticketco');
const { URL } = require('url');

/**
 * サイトごとのフェッチャー関数のマッピング
 */
const siteFetchers = {
  'ticketjam.jp': fetchTicketJamUrls,
  'ticket.co.jp': fetchTicketCoUrls,
};

/**
 * ホスト名からサブドメイン（wwwなど）を削除する関数
 * @param {string} hostname - ホスト名
 * @returns {string} - サブドメインを除いたホスト名
 */
function normalizeHostname(hostname) {
  return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
}

/**
 * 対象サイトに応じた URL フェッチャーを返す
 * @param {string} targetUrl - 対象 URL
 * @returns {Function} - 適切なフェッチャー関数
 * @throws {Error} - サイトがサポートされていない場合
 */
const getSiteFetcher = (targetUrl) => {
  try {
    const parsedUrl = new URL(targetUrl);
    let hostname = parsedUrl.hostname.toLowerCase();
    hostname = normalizeHostname(hostname); // サブドメインを除去

    const fetcher = siteFetchers[hostname];
    if (fetcher) {
      return fetcher;
    }
    throw new Error(`Unsupported site: ${hostname}`);
  } catch (error) {
    throw new Error(`Invalid URL provided: ${targetUrl}`);
  }
};

module.exports = { getSiteFetcher };
