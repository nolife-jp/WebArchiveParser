const fs = require('fs');
const path = require('path');

const loadConfig = () => {
  const configPath = path.resolve(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

module.exports = { loadConfig };
