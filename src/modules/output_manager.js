const fs = require('fs').promises;
const path = require('path');
const { generateSafeFileName } = require('../utils/file_utils');

/**
 * 出力ディレクトリを初期化
 * @param {string} baseDir - 基本ディレクトリのパス
 * @returns {Promise<Object>} - 作成されたディレクトリのパス
 */
async function initializeOutputDirs(baseDir) {
  try {
    const mhtmlDir = path.join(baseDir, 'MHTML');
    const screenshotsDir = path.join(baseDir, 'Screenshots');

    await fs.mkdir(mhtmlDir, { recursive: true });
    await fs.mkdir(screenshotsDir, { recursive: true });

    return {
      baseDir: baseDir,
      mhtmlDir: mhtmlDir,
      screenshotsDir: screenshotsDir,
    };
  } catch (error) {
    throw new Error(
      `Failed to initialize output directories: ${error.message}`
    );
  }
}

/**
 * 出力パスを生成
 * @param {Object} params
 * @param {string} params.baseDir - 基本ディレクトリのパス
 * @param {string} params.url - 対象URL
 * @returns {Object} - MHTMLとスクリーンショットのパス
 */
function generateOutputPaths({ baseDir, url }) {
  const safeFileName = generateSafeFileName(url);
  return {
    mhtmlPath: path.join(baseDir, 'MHTML', `${safeFileName}.mhtml`),
    screenshotPath: path.join(baseDir, 'Screenshots', `${safeFileName}.png`),
  };
}

module.exports = { initializeOutputDirs, generateOutputPaths };
