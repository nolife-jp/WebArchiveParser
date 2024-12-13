// src/modules/html_generator.js
const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const { loadConfig } = require('../../config/loader');
const { formatDate } = require('../utils/time_utils');

/**
 * HTMLGenerator クラス
 */
class HTMLGenerator {
  /**
   * HTMLGenerator のコンストラクタ
   * @param {string} outputDir - 出力ディレクトリのパス
   * @param {string} title - HTMLのタイトル
   */
  constructor(outputDir, title = 'Captured Pages') {
    this.outputDir = outputDir;
    this.title = title;
    this.pages = [];
  }

  /**
   * ページ情報を追加
   * @param {Object} pageInfo - ページ情報
   */
  addPage(pageInfo) {
    this.pages.push(pageInfo);
  }

  /**
   * HTMLファイルを保存
   * @param {string} templateDir - テンプレートディレクトリのパス
   */
  async save(templateDir) {
    try {
      const templatePath = path.join(templateDir, 'index.ejs');
      const outputPath = path.join(this.outputDir, 'index.html');

      // テンプレートの存在確認
      await fs.access(templatePath).catch(() => {
        throw new Error(`Template not found: ${templatePath}`);
      });

      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const config = await loadConfig();
      const data = {
        title: this.title,
        date: formatDate(new Date(), config.timestampFormat, config.timezone),
        pages: this.pages,
      };

      const htmlContent = ejs.render(templateContent, data);
      await fs.writeFile(outputPath, htmlContent, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save HTML: ${error.message}`);
    }
  }

  /**
   * URLリストを urlList.txt として保存
   * @param {string[]} urls - 保存するURLリスト
   */
  async saveUrlList(urls) {
    try {
      const filePath = path.join(this.outputDir, 'urlList.txt');
      await fs.writeFile(filePath, urls.join('\n'), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save URL list: ${error.message}`);
    }
  }
}

module.exports = HTMLGenerator;
