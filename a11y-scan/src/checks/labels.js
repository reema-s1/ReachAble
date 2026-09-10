// WCAG 2.1 — 1.3.1 Info and Relationships
// https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html
// A form control with no programmatically associated name is unusable with
// a screen reader even if it looks labeled visually (placeholder-only, etc.).
export const criterion = '1.3.1 Info and Relationships';

export async function run(page) {
  return page.evaluate(() => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;
    const violations = [];
    const controls = document.querySelectorAll('input, textarea, select');

    controls.forEach((control) => {
      if (control.type === 'hidden' || control.type === 'submit' || control.type === 'button') {
        return;
      }
      const hasAriaLabel = control.hasAttribute('aria-label') && control.getAttribute('aria-label').trim();
      const hasAriaLabelledBy =
        control.hasAttribute('aria-labelledby') && control.getAttribute('aria-labelledby').trim();
      const hasWrappingLabel = !!control.closest('label');
      const hasForLabel = control.id && !!document.querySelector(`label[for="${CSS.escape(control.id)}"]`);

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasWrappingLabel && !hasForLabel) {
        violations.push({
          selector: getSelector(control),
          html: outerHtmlSnippet(control),
          message: 'Form control has no associated <label>, aria-label, or aria-labelledby.',
        });
      }
    });

    return violations;
  });
}
