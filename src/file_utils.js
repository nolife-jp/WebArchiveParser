const fs = require('fs');
const path = require('path');

const createDir = (baseDir, ...subDirs) => {
  const fullPath = path.join(baseDir, ...subDirs);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const readUrlList = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`URL list file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(url => url && url.startsWith('http'));
};

module.exports = { createDir, readUrlList };
