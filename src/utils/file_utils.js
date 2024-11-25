const fs = require('fs');
const path = require('path');

/**
 * ディレクトリを作成
 * @param {...string} paths - ディレクトリパス
 * @returns {string} - 作成されたディレクトリのパス
 */
const createDir = (...paths) => {
  const fullPath = path.resolve(...paths);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

/**
 * ディレクトリの初期化
 * @param {string} baseDir - 基本ディレクトリ
 * @returns {Object} - 初期化されたディレクトリ情報
 */
const initializeDirectories = (baseDir) => {
  const mhtmlDir = createDir(baseDir, 'MHTML');
  const screenshotsDir = createDir(baseDir, 'Screenshots');
  return { mhtmlDir, screenshotsDir };
};

/**
 * URLリストを保存
 * @param {string} filePath - 保存先のパス
 * @param {string[]} urls - URLの配列
 */
const saveUrlList = (filePath, urls) => {
  fs.writeFileSync(filePath, urls.join('\n'), 'utf-8');
};

module.exports = { createDir, initializeDirectories, saveUrlList };
