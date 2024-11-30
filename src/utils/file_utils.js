const path = require("path");

/**
 * URL から安全なファイル名を生成
 * @param {string} url - 対象の URL
 * @returns {string} - 安全なファイル名
 */
function generateSafeFileName(url) {
  if (!url) {
    throw new Error("URL is required to generate a file name.");
  }
  return url.replace(/[^a-zA-Z0-9]/g, "_");
}

/**
 * MHTML とスクリーンショットの保存パスを生成
 * @param {Object} options - パス生成用のオプション
 * @param {string} options.baseDir - ベースディレクトリ
 * @param {string} options.fileName - ファイル名
 * @returns {Object} - 保存パス
 */
function generateOutputPaths({ baseDir, fileName }) {
  if (!baseDir || typeof baseDir !== "string") {
    console.error(`generateOutputPaths received invalid parameters: baseDir=${baseDir}, fileName=${fileName}`);
    throw new Error("Invalid baseDir parameter");
  }
  if (!fileName || typeof fileName !== "string") {
    console.error(`generateOutputPaths received invalid parameters: baseDir=${baseDir}, fileName=${fileName}`);
    throw new Error("Invalid fileName parameter");
  }

  return {
    screenshotPath: path.join(baseDir, "Screenshots", `${fileName}.png`),
    mhtmlPath: path.join(baseDir, "MHTML", `${fileName}.mhtml`),
  };
}

module.exports = { generateSafeFileName, generateOutputPaths };
