// config/loader.js
const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

/**
 * 設定ファイルをロードし、バリデーションを行う関数
 * @returns {Promise<Object>} - 設定オブジェクト
 */
async function loadConfig() {
  const configPath = path.resolve(__dirname, 'config.json');
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);

    const schema = Joi.object({
      paths: Joi.object({
        outputDir: Joi.string().required(),
        logsDir: Joi.string().required(),
        templatesDir: Joi.string().required(),
      }).required(),
      puppeteer: Joi.object({
        viewport: Joi.object({
          width: Joi.number().integer().min(0).required(),
          height: Joi.number().integer().min(0).required(),
        }).required(),
        headless: Joi.boolean().required(),
        args: Joi.array().items(Joi.string()).required(),
      }).required(),
      timestampFormat: Joi.string().required(),
      timezone: Joi.string().required(),
      logging: Joi.object({
        level: Joi.string().valid('debug', 'info', 'warn', 'error').required(),
        file: Joi.string().required(),
      }).required(),
    });

    const { error, value } = schema.validate(config);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return value;
  } catch (error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
}

module.exports = { loadConfig };
