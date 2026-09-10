// WCAG 2.1 — 2.4.4 Link Purpose (In Context)
// https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html
// "Click here" / "read more" links are meaningless when a screen reader
// user pulls up a list of links out of context.
export const criterion = '2.4.4 Link Purpose';

const GENERIC_PHRASES = ['click here', 'read more', 'here', 'more', 'link', 'this link', 'learn more'];

export async function run(page) {
  return page.evaluate((genericPhrases) => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;
    const violations = [];

    document.querySelectorAll('a[href]').forEach((link) => {
      const ariaLabel = link.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) return;
      const text = link.textContent.trim().toLowerCase();
      if (genericPhrases.includes(text)) {
        violations.push({
          selector: getSelector(link),
          html: outerHtmlSnippet(link),
          message: `Link text "${link.textContent.trim()}" doesn't describe its destination and has no aria-label.`,
        });
      }
    });

    return violations;
  }, GENERIC_PHRASES);
}
