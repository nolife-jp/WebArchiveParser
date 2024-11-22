const puppeteer = require('puppeteer');

const capturePage = async (browser, url, outputDirs) => {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    const client = await page.target().createCDPSession();
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });

    const baseFileName = url.replace(/https?:\/\//, '').replace(/[\/:]/g, '_');
    const mhtmlPath = `${outputDirs.mhtml}/${baseFileName}.mhtml`;
    const screenshotPath = `${outputDirs.screenshots}/${baseFileName}.png`;

    require('fs').writeFileSync(mhtmlPath, data);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return { mhtmlPath, screenshotPath, title: await page.title() };
  } finally {
    await page.close();
  }
};

module.exports = { capturePage };
