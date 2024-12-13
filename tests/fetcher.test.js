// tests/fetcher.test.js
const { getSiteFetcher } = require('../src/modules/fetcher');
const { fetchTicketJamUrls } = require('../src/sites/ticketjam');
const { fetchTicketCoUrls } = require('../src/sites/ticketco');

describe('Fetcher Module', () => {
  test('should return fetchTicketJamUrls for ticketjam.jp', () => {
    const fetcher = getSiteFetcher('https://ticketjam.jp/event/12345');
    expect(fetcher).toBe(fetchTicketJamUrls);
  });

  test('should return fetchTicketCoUrls for ticket.co.jp', () => {
    const fetcher = getSiteFetcher('https://ticket.co.jp/event/12345');
    expect(fetcher).toBe(fetchTicketCoUrls);
  });

  test('should throw error for unsupported site', () => {
    expect(() => {
      getSiteFetcher('https://unsupportedsite.com/event/12345');
    }).toThrow('Unsupported site: unsupportedsite.com');
  });

  test('should throw error for invalid URL', () => {
    expect(() => {
      getSiteFetcher('invalid-url');
    }).toThrow('Invalid URL provided: invalid-url');
  });
});
