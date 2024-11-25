const { createDir } = require('../utils/file_utils');
const { getCurrentTimestamp } = require('../utils/time_utils');

/**
 * 出力ディレクトリを初期化
 * @param {string} baseDir - ベースディレクトリ
 * @returns {Object} - 各ディレクトリパス
 */
const initializeOutputDirs = (baseDir) => {
  const timestamp = getCurrentTimestamp();
  const outputDir = createDir(baseDir, 'output', 'webarchive', timestamp);
  const mhtmlDir = createDir(outputDir, 'MHTML');
  const screenshotsDir = createDir(outputDir, 'Screenshots');

  return { outputDir, mhtmlDir, screenshotsDir };
};

module.exports = { initializeOutputDirs };
