const fs = require('fs');
const path = require('path');

/**
 * 指定されたディレクトリを作成
 * @param {...string} paths - 作成するディレクトリのパス
 * @returns {string} - 作成したディレクトリのフルパス
 */
const createDir = (...paths) => {
  const fullPath = path.resolve(...paths);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

/**
 * URLリストファイルを読み込む
 * @param {string} filePath - URLリストファイルのパス
 * @returns {string[]} - URLの配列
 */
const readUrlList = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`URL list file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(url => url && url.startsWith('http'));
};

/**
 * ディレクトリの初期化
 * @param {string} baseDir - ベースディレクトリ
 * @returns {Object} - 初期化されたディレクトリ情報
 */
const initializeDirectories = (baseDir) => {
  const mhtmlDir = createDir(baseDir, 'MHTML');
  const screenshotsDir = createDir(baseDir, 'Screenshots');
  return { mhtmlDir, screenshotsDir };
};

/**
 * URLリストを保存
 * @param {string} filePath - 保存先ファイルパス
 * @param {string[]} urls - 保存するURLの配列
 */
const saveUrlList = (filePath, urls) => {
  const content = urls.join('\n');
  fs.writeFileSync(filePath, content, 'utf-8');
};

module.exports = { 
  createDir, 
  readUrlList, 
  initializeDirectories, 
  saveUrlList 
};
