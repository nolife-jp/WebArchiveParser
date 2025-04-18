const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const baseUrl = 'https://ticketjam.jp/tickets/snow-man/event_groups/197980';
  let currentPage = 1;
  let maxPage = Infinity; // 初期値として無限大を設定
  const extractedUrls = [];

  while (currentPage <= maxPage) {
    console.log(`Processing page: ${currentPage}`);
    const pageUrl = `${baseUrl}?page=${currentPage}`;
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // 指定URLを抽出
    const pageUrls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .map((link) => link.href)
        .filter((url) => url.includes('/ticket/live_domestic')); // 条件に合うURLを抽出
    });
    extractedUrls.push(...pageUrls);

    // 最終ページを判定
    const isLastPage = await page.evaluate(() => {
      const nextPage = document.querySelector('a[rel="next"]');
      return !nextPage; // 次のページが無ければ最終ページ
    });

    if (isLastPage) {
      maxPage = currentPage; // 最終ページに到達
    }
    currentPage++;
  }

  console.log('All Extracted URLs:', extractedUrls);

  await browser.close();
})();
