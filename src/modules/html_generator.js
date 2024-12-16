// src/modules/html_generator.js
const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');

/**
 * HTML生成クラス
 */
class HTMLGenerator {
  /**
   * コンストラクタ
   * @param {string} outputDir - 出力ディレクトリ
   * @param {string} title - HTMLのタイトル
   * @param {boolean} captureScreenshot - スクリーンショットを表示するかどうか
   */
  constructor(outputDir, title, captureScreenshot) {
    this.outputDir = outputDir;
    this.title = title;
    this.captureScreenshot = captureScreenshot;
    this.pages = [];
  }

  /**
   * ページ情報を追加する関数
   * @param {object} pageInfo - ページ情報
   */
  addPage(pageInfo) {
    this.pages.push(pageInfo);
  }

  /**
   * index.ejs を元に index.html を保存する関数
   * @param {string} templatesDir - テンプレートディレクトリ
   */
  async save(templatesDir) {
    const templatePath = path.join(templatesDir, 'index.ejs');
    try {
      const date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
      const renderedHtml = await ejs.renderFile(templatePath, {
        title: this.title,
        date: date,
        pages: this.pages.map(page => ({
          title: page.title,
          url: page.url,
          mhtmlPath: path.relative(this.outputDir, page.mhtmlPath),
          screenshotPath: page.screenshotPath ? path.relative(this.outputDir, page.screenshotPath) : null,
        })),
      }, { async: true });

      const indexPath = path.join(this.outputDir, 'index.html');
      await fs.writeFile(indexPath, renderedHtml, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to generate index.html: ${error.message}`);
    }
  }

  /**
   * URLリストを保存する関数
   * @param {string[]} urls - URLの配列
   */
  async saveUrlList(urls) {
    const urlListPath = path.join(this.outputDir, 'urlList.txt');
    const content = urls.join('\n');
    try {
      await fs.writeFile(urlListPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write urlList.txt: ${error.message}`);
    }
  }
}

module.exports = HTMLGenerator;
