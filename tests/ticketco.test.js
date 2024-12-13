// tests/ticketco.test.js
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const Logger = require('../src/utils/logger');
const { fetchTicketCoUrls } = require('../src/sites/ticketco');

describe('TicketCo Fetcher', () => {
  let mock;
  let logger;

  beforeAll(() => {
    mock = new MockAdapter(axios);
    logger = new Logger('logs', false, 'Asia/Tokyo');
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  test('should fetch URLs successfully', async () => {
    const baseUrl = 'https://ticket.co.jp/event/12345';
    const pageUrl = baseUrl;

    const htmlContent = `
      <form class="js-order_form" action="/ticket/submit">
        <input name="param1" value="value1">
        <input name="param2" value="value2">
      </form>
      <div class="pager-next">
        <a href="/event/12345?page=2">Next</a>
      </div>
    `;

    mock.onGet(pageUrl).reply(200, htmlContent);
    mock.onGet('https://ticket.co.jp/event/12345?page=2').reply(200, '');

    const urls = await fetchTicketCoUrls(baseUrl, 2, logger);
    expect(urls).toContain('https://ticket.co.jp/ticket/submit?param1=value1&param2=value2');
  });

  test('should handle invalid form action gracefully', async () => {
    const baseUrl = 'https://ticket.co.jp/event/12345';
    const pageUrl = baseUrl;

    const htmlContent = `
      <form class="js-order_form" action="ht!tp://invalid-url">
        <input name="param1" value="value1">
      </form>
    `;

    mock.onGet(pageUrl).reply(200, htmlContent);

    const urls = await fetchTicketCoUrls(baseUrl, 1, logger);
    expect(urls).toEqual([]);
  });

  test('should handle network error gracefully', async () => {
    const baseUrl = 'https://ticket.co.jp/event/12345';
    const pageUrl = baseUrl;

    mock.onGet(pageUrl).networkError();

    const urls = await fetchTicketCoUrls(baseUrl, 1, logger);
    expect(urls).toEqual([]);
  });
});
