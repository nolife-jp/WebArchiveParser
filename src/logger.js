const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir) {
    this.logFile = path.join(logDir, 'error_log.txt');
    fs.mkdirSync(logDir, { recursive: true });
  }

  logError(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ERROR: ${message}\n`;
    fs.appendFileSync(this.logFile, formattedMessage);
    console.error(formattedMessage);
  }

  logInfo(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`);
  }
}

module.exports = Logger;
