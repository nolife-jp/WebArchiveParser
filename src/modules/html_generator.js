const fs = require('fs');
const path = require('path');

/**
 * HTML生成クラス
 */
class HTMLGenerator {
  constructor(outputDir, title = 'Web Archive') {
    this.outputDir = outputDir;
    this.title = title;
    this.pages = [];
  }

  /**
   * ページ情報を追加
   * @param {string} title - ページタイトル
   * @param {string} url - ページURL
   * @param {string} mhtmlPath - MHTMLファイルのパス
   * @param {string} screenshotPath - スクリーンショットのパス
   */
  addPage(title, url, mhtmlPath, screenshotPath) {
    this.pages.push({ title, url, mhtmlPath, screenshotPath });
  }

  /**
   * HTMLを生成して保存
   */
  save() {
    const filePath = path.join(this.outputDir, 'index.html');
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.title}</title>
      </head>
      <body>
        <h1>${this.title}</h1>
        <ul>
          ${this.pages
            .map(
              (page) => `
                <li>
                  <strong>${page.title}</strong><br>
                  <a href="${page.url}" target="_blank">${page.url}</a><br>
                  <a href="${page.mhtmlPath}" target="_blank">MHTML</a> | 
                  <a href="${page.screenshotPath}" target="_blank">Screenshot</a>
                </li>
              `
            )
            .join('')}
        </ul>
      </body>
      </html>
    `;
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

module.exports = HTMLGenerator;
