// src/modules/fetcher.js
const { fetchTicketJamUrls } = require('../sites/ticketjam');

/**
 * TicketJam用のフェッチ関数を取得
 * @param {string} url - 対象URL
 * @returns {Function|null} - フェッチ関数
 */
function getSiteFetcher(url) {
  // 正規表現を使用して任意のアーティストのevent_groups URLをマッチ
  const ticketJamRegex = /^https?:\/\/ticketjam\.jp\/tickets\/[^\/]+\/event_groups\/\d+/;
  if (ticketJamRegex.test(url)) {
    return fetchTicketJamUrls;
  }
  // 他のサイト用のフェッチ関数をここに追加
  return null;
}

module.exports = { getSiteFetcher };
