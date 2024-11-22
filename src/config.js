const fs = require('fs');
const path = require('path');
const ini = require('ini');

const loadConfig = () => {
  const configPath = path.join(__dirname, '..', 'config', 'config.ini');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  return ini.parse(fs.readFileSync(configPath, 'utf-8'));
};

module.exports = { loadConfig };
