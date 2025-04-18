// src/modules/output_manager.js
const fs = require('fs').promises;
const path = require('path');
const { generateSafeFileName } = require('../utils/file_utils'); // 追加

/**
 * 出力ディレクトリを初期化する関数
 * @param {string} outputDir - 基本出力ディレクトリのパス
 * @param {boolean} captureScreenshot - スクリーンショットをキャプチャするかどうか
 * @returns {Object} - MHTMLディレクトリと、必要ならScreenshotsディレクトリのパス
 */
async function initializeOutputDirs(outputDir, captureScreenshot) {
  const mhtmlDir = path.join(outputDir, 'MHTML');
  await fs.mkdir(mhtmlDir, { recursive: true });

  let screenshotsDir = null;
  if (captureScreenshot) {
    screenshotsDir = path.join(outputDir, 'Screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
  }

  return { mhtmlDir, screenshotsDir };
}

/**
 * 出力パスを生成する関数
 * @param {Object} params - パラメータオブジェクト
 * @param {string} params.baseDir - 基本出力ディレクトリ
 * @param {string} params.url - 対象URL
 * @param {boolean} params.captureScreenshot - スクリーンショットをキャプチャするかどうか
 * @returns {Object} - MHTMLパスと、必要ならScreenshotパス
 */
function generateOutputPaths({ baseDir, url, captureScreenshot }) {
  // URLからプロトコルを除去し、ファイル名を生成
  const sanitizeUrl = generateSafeFileName(url); // generateSafeFileName を使用
  const mhtmlPath = path.join(baseDir, 'MHTML', `${sanitizeUrl}.mhtml`);
  let screenshotPath = null;

  if (captureScreenshot) {
    screenshotPath = path.join(baseDir, 'Screenshots', `${sanitizeUrl}.png`);
  }

  return { mhtmlPath, screenshotPath };
}

module.exports = { initializeOutputDirs, generateOutputPaths };
