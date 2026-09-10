#!/usr/bin/env node
import path from 'node:path';
import { scan } from './crawler.js';
import { summarize } from './report/summarize.js';
import { printTerminalReport } from './report/terminal.js';
import { writeJsonReport } from './report/json.js';
import { writeHtmlReport } from './report/html.js';

function parseArgs(argv) {
  const args = { url: null, local: false, json: false, html: false, maxPages: 5 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--local') args.local = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--html') args.html = true;
    else if (arg === '--max-pages') args.maxPages = parseInt(argv[++i], 10) || 5;
    else if (arg === '--port') args.port = argv[++i];
    else if (!arg.startsWith('--')) args.url = arg;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.url && !args.local) {
    console.error('Usage: a11y-scan <url> [--json] [--html] [--max-pages N]');
    console.error('       a11y-scan --local [--port 5173] [--json] [--html]');
    process.exit(1);
  }

  const startUrl = args.local ? `http://localhost:${args.port || 5173}/` : args.url;

  console.log(`Crawling ${startUrl} (max ${args.maxPages} page(s))…`);
  const pages = await scan(startUrl, { maxPages: args.maxPages });
  const summary = summarize(pages);

  printTerminalReport(summary);

  if (args.json) {
    const outPath = writeJsonReport(summary, path.resolve('a11y-report.json'));
    console.log(`JSON report written to ${outPath}`);
  }
  if (args.html) {
    const outPath = writeHtmlReport(summary, path.resolve('a11y-report.html'));
    console.log(`HTML report written to ${outPath}`);
  }

  process.exit(summary.totalViolations > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('a11y-scan failed:', err);
  process.exit(1);
});
