// src/utils/logger.js
const fs = require('fs').promises;
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezonePlugin = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

class Logger {
  /**
   * ロガークラスのコンストラクタ
   * @param {string} logDir - ログディレクトリのパス
   * @param {boolean} isDebug - デバッグモードの有無
   * @param {string} timezoneStr - ログのタイムゾーン
   */
  constructor(logDir, isDebug = false, timezoneStr = 'Asia/Tokyo') {
    this.logDir = logDir;
    this.logFile = path.join(logDir, 'webarchiver.log');
    this.isDebug = isDebug;
    this.timezoneStr = timezoneStr;

    this.init();
  }

  /**
   * ログディレクトリを初期化（同期的に）
   */
  init() {
    try {
      fs.mkdir(this.logDir, { recursive: true }).catch((error) => {
        console.error(`Failed to create log directory: ${error.message}`);
      });
    } catch (error) {
      console.error(`Failed to initialize logger: ${error.message}`);
    }
  }

  /**
   * ログメッセージを出力
   * @param {string} level - ログレベル
   * @param {string} message - ログメッセージ
   */
  async log(level, message) {
    const timestamp = dayjs().tz(this.timezoneStr).format('YYYY/MM/DD HH:mm:ss');
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    try {
      await fs.appendFile(this.logFile, formattedMessage + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
    if (this.isDebug || level !== 'debug') {
      console.log(formattedMessage);
    }
  }

  async info(message) {
    await this.log('info', message);
  }

  async debug(message) {
    await this.log('debug', message);
  }

  async warn(message) {
    await this.log('warn', message);
  }

  async error(message) {
    await this.log('error', message);
  }
}

module.exports = Logger;
