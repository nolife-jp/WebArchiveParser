const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 現在時刻を指定フォーマットで取得
 * @param {string} format - 出力フォーマット (デフォルト: 'YYYY-MM-DD_HHmm')
 * @param {string} tz - タイムゾーン (デフォルト: 'Asia/Tokyo')
 * @returns {string} - フォーマットされた時刻文字列
 */
const getCurrentTimestamp = (format = 'YYYY-MM-DD_HHmm', tz = 'Asia/Tokyo') => {
  return dayjs().tz(tz).format(format);
};

/**
 * 指定日時をフォーマットする
 * @param {Date} date - 日時オブジェクト
 * @param {string} format - 出力フォーマット
 * @param {string} tz - タイムゾーン
 * @returns {string} - フォーマットされた時刻文字列
 */
const formatDate = (date, format = 'YYYY-MM-DD_HHmm', tz = 'Asia/Tokyo') => {
  return dayjs(date).tz(tz).format(format);
};

module.exports = { getCurrentTimestamp, formatDate };
