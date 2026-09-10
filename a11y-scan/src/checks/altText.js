// WCAG 2.1 — 1.1.1 Non-text Content
// https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
// An <img> with no alt attribute at all gives assistive tech nothing to
// announce (decorative images should use alt="", which this does NOT flag).
export const criterion = '1.1.1 Non-text Content';

export async function run(page) {
  return page.evaluate(() => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;
    const violations = [];
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('alt')) {
        violations.push({
          selector: getSelector(img),
          html: outerHtmlSnippet(img),
          message: 'Image is missing an alt attribute.',
        });
      }
    });
    return violations;
  });
}
