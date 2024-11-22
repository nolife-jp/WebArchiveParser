const ticketjam = require('./ticketjam');
const ticketco = require('./ticketco');

/**
 * URLと最大ページ数に基づき、サイトに応じたURL取得ロジックを呼び出す。
 * @param {string} url - 取得元のURL。
 * @param {number} maxPages - 最大ページ数。
 * @returns {Promise<Array<string>>} - 取得したURLリスト。
 */
const fetchUrls = async (url, maxPages) => {
    if (url.includes('ticketjam.jp')) {
        console.log('Processing ticketjam...');
        return await ticketjam.fetchUrls(url, maxPages);
    } else if (url.includes('ticket.co.jp')) {
        console.log('Processing ticketco...');
        return await ticketco.fetchUrls(url, maxPages);
    } else {
        throw new Error('Unsupported site. Please check the URL.');
    }
};

module.exports = { fetchUrls };
