// config/loader.js
const fs   = require('fs').promises;
const path = require('path');
const Joi  = require('joi');

/* ────────── Joi スキーマ ────────── */
const schema = Joi.object({
  paths: Joi.object({
    outputDir   : Joi.string().required(),
    logsDir     : Joi.string().required(),
    templatesDir: Joi.string().required(),
  }).required(),

  puppeteer: Joi.object({
    viewport: Joi.object({
      width            : Joi.number().integer().min(320).max(7680).required(),
      height           : Joi.number().integer().min(200).max(4320).required(),
      deviceScaleFactor: Joi.number().integer().min(1).max(4).required(),
    }).required(),

    headless         : Joi.boolean().required(),
    userDataDir      : Joi.string().required(),
    args             : Joi.array().items(Joi.string()).required(),

    restartInterval  : Joi.number().integer().min(1).required(),
    protocolTimeout  : Joi.number().integer().min(1000).required(),

    snapshotRetries  : Joi.number().integer().min(0).default(3),
    navigationRetries: Joi.number().integer().min(0).default(3),   // ← 追加済み
  }).required(),

  timestampFormat: Joi.string().required(),
  timezone       : Joi.string().required(),

  logging: Joi.object({
    level: Joi.string().valid('debug', 'info', 'warn', 'error').required(),
    file : Joi.string().required(),
  }).required(),
});

/* ────────── 設定ファイル読み込み ────────── */
async function loadConfig () {
  /**
   * 優先順
   *   1. CLI オプション   --config=path/to/file.json
   *   2. 環境変数         WEBARCHIVER_CONFIG
   *   3. 既定: config/config.json
   */
  const argCfg = process.argv.find(a => a.startsWith('--config='));
  const envCfg = process.env.WEBARCHIVER_CONFIG;
  const cfgRel = argCfg ? argCfg.split('=')[1]
              : envCfg ? envCfg
              : 'config/config.json';              // ← ★ デフォルトを修正
  const cfgPath = path.resolve(cfgRel);

  const raw    = await fs.readFile(cfgPath, 'utf-8');   // ENOENT 発生箇所
  const config = JSON.parse(raw);

  const { error, value } = schema.validate(config, { abortEarly: false });
  if (error) throw new Error(`Config validation error: ${error.message}`);

  return value;
}

module.exports = { loadConfig };
