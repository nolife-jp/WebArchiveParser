const { fetchTicketJamUrls } = require('../sites/ticketjam');
const { fetchTicketCoUrls } = require('../sites/ticketco');

/**
 * 対象サイトに応じた URL フェッチャーを返す
 * @param {string} targetUrl - 対象 URL
 * @returns {Function} - 適切なフェッチャー関数
 */
const getSiteFetcher = (targetUrl) => {
  if (targetUrl.includes('ticketjam.jp')) {
    return fetchTicketJamUrls;
  } else if (targetUrl.includes('ticket.co.jp')) {
    return fetchTicketCoUrls;
  } else {
    throw new Error(`Unsupported site: ${targetUrl}`);
  }
};

module.exports = { getSiteFetcher };
