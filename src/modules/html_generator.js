// src/modules/html_generator.js
const fs   = require('fs').promises;
const path = require('path');
const ejs  = require('ejs');

/**
 * 取得結果一覧（index.html）を生成するクラス
 */
class HTMLGenerator {
  /**
   * @param {string}  outputDir         - 出力ディレクトリ
   * @param {string}  title             - HTML のタイトル
   * @param {boolean} captureScreenshot - スクリーンショットを行うか
   */
  constructor (outputDir, title, captureScreenshot) {
    this.outputDir         = outputDir;
    this.title             = title;
    this.captureScreenshot = captureScreenshot;
    this.pages             = [];   // { title, url, mhtmlPath, screenshotPath? }
  }

  /** ページ情報を追加 */
  addPage (pageInfo) {
    this.pages.push(pageInfo);
  }

  /**
   * index.ejs から index.html を生成
   * @param {string} templatesDir - テンプレートディレクトリ (絶対 / 相対どちらでも可)
   */
  async save (templatesDir) {
    const tplDir = templatesDir
      ? path.resolve(templatesDir)
      : path.resolve(__dirname, '../templates');

    const templatePath = path.join(tplDir, 'index.ejs');

    const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    let renderedHtml;
    try {
      renderedHtml = await ejs.renderFile(
        templatePath,
        {
          title: this.title,
          date:  date,
          captureScreenshot: this.captureScreenshot,
          pages: this.pages.map(p => ({
            title:          p.title,
            url:            p.url,
            mhtmlPath:      p.mhtmlPath  ? path.relative(this.outputDir, p.mhtmlPath)      : null,
            screenshotPath: p.screenshotPath ? path.relative(this.outputDir, p.screenshotPath) : null,
          })),
        },
        { async: true }
      );
    } catch (err) {
      throw new Error(`Failed to generate index.html: ${err.message}`);
    }

    const outPath = path.join(this.outputDir, 'index.html');
    await fs.writeFile(outPath, renderedHtml, 'utf-8');
  }

  /** URL リストを保存 */
  async saveUrlList (urls) {
    const listPath = path.join(this.outputDir, 'urlList.txt');
    await fs.writeFile(listPath, urls.join('\n'), 'utf-8');
  }
}

module.exports = HTMLGenerator;
