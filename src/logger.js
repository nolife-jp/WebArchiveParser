const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir, debugMode = false) {
    this.logFile = path.join(logDir, 'error_log.txt');
    fs.mkdirSync(logDir, { recursive: true });
    this.debugMode = debugMode;
  }

  // JST形式でのタイムスタンプ生成
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
  }

  log(level, message) {
    const timestamp = this.getTimestamp();
    const formattedMessage = `${timestamp} ${level.toUpperCase()}: ${message}`;
    if (level === 'error') {
      fs.appendFileSync(this.logFile, `${formattedMessage}\n`);
    }
    if (level === 'debug' && !this.debugMode) return; // デバッグモードでなければスキップ
    console.log(formattedMessage);
  }

  debug(message) {
    this.log('debug', message);
  }

  info(message) {
    this.log('info', message);
  }

  warn(message) {
    this.log('warn', message);
  }

  error(message) {
    this.log('error', message);
  }
}

// デフォルトのインスタンスを生成
const loggerInstance = new Logger(path.resolve(__dirname, '../logs'), process.argv.includes('--debug'));

// 関数形式でのエクスポート
const logInfo = (message) => loggerInstance.info(message);
const logDebug = (message) => loggerInstance.debug(message);
const logWarn = (message) => loggerInstance.warn(message);
const logError = (message) => loggerInstance.error(message);

// 正しいエクスポート
module.exports = { Logger, logInfo, logDebug, logWarn, logError };
