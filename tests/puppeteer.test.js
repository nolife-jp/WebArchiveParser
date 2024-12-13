// tests/puppeteer.test.js
const puppeteer = require('puppeteer');
const { capturePage } = require('../src/modules/puppeteer_utils');
const Logger = require('../src/utils/logger');
const fs = require('fs').promises;
const path = require('path');

jest.mock('puppeteer');

describe('Puppeteer Utils', () => {
  let browserMock;
  let pageMock;
  let logger;

  beforeEach(() => {
    pageMock = {
      goto: jest.fn(),
      title: jest.fn().mockResolvedValue('Test Page'),
      screenshot: jest.fn(),
      close: jest.fn(),
      target: jest.fn().mockReturnValue({
        createCDPSession: jest.fn().mockResolvedValue({
          send: jest.fn().mockResolvedValue({ data: '<mhtml></mhtml>' }),
        }),
      }),
    };

    browserMock = {
      newPage: jest.fn().mockResolvedValue(pageMock),
      close: jest.fn(),
    };

    puppeteer.launch.mockResolvedValue(browserMock);

    logger = new Logger('logs', false, 'Asia/Tokyo');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should capture page successfully', async () => {
    const url = 'https://example.com';
    const outputPaths = {
      mhtmlPath: path.join('output', 'MHTML', 'example.mhtml'),
      screenshotPath: path.join('output', 'Screenshots', 'example.png'),
    };

    // Mock file system write operations
    jest.spyOn(fs, 'writeFile').mockResolvedValue();

    const pageInfo = await capturePage(browserMock, url, outputPaths);

    expect(browserMock.newPage).toHaveBeenCalled();
    expect(pageMock.goto).toHaveBeenCalledWith(url, { waitUntil: 'networkidle2' });
    expect(pageMock.title).toHaveBeenCalled();
    expect(pageMock.screenshot).toHaveBeenCalledWith({ path: outputPaths.screenshotPath, fullPage: true });
    expect(pageInfo).toEqual({
      title: 'Test Page',
      url,
      mhtmlPath: outputPaths.mhtmlPath,
      screenshotPath: outputPaths.screenshotPath,
    });
    expect(pageMock.close).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(outputPaths.mhtmlPath, '<mhtml></mhtml>', 'utf-8');
  });

  test('should handle page navigation error', async () => {
    pageMock.goto.mockRejectedValue(new Error('Navigation failed'));
    const url = 'https://example.com';
    const outputPaths = {
      mhtmlPath: path.join('output', 'MHTML', 'example.mhtml'),
      screenshotPath: path.join('output', 'Screenshots', 'example.png'),
    };

    await expect(capturePage(browserMock, url, outputPaths)).rejects.toThrow(
      'Failed to capture page (https://example.com): Navigation failed'
    );
    expect(pageMock.close).toHaveBeenCalled();
  });

  test('should handle capture error gracefully', async () => {
    pageMock.screenshot.mockRejectedValue(new Error('Screenshot failed'));
    const url = 'https://example.com';
    const outputPaths = {
      mhtmlPath: path.join('output', 'MHTML', 'example.mhtml'),
      screenshotPath: path.join('output', 'Screenshots', 'example.png'),
    };

    await expect(capturePage(browserMock, url, outputPaths)).rejects.toThrow(
      'Failed to capture page (https://example.com): Screenshot failed'
    );
    expect(pageMock.close).toHaveBeenCalled();
  });
});
