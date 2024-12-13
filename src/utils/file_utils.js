const path = require('path');
const crypto = require('crypto');

/**
 * URL から安全かつ一意なファイル名を生成する
 * @param {string} url - 対象 URL
 * @returns {string} - 安全かつ一意なファイル名
 */
function generateSafeFileName(url) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const search = parsedUrl.search;

    // ハッシュを生成して一意性を確保
    const hash = crypto
      .createHash('sha256')
      .update(url)
      .digest('hex')
      .substring(0, 10);

    // パスをアンダースコアで結合
    const pathParts = pathname.split('/').filter((part) => part.length > 0);
    const sanitizedPath = pathParts.join('_');

    // 最終的なファイル名
    const safeName = `${sanitizedPath}_${hash}`;

    // ファイル名に使用できない文字を置換
    return safeName.replace(/[^a-zA-Z0-9-_]/g, '_');
  } catch (error) {
    // URLが無効な場合はハッシュのみを使用
    const hash = crypto
      .createHash('sha256')
      .update(url)
      .digest('hex')
      .substring(0, 10);
    return `invalid_url_${hash}`;
  }
}

/**
 * MHTML ファイルのパスを生成する
 * @param {string} baseDir - ベースディレクトリ
 * @param {string} url - 対象 URL
 * @returns {string} - MHTMLファイルのパス
 */
function generateMhtmlPath(baseDir, url) {
  const fileName = generateSafeFileName(url);
  return path.join(baseDir, 'MHTML', `${fileName}.mhtml`);
}

/**
 * スクリーンショット用のファイルパスを生成する
 * @param {string} baseDir - ベースディレクトリ
 * @param {string} url - 対象 URL
 * @returns {string} - スクリーンショットファイルのパス
 */
function generateScreenshotPath(baseDir, url) {
  const fileName = generateSafeFileName(url);
  return path.join(baseDir, 'Screenshots', `${fileName}.png`);
}

module.exports = {
  generateSafeFileName,
  generateMhtmlPath,
  generateScreenshotPath,
};
