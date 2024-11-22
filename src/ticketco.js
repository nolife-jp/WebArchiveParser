const puppeteer = require('puppeteer');

/**
 * ticket.co.jp から URL を取得する。
 * @param {string} baseUrl - ベースURL。
 * @param {number} maxPages - 最大ページ数。
 * @returns {Promise<Array<string>>} - 取得したURLリスト。
 */
const fetchUrls = async (baseUrl, maxPages) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const extractedUrls = [];

    for (let pageNum = 0; pageNum < maxPages; pageNum++) {
        const pageUrl = `${baseUrl}&pn=${pageNum}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const urls = await page.evaluate(() => {
            const links = [];
            const orderButtons = document.querySelectorAll('li.list-ticket-order form.js-order_form');
            orderButtons.forEach(button => {
                if (!button.querySelector('.btn-no-order')) {
                    const formAction = button.getAttribute('action');
                    const idInput = button.querySelector('input[name="id"]');
                    const eiInput = button.querySelector('input[name="ei"]');
                    if (formAction && idInput && eiInput) {
                        links.push(`${formAction}?id=${idInput.value}&ei=${eiInput.value}`);
                    }
                }
            });
            return links;
        });
        extractedUrls.push(...urls);
    }

    await browser.close();
    return extractedUrls;
};

module.exports = { fetchUrls };
