// src/utils/file_utils.js
const path = require('path');
const crypto = require('crypto');

/**
 * URL から安全かつ指定形式のファイル名を生成する
 * @param {string} url - 対象 URL
 * @returns {string} - 安全なファイル名
 */
function generateSafeFileName(url) {
  try {
    // URLオブジェクトを作成
    const parsedUrl = new URL(url);
    
    // スキーム（http://, https://）を除去
    let sanitized = parsedUrl.href.replace(/^https?:\/\//, '');
    
    // ファイル名に使用できない文字をアンダースコアに置換（ハイフンとアンダースコアは保持）
    sanitized = sanitized.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    // 長すぎるファイル名を避けるために、一定の長さを超える場合はハッシュを追加
    if (sanitized.length > 100) {
      const hash = crypto.createHash('sha256').update(url).digest('hex').substring(0, 10);
      sanitized = `${sanitized.substring(0, 90)}_${hash}`;
    }
    
    return sanitized;
  } catch (error) {
    // URLが無効な場合はハッシュのみを使用
    const hash = crypto.createHash('sha256').update(url).digest('hex').substring(0, 10);
    return `invalid_url_${hash}`;
  }
}

module.exports = { generateSafeFileName };
