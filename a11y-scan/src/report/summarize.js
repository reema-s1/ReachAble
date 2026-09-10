import { checks } from '../checks/index.js';

export function summarize(pages) {
  const allCriteria = checks.map((c) => c.criterion);
  const byCriterion = Object.fromEntries(allCriteria.map((c) => [c, { count: 0 }]));

  let totalViolations = 0;
  pages.forEach((page) => {
    page.violations.forEach((v) => {
      byCriterion[v.criterion].count += 1;
      totalViolations += 1;
    });
  });

  return {
    scannedAt: new Date().toISOString(),
    pagesScanned: pages.length,
    totalViolations,
    byCriterion,
    pages,
  };
}
