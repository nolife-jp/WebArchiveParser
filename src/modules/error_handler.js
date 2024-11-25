// ファイルパス: src/modules/error_handler.js

const fs = require('fs');
const path = require('path');
const { logError } = require('../utils/logger');

/**
 * クリティカルエラーを処理
 * @param {Error} error
 */
function handleCriticalError(error) {
  logError(`[CRITICAL]: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}

module.exports = { handleCriticalError };
