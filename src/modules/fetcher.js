const { fetchTicketJamUrls } = require('../sites/ticketjam');
const { fetchTicketCoUrls } = require('../sites/ticketco');
const { URL } = require('url');

/**
 * 対象サイトに応じた URL フェッチャーを返す
 * @param {string} targetUrl - 対象 URL
 * @returns {Function} - 適切なフェッチャー関数
 * @throws {Error} - サイトがサポートされていない場合
 */
const getSiteFetcher = (targetUrl) => {
  try {
    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('ticketjam.jp')) {
      return fetchTicketJamUrls;
    }
    if (hostname.includes('ticket.co.jp')) {
      return fetchTicketCoUrls;
    }
    throw new Error(`Unsupported site: ${hostname}`);
  } catch (error) {
    throw new Error(`Invalid URL provided: ${targetUrl}`);
  }
};

module.exports = { getSiteFetcher };
