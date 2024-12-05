const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

class HTMLGenerator {
  constructor(outputDir, title = "Captured Pages") {
    this.outputDir = outputDir;
    this.title = title;
    this.pages = [];
  }

  addPage(pageInfo) {
    this.pages.push(pageInfo);
  }

  save() {
    const templatePath = path.join(__dirname, "../templates/index.ejs");
    const outputPath = path.join(this.outputDir, "index.html");

    const data = {
      title: this.title,
      date: new Date().toLocaleString(),
      pages: this.pages,
    };

    const htmlContent = ejs.render(fs.readFileSync(templatePath, "utf-8"), data);
    fs.writeFileSync(outputPath, htmlContent, "utf-8");
  }

  /**
   * URLリストを urlList.txt として保存
   * @param {string[]} urls - 保存するURLリスト
   */
  saveUrlList(urls) {
    const filePath = path.join(this.outputDir, "urlList.txt");
    fs.writeFileSync(filePath, urls.join("\n"), "utf-8");
  }
}

module.exports = HTMLGenerator;
