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
}

module.exports = HTMLGenerator;
