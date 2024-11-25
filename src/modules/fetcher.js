const { fetchTicketJamUrls } = require("../sites/ticketjam");
const { fetchTicketCoUrls } = require("../sites/ticketco");

const getSiteFetcher = (targetUrl) => {
  if (targetUrl.includes("ticketjam.jp")) {
    return fetchTicketJamUrls;
  }
  if (targetUrl.includes("ticket.co.jp")) {
    return fetchTicketCoUrls;
  }
  return null;
};

module.exports = { getSiteFetcher };
