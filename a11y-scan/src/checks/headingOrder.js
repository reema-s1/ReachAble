// WCAG 2.1 — 2.4.6 Headings and Labels
// https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html
// Screen reader users navigate by heading level; skipping a level (h1 -> h4)
// breaks the document outline they rely on.
export const criterion = '2.4.6 Headings and Labels';

export async function run(page) {
  return page.evaluate(() => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;
    const violations = [];
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1), 10);
      if (previousLevel > 0 && level - previousLevel > 1) {
        violations.push({
          selector: getSelector(heading),
          html: outerHtmlSnippet(heading),
          message: `Heading level jumps from h${previousLevel} to h${level}, skipping a level.`,
        });
      }
      previousLevel = level;
    });

    return violations;
  });
}
