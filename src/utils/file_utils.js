// src/utils/file_utils.js
const crypto = require('crypto');

/**
 * URL から安全かつ一意なファイル名を生成する
 *   – http / https を除去
 *   – 使用出来ない文字はアンダースコア置換
 *   – page=n クエリを優先して残す
 *   – 必要な場合のみハッシュを付与する
 * @param {string} url
 * @returns {string}
 */
function generateSafeFileName (url) {
  try {
    const u   = new URL(url);
    const qp  = u.searchParams.get('page');           // page=n があれば拾う
    let body  = u.href.replace(/^https?:\/\//, '');   // スキーム除去
    body      = body.replace(/[^a-zA-Z0-9-_]/g, '_'); // NG 文字 → _

    // page=n を強調
    if (qp) body += `_page${qp}`;

    // 文字数上限。ハッシュは衝突防止のため“必要なときだけ”付ける
    const MAX = 150;
    if (body.length > MAX) {
      const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 10);
      body = `${body.slice(0, MAX - 11)}_${hash}`;
    }
    return body;
  } catch {
    const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 10);
    return `invalid_url_${hash}`;
  }
}

module.exports = { generateSafeFileName };
