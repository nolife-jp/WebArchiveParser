// tests/ticketjam.test.js
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const Logger = require('../src/utils/logger');
const { fetchTicketJamUrls } = require('../src/sites/ticketjam');

describe('TicketJam Fetcher', () => {
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
    const baseUrl = 'https://ticketjam.jp/ticket/live_domestic';
    const pageUrl = `${baseUrl}?page=1`;

    const htmlContent = `
      <div class="eventlist__item">
        <a class="eventlist__wrap" href="/ticket/live_domestic/event1"></a>
      </div>
      <div class="eventlist__item">
        <a class="eventlist__wrap" href="/ticket/live_domestic/event2"></a>
      </div>
    `;

    mock.onGet(pageUrl).reply(200, htmlContent);
    mock.onGet(`${baseUrl}?page=2`).reply(200, '');

    const urls = await fetchTicketJamUrls(baseUrl, 2, logger);
    expect(urls).toContain('https://ticketjam.jp/ticket/live_domestic/event1');
    expect(urls).toContain('https://ticketjam.jp/ticket/live_domestic/event2');
  });

  test('should handle no events found gracefully', async () => {
    const baseUrl = 'https://ticketjam.jp/ticket/live_domestic';
    const pageUrl = `${baseUrl}?page=1`;

    const htmlContent = `
      <div class="eventlist__item">
        <!-- No events -->
      </div>
    `;

    mock.onGet(pageUrl).reply(200, htmlContent);

    const urls = await fetchTicketJamUrls(baseUrl, 1, logger);
    expect(urls).toEqual([]);
  });

  test('should handle network error gracefully', async () => {
    const baseUrl = 'https://ticketjam.jp/ticket/live_domestic';
    const pageUrl = `${baseUrl}?page=1`;

    mock.onGet(pageUrl).networkError();

    const urls = await fetchTicketJamUrls(baseUrl, 1, logger);
    expect(urls).toEqual([]);
  });
});
