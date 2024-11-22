const fs = require('fs');
const path = require('path');

class HTMLGenerator {
  constructor(outputDir, displayDate) {
    this.outputDir = outputDir;
    this.indexPath = path.join(outputDir, 'index.html');
    this.displayDate = displayDate;
    this.content = `
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
  <h1>取得したページ一覧 - ${displayDate}</h1>
`;
  }

  addPage(title, url, mhtmlPath, screenshotPath) {
    this.content += `
    <div class="card">
      <h2>${title}</h2>
      <p>URL: <a href="${url}" target="_blank">${url}</a></p>
      <div class="links">
        <a href="${path.relative(this.outputDir, mhtmlPath).replace(/\\/g, '/')}" target="_blank" class="button">MHTMLファイル</a>
        <a href="${path.relative(this.outputDir, screenshotPath).replace(/\\/g, '/')}" target="_blank" class="button">スクリーンショット</a>
      </div>
    </div>`;
  }

  save() {
    this.content += `
</body>
</html>
`;
    fs.writeFileSync(this.indexPath, this.content, 'utf-8');
    console.log(`Index page generated at: ${this.indexPath}`);
  }
}

module.exports = HTMLGenerator;
