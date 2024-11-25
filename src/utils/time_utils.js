const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 現在時刻を指定フォーマットで取得（JST）
 * @param {string} format - 出力フォーマット
 * @returns {string} - フォーマットされた時刻文字列
 */
const getCurrentTimestamp = (format = 'YYYY-MM-DD_HHmm') => {
  return dayjs().tz('Asia/Tokyo').format(format);
};

module.exports = { getCurrentTimestamp };
