// config/loader.js
const fs   = require('fs').promises;
const path = require('path');
const Joi  = require('joi');

/* ---------------- Joi スキーマ ---------------- */
const schema = Joi.object({
  paths: Joi.object({
    outputDir:    Joi.string().required(),
    logsDir:      Joi.string().required(),
    templatesDir: Joi.string().required(),
  }).required(),

  puppeteer: Joi.object({
    viewport: Joi.object({
      width:             Joi.number().integer().positive().required(),
      height:            Joi.number().integer().positive().required(),
      deviceScaleFactor: Joi.number().positive().default(1),
    }).required(),

    headless:        Joi.boolean().default(true),
    userDataDir:     Joi.string().optional(),
    args:            Joi.array().items(Joi.string()).default([]),
    restartInterval: Joi.number().integer().positive().default(20),   // ★追加
  }).required(),

  timestampFormat: Joi.string().default('YYYY-MM-DD_HHmm'),
  timezone:        Joi.string().default('UTC'),

  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    file:  Joi.string().default('webarchiver.log'),
  }).required(),
});

/* ---------------- ローダ ---------------- */
async function loadConfig () {
  const configPath = path.resolve(__dirname, 'config.json');
  let raw;
  try   { raw = await fs.readFile(configPath, 'utf-8'); }
  catch (e) { throw new Error(`Cannot read ${configPath}: ${e.message}`); }

  let parsed;
  try   { parsed = JSON.parse(raw); }
  catch (e) { throw new Error(`Invalid JSON in ${configPath}: ${e.message}`); }

  const { error, value } = schema.validate(parsed, { abortEarly: false });
  if (error) throw new Error(`Config validation error: ${error.message}`);

  return value;
}

module.exports = { loadConfig };
