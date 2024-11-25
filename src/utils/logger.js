// ファイルパス: src/utils/logger.js

const fs = require('fs');
const path = require('path');

/**
 * ロガークラス
 */
class Logger {
  constructor(logDir, isDebug = false) {
    this.logDir = logDir;
    this.logFile = path.join(logDir, 'webarchiver.log');
    this.isDebug = isDebug;

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message) {
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    fs.appendFileSync(this.logFile, formatted + '\n');
    if (this.isDebug || level !== 'debug') {
      console.log(formatted);
    }
  }

  info(message) {
    this.log('info', message);
  }

  debug(message) {
    this.log('debug', message);
  }

  warn(message) {
    this.log('warn', message);
  }

  error(message) {
    this.log('error', message);
  }
}

// シングルトンインスタンスの作成
const logger = new Logger(path.resolve(__dirname, '../../logs'), true);

const logInfo = (message) => logger.info(message);
const logDebug = (message) => logger.debug(message);
const logError = (message) => logger.error(message);

module.exports = { logInfo, logDebug, logError };
