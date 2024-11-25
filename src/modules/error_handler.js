const fs = require('fs');
const path = require('path');
const { logError } = require('../utils/logger');

/**
 * エラーハンドラークラス
 */
class ErrorHandler {
  constructor(logDir) {
    this.errorLogFile = path.join(logDir, 'error.log');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * エラーを処理し記録
   * @param {Error} error - 発生したエラー
   * @param {string} level - エラーレベル（default: 'error'）
   */
  handleError(error, level = 'error') {
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const message = `[${timestamp}] ${level.toUpperCase()}: ${error.message}\n${error.stack || 'No stack trace available'}\n`;

    // ファイルにエラーログを書き込む
    fs.appendFileSync(this.errorLogFile, message, 'utf-8');

    // ログに出力
    if (level === 'critical') {
      logError(message);
      process.exit(1); // 致命的エラーでプログラム停止
    } else {
      logError(message);
    }
  }

  /**
   * 致命的エラーを処理
   * @param {Error} error - 発生したエラー
   */
  handleCriticalError(error) {
    this.handleError(error, 'critical');
  }

  /**
   * 軽微なエラーをログに記録
   * @param {Error} error - 発生したエラー
   * @param {string} context - エラーが発生した文脈
   */
  logMinorError(error, context) {
    const message = `Minor Error in ${context}: ${error.message}`;
    this.handleError(new Error(message), 'minor');
  }
}

module.exports = ErrorHandler;
