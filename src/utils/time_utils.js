// src/utils/time_utils.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezonePlugin = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

/**
 * 指定されたフォーマットとタイムゾーンで日時をフォーマットする
 * @param {Date} date - 日時
 * @param {string} format - フォーマット文字列
 * @param {string} timezone - タイムゾーン
 * @returns {string} - フォーマットされた日時
 */
function formatDate(date, format, timezone) {
  return dayjs(date).tz(timezone).format(format);
}

module.exports = { formatDate };
