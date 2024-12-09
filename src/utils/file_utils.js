const path = require("path");

/**
 * URL から安全なファイル名を生成する
 * @param {string} url - 対象 URL
 * @returns {string} - 安全なファイル名
 */
function generateSafeFileName(url) {
    // プロトコル部分（例: "https://"）を除外
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    // ドメイン部分とパス部分を分離
    const [domain, ...pathParts] = withoutProtocol.split('/');
    // ドメインとパスを結合して安全なファイル名を生成
    const safeName = [domain, ...pathParts].join('_');
    return safeName
        .replace(/[\/:]/g, "_") // パス区切り文字を置換
        .replace(/[?&=]/g, "_"); // クエリ文字を置換
}

/**
 * MHTML ファイルとスクリーンショット用のファイルパスを生成する
 * @param {string} baseDir - ベースディレクトリ
 * @param {string} url - 対象 URL
 * @returns {{ mhtmlPath: string, screenshotPath: string }}
 */
function generateOutputPaths(baseDir, url) {
    const fileName = generateSafeFileName(url);
    return {
        mhtmlPath: path.join(baseDir, "MHTML", `${fileName}.mhtml`),
        screenshotPath: path.join(baseDir, "Screenshots", `${fileName}.png`),
    };
}

module.exports = {
    generateSafeFileName,
    generateOutputPaths,
};
