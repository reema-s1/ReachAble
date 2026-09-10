import fs from 'node:fs';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function writeHtmlReport(summary, outPath) {
  const criterionRows = Object.entries(summary.byCriterion)
    .map(
      ([criterion, { count }]) => `
      <tr>
        <td>${escapeHtml(criterion)}</td>
        <td class="${count === 0 ? 'pass' : 'fail'}">${count === 0 ? 'PASS' : 'FAIL'}</td>
        <td>${count}</td>
      </tr>`
    )
    .join('');

  const pageSections = summary.pages
    .map((page) => {
      if (page.error) {
        return `<section><h2>${escapeHtml(page.url)}</h2><p class="fail">Error: ${escapeHtml(page.error)}</p></section>`;
      }
      if (page.violations.length === 0) {
        return `<section><h2>${escapeHtml(page.url)}</h2><p class="pass">No violations found.</p></section>`;
      }
      const items = page.violations
        .map(
          (v) => `
          <li>
            <p><strong>${escapeHtml(v.criterion)}</strong> — ${escapeHtml(v.message)}</p>
            <code>${escapeHtml(v.selector)}</code>
            <pre>${escapeHtml(v.html)}</pre>
          </li>`
        )
        .join('');
      return `<section><h2>${escapeHtml(page.url)}</h2><ul class="violations">${items}</ul></section>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>a11y-scan report</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 60rem; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; }
  th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #ccc; }
  .pass { color: #1e6b3a; font-weight: 700; }
  .fail { color: #b3261e; font-weight: 700; }
  section { border: 1px solid #ccc; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; }
  code { display: block; margin: 0.25rem 0; }
  pre { background: #f5f5f5; padding: 0.5rem; overflow-x: auto; border-radius: 4px; }
  ul.violations { list-style: none; padding: 0; }
  ul.violations li { border-top: 1px solid #eee; padding: 0.75rem 0; }
</style>
</head>
<body>
  <h1>a11y-scan report</h1>
  <p>Scanned ${summary.pagesScanned} page(s) at ${escapeHtml(summary.scannedAt)}. Total violations: ${summary.totalViolations}.</p>
  <table>
    <thead><tr><th>Criterion</th><th>Status</th><th>Violations</th></tr></thead>
    <tbody>${criterionRows}</tbody>
  </table>
  ${pageSections}
</body>
</html>`;

  fs.writeFileSync(outPath, html);
  return outPath;
}
