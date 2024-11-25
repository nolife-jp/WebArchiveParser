const fs = require("fs");
const path = require("path");

const initializeOutputDirs = (baseDir) => {
  const mhtmlDir = path.join(baseDir, "MHTML");
  const screenshotsDir = path.join(baseDir, "Screenshots");

  [baseDir, mhtmlDir, screenshotsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  return { mhtmlDir, screenshotsDir };
};

module.exports = { initializeOutputDirs };
