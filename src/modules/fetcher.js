// src/modules/fetcher.js
const { fetchTicketJamUrls } = require('../sites/ticketjam');
const { fetchTicketCoUrls } = require('../sites/ticketco'); // 追加

/**
 * TicketJam用およびTicketCo用のフェッチ関数を取得
 * @param {string} url - 対象URL
 * @returns {Function|null} - フェッチ関数
 */
function getSiteFetcher(url) {
  // 正規表現を使用してTicketJamのURLをマッチ
  const ticketJamRegex = /^https?:\/\/ticketjam\.jp\/tickets\/[^\/]+\/event_groups\/\d+/;
  if (ticketJamRegex.test(url)) {
    return fetchTicketJamUrls;
  }

  // 正規表現を使用してTicketCoのURLをマッチ
  const ticketCoRegex = /^https?:\/\/www\.ticket\.co\.jp\/sys\/d\/\d+\.htm/;
  if (ticketCoRegex.test(url)) {
    return fetchTicketCoUrls;
  }

  // 他のサイト用のフェッチ関数をここに追加

  return null;
}

module.exports = { getSiteFetcher };
