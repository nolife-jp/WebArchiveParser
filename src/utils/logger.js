const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

class Logger {
  constructor(logDir, isDebug = false) {
    this.logDir = logDir;
    this.logFile = path.join(logDir, 'webarchiver.log');
    this.isDebug = isDebug;

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message) {
    const timestamp = dayjs().tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    fs.appendFileSync(this.logFile, formattedMessage + '\n');
    if (this.isDebug || level !== 'debug') {
      console.log(formattedMessage);
    }
  }

  info(message) {
    this.log('info', message);
  }

  debug(message) {
    this.log('debug', message);
  }

  warn(message) {
    this.log('warn', message);
  }

  error(message) {
    this.log('error', message);
  }
}

module.exports = Logger;
