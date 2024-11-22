const fs = require('fs');
const path = require('path');

class HTMLGenerator {
  constructor(outputDir, timestamp) {
    this.outputDir = outputDir;
    this.timestamp = timestamp;
    this.pages = [];
  }

  addPage(title, url, mhtmlPath, screenshotPath) {
    this.pages.push({ title, url, mhtmlPath, screenshotPath });
  }

  save() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>取得したページ一覧</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f9; color: #333; }
    h1 { font-size: 28px; text-align: center; margin-bottom: 20px; }
    .card { background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .card h2 { font-size: 18px; margin: 0; color: #007bff; }
    .card p { font-size: 14px; color: #555; }
    .links { margin-top: 10px; }
    .button { display: inline-block; padding: 8px 12px; font-size: 14px; color: #fff; background-color: #007bff; border-radius: 4px; text-decoration: none; margin-right: 5px; }
    .button:hover { background-color: #0056b3; }
  </style>
</head>
<body>
  <h1>取得したページ一覧 - ${this.timestamp}</h1>
  ${this.pages.map(page => `
    <div class="card">
      <h2>${page.title}</h2>
      <p>URL: <a href="${page.url}" target="_blank">${page.url}</a></p>
      <div class="links">
        <a href="MHTML/${path.basename(page.mhtmlPath)}" target="_blank" class="button">MHTMLファイル</a>
        <a href="Screenshots/${path.basename(page.screenshotPath)}" target="_blank" class="button">スクリーンショット</a>
      </div>
    </div>`).join('\n')}
</body>
</html>
    `;

    fs.writeFileSync(path.join(this.outputDir, 'index.html'), htmlContent, 'utf-8');
  }
}

module.exports = HTMLGenerator;
