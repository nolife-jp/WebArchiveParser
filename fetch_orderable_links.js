const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

// 設定ファイルの読み込み
const config = ini.parse(fs.readFileSync('C:\\repos\\URLCollector\\setting.ini', 'utf-8'));
const baseUrl = config.settings.url;
const maxPages = parseInt(config.settings.max_pages, 10) || 1;
const isDiffMode = process.argv.includes('--diff'); // 差分モードかを確認

// 日付形式をフォーマットする関数
const getFormattedDate = () => {
  const date = new Date();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const YY = String(date.getFullYear()).slice(-2);
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const MM = String(date.getMinutes()).padStart(2, '0');
  return `${mm}-${YY}-${dd}_${HH}${MM}`;
};

(async () => {
  const timestampedDir = path.join('C:\\repos\\URLCollector\\list', getFormattedDate());
  fs.mkdirSync(timestampedDir, { recursive: true });
  const outputFile = path.join(timestampedDir, 'urlList.txt');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const allOrderableLinks = [];

  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    const url = `${baseUrl}&pn=${pageNum}`;
    console.log(`Processing: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 注文可能リンクを抽出
    const orderableLinks = await page.evaluate(() => {
      const links = [];
      const orderButtons = document.querySelectorAll('li.list-ticket-order form.js-order_form');
      orderButtons.forEach(button => {
        if (!button.querySelector('.btn-no-order')) {  // "取引中"でないもの
          const formAction = button.getAttribute('action');
          const idInput = button.querySelector('input[name="id"]');
          const eiInput = button.querySelector('input[name="ei"]');
          
          if (formAction && idInput && eiInput) {
            const id = idInput.value;
            const ei = eiInput.value;
            links.push(`${formAction}?id=${id}&ei=${ei}`);
          }
        }
      });
      return links;
    });

    allOrderableLinks.push(...orderableLinks);
  }

  // 差分取得モードであれば前回のファイルと比較
  if (isDiffMode) {
    // 保存ディレクトリから最新のリストファイルを取得
    const previousFiles = fs.readdirSync('C:\\repos\\URLCollector\\list')
      .filter(file => fs.statSync(path.join('C:\\repos\\URLCollector\\list', file)).isDirectory())
      .map(dir => path.join('C:\\repos\\URLCollector\\list', dir, 'urlList.txt'))
      .filter(fs.existsSync)
      .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime); // 最新ファイルを取得

    if (previousFiles.length > 0) {
      const previousFile = previousFiles[0];
      const previousLinks = fs.readFileSync(previousFile, 'utf-8').split('\n').filter(Boolean);
      const newLinks = allOrderableLinks.filter(link => !previousLinks.includes(link));
      fs.writeFileSync(outputFile, newLinks.join('\n'));
      console.log(`Difference fetch complete. New URLs saved to ${outputFile}`);
    } else {
      console.log("No previous file found. Saving current fetch as new list.");
      fs.writeFileSync(outputFile, allOrderableLinks.join('\n'));
    }
  } else {
    // 新規取得モードではすべてのURLを保存
    fs.writeFileSync(outputFile, allOrderableLinks.join('\n'));
  }

  console.log(`URL list saved to ${outputFile}`);
  await browser.close();
})();
