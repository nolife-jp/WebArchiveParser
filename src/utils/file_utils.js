const path = require("path");

/**
 * URL から安全なファイル名を生成する
 * @param {string} url - 対象 URL
 * @returns {string} - 安全なファイル名
 */
function generateSafeFileName(url) {
    // プロトコル部分（例: "https://"）を除外
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    return withoutProtocol.replace(/[\/:]/g, "_");
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
        screenshotPath: path.join(baseDir, "Screenshots", `${fileName}.png`)
    };
}

module.exports = {
    generateSafeFileName,
    generateOutputPaths
};
