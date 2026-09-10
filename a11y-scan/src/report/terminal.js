const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

export function printTerminalReport(summary) {
  console.log(`\n${BOLD}a11y-scan report${RESET} — ${summary.pagesScanned} page(s) scanned\n`);

  console.log(`${BOLD}Criterion summary${RESET}`);
  Object.entries(summary.byCriterion).forEach(([criterion, { count }]) => {
    const status = count === 0 ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    console.log(`  [${status}] ${criterion} ${DIM}(${count} violation${count === 1 ? '' : 's'})${RESET}`);
  });

  console.log(`\n${BOLD}Total violations: ${summary.totalViolations}${RESET}\n`);

  summary.pages.forEach((page) => {
    if (page.error) {
      console.log(`${RED}✗ ${page.url} — ${page.error}${RESET}`);
      return;
    }
    if (page.violations.length === 0) {
      console.log(`${GREEN}✓ ${page.url} — no violations${RESET}`);
      return;
    }
    console.log(`${BOLD}${page.url}${RESET} — ${page.violations.length} violation(s)`);
    page.violations.forEach((v) => {
      console.log(`  ${RED}•${RESET} [${v.criterion}] ${v.message}`);
      console.log(`    ${DIM}${v.selector}${RESET}`);
    });
  });
  console.log('');
}
