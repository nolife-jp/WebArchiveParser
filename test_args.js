// test_args.js
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('screenshot', {
    alias: 's',
    type: 'boolean',
    description: 'Capture screenshots (PNG)',
    default: true, // デフォルトでスクリーンショットを取得
  })
  .option('include-main-url', {
    alias: 'i',
    type: 'boolean',
    description: 'Include the main URL in the archive',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .argv;

console.log('Parsed Arguments:', argv);
