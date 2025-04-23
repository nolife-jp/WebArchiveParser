// src/modules/error_handler.js

/**
 * エラーハンドラー関数
 * @param {Error} error - エラーオブジェクト
 * @param {Logger} logger - ログ出力用のロガー
 */
function handleError(error, logger) {
  if (logger) {
    logger.error(`${error.message}\n${error.stack}`);
  } else {
    console.error(`${error.message}\n${error.stack}`);
  }
}

module.exports = { handleError };
