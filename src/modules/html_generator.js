// src/modules/html_generator.js
const fs   = require('fs').promises;
const path = require('path');

class HTMLGenerator {
  constructor (outputDir, title, hasScreenshot, templateFile = 'index_template.html') {
    this.outputDir     = outputDir;
    this.title         = title;
    this.hasScreenshot = hasScreenshot;
    this.templateFile  = templateFile;      // ← ★ デフォルトを index_template.html
    this.pages         = [];
  }

  addPage (pageInfo) {
    this.pages.push(pageInfo);
  }

  async save (templatesDir) {
    const tplDir = templatesDir
      ? path.resolve(templatesDir)
      : path.resolve(__dirname, '../templates');

    const templatePath = path.join(tplDir, this.templateFile);  // ← ★

    let template;
    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch (e) {
      throw new Error(`Failed to read ${path.basename(templatePath)}: ${e.message}`);
    }

    const rows = this.pages.map(p => {
      const mhtmlLink = p.mhtmlPath
        ? `<a href="${path.relative(this.outputDir, p.mhtmlPath)}">MHTML</a>`
        : '—';
      const imgTag = (this.hasScreenshot && p.screenshotPath)
        ? `<img src="${path.relative(this.outputDir, p.screenshotPath)}" loading="lazy" />`
        : '';
      return `<tr><td>${imgTag}</td><td><a href="${p.url}">${p.title || p.url}</a></td><td>${mhtmlLink}</td></tr>`;
    }).join('\n');

    const html = template
      .replace('{{TITLE}}', this.title)
      .replace('{{ROWS}}',  rows);

    await fs.writeFile(path.join(this.outputDir, 'index.html'), html, 'utf-8');
  }

  async saveUrlList (urls) {
    await fs.writeFile(
      path.join(this.outputDir, 'all_urls.txt'),
      urls.join('\n'),
      'utf-8'
    );
  }
}

module.exports = HTMLGenerator;
