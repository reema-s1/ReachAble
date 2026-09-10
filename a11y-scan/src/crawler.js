import { chromium } from 'playwright';
import { installBrowserUtils } from './browserUtils.js';
import { checks } from './checks/index.js';

function normalizeUrl(url) {
  const parsed = new URL(url);
  parsed.hash = '';
  return parsed.toString();
}

async function collectLinks(page, origin) {
  return page.evaluate((originArg) => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.href)
      .filter((href) => {
        try {
          const u = new URL(href);
          return u.origin === originArg && !href.startsWith('mailto:') && !href.startsWith('tel:');
        } catch {
          return false;
        }
      });
  }, origin);
}

export async function scan(startUrl, { maxPages = 5 } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(installBrowserUtils);

  const origin = new URL(startUrl).origin;
  const visited = new Set();
  const queue = [normalizeUrl(startUrl)];
  const pages = [];

  try {
    while (queue.length > 0 && visited.size < maxPages) {
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);

      let response;
      try {
        response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (err) {
        pages.push({ url, error: err.message, violations: [] });
        continue;
      }

      if (!response || !response.ok()) {
        pages.push({ url, error: `HTTP ${response ? response.status() : 'no response'}`, violations: [] });
        continue;
      }

      const pageViolations = [];
      for (const check of checks) {
        const found = await check.run(page);
        found.forEach((violation) => pageViolations.push({ criterion: check.criterion, ...violation }));
      }
      pages.push({ url, violations: pageViolations });

      const links = await collectLinks(page, origin);
      links.forEach((link) => {
        const normalized = normalizeUrl(link);
        if (!visited.has(normalized) && !queue.includes(normalized)) {
          queue.push(normalized);
        }
      });
    }
  } finally {
    await browser.close();
  }

  return pages;
}
