const { logError } = require('../utils/logger');

/**
 * クリティカルエラーを処理
 * @param {Error} error - 発生したエラー
 */
async function handleCriticalError(error) {
  const errorMessage = `[CRITICAL]: ${error.message}\n${error.stack}`;
  await logError(errorMessage);
  console.error(errorMessage);
  process.exit(1);
}

module.exports = { handleCriticalError };
