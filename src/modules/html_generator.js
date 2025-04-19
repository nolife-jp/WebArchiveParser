// src/modules/html_generator.js
const fs   = require('fs').promises;
const path = require('path');

class HTMLGenerator {
  constructor (outputDir, title, hasScreenshot) {
    this.outputDir     = outputDir;
    this.title         = title;
    this.hasScreenshot = hasScreenshot;
    this.pages         = [];             // { title, url, mhtmlPath?, screenshotPath? }
  }

  addPage (pageInfo) {
    this.pages.push(pageInfo);
  }

  /* ---------- index.html を生成 ---------- */
  async save (templatesDir) {
    /* ① テンプレートフォルダーが null/undefined なら デフォルト ../templates を採用 */
    const tplDir = templatesDir
      ? path.resolve(templatesDir)
      : path.resolve(__dirname, '../templates');

    const templatePath = path.join(tplDir, 'template.html');
    let template;
    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch (e) {
      throw new Error(`Failed to read template.html: ${e.message}`);
    }

    const rows = this.pages.map(p => {
      const mhtmlLink = p.mhtmlPath
        ? `<a href="${path.relative(this.outputDir, p.mhtmlPath)}">MHTML</a>`
        : '—';
      const imgTag    = (this.hasScreenshot && p.screenshotPath)
        ? `<img src="${path.relative(this.outputDir, p.screenshotPath)}" loading="lazy" />`
        : '';
      return `
        <tr>
          <td>${imgTag}</td>
          <td><a href="${p.url}">${p.title || p.url}</a></td>
          <td>${mhtmlLink}</td>
        </tr>`;
    }).join('\n');

    const html = template
      .replace('{{TITLE}}', this.title)
      .replace('{{ROWS}}',  rows);

    const outPath = path.join(this.outputDir, 'index.html');
    await fs.writeFile(outPath, html, 'utf-8');
  }

  /* ---------- URL リスト保存 ---------- */
  async saveUrlList (urls) {
    const listPath = path.join(this.outputDir, 'all_urls.txt');
    await fs.writeFile(listPath, urls.join('\n'), 'utf-8');
  }
}

module.exports = HTMLGenerator;
