const fs = require("fs");
const path = require("path");

function initializeOutputDirs(baseDir) {
  const mhtmlDir = path.join(baseDir, "MHTML");
  const screenshotsDir = path.join(baseDir, "Screenshots");

  fs.mkdirSync(mhtmlDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  return {
    baseDir: baseDir,
    mhtmlDir: mhtmlDir,
    screenshotsDir: screenshotsDir,
  };
}

function generateOutputPaths({ baseDir, url }) {
  const safeFileName = url.replace(/[^a-zA-Z0-9]/g, "_");
  return {
    mhtmlPath: path.join(baseDir, "MHTML", `${safeFileName}.mhtml`),
    screenshotPath: path.join(baseDir, "Screenshots", `${safeFileName}.png`),
  };
}

module.exports = { initializeOutputDirs, generateOutputPaths };
