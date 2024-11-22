const puppeteer = require('puppeteer');

/**
 * ticketjam.jp から URL を取得する。
 * @param {string} baseUrl - ベースURL。
 * @param {number} maxPages - 最大ページ数。
 * @returns {Promise<Array<string>>} - 取得したURLリスト。
 */
const fetchUrls = async (baseUrl, maxPages) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const extractedUrls = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const pageUrl = `${baseUrl}?page=${pageNum}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const urls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(link => link.href)
                .filter(url => url.includes('/ticket/live_domestic'));
        });
        extractedUrls.push(...urls);
    }

    await browser.close();
    return extractedUrls;
};

module.exports = { fetchUrls };
