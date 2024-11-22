const fetcher = require('./src/fetcher');

(async () => {
    // テスト対象のURL（ticketjam の例）
    const testUrl = 'https://www.ticket.co.jp/sys/d/20865.htm?ki=158806&orderable=1&un=100';
    const maxPages = 12;

    try {
        console.log('Testing fetcher for ticketjam...');
        const urls = await fetcher.fetchUrls(testUrl, maxPages);
        console.log('Extracted URLs:', urls);
    } catch (error) {
        console.error('Error during fetcher test:', error);
    }
})();
