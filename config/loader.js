const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

const configSchema = Joi.object({
  paths: Joi.object({
    outputDir: Joi.string().required(),
    logsDir: Joi.string().required(),
    templatesDir: Joi.string().required(),
  }).required(),
  puppeteer: Joi.object({
    viewport: Joi.object({
      width: Joi.number().integer().min(100).required(),
      height: Joi.number().integer().min(100).required(),
    }).required(),
    headless: Joi.boolean().required(),
    args: Joi.array().items(Joi.string()).optional(),
  }).required(),
  timestampFormat: Joi.string().required(),
  timezone: Joi.string().required(),
  logging: Joi.object({
    level: Joi.string().valid('debug', 'info', 'warn', 'error').required(),
    file: Joi.string().required(),
  }).required(),
});

let cachedConfig = null;

/**
 * 設定ファイルをロードし、バリデーションを行う
 * @returns {Promise<Object>} - ロードされた設定オブジェクト
 */
const loadConfig = async () => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.resolve(__dirname, 'config.json');

  try {
    const configExists = await fs
      .access(configPath)
      .then(() => true)
      .catch(() => false);
    if (!configExists) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const { error, value } = configSchema.validate(config, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(
        `Config validation error: ${error.details.map((d) => d.message).join(', ')}`
      );
    }

    cachedConfig = value;
    return cachedConfig;
  } catch (error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
};

module.exports = { loadConfig };
