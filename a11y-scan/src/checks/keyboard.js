// WCAG 2.1 — 2.1.1 Keyboard
// https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
// A click handler bolted onto a non-interactive element (<div>, <span>, ...)
// is invisible to keyboard users unless it also has a tabindex and a
// keyboard event handler.
export const criterion = '2.1.1 Keyboard';

export async function run(page) {
  return page.evaluate(() => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;
    const nativeInteractive = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary', 'audio', 'video']);
    const violations = [];

    document.querySelectorAll('[onclick]').forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (nativeInteractive.has(tag)) return;
      const hasTabIndex = el.hasAttribute('tabindex');
      const hasKeyHandler =
        el.hasAttribute('onkeydown') || el.hasAttribute('onkeyup') || el.hasAttribute('onkeypress');
      if (!hasTabIndex || !hasKeyHandler) {
        violations.push({
          selector: getSelector(el),
          html: outerHtmlSnippet(el),
          message: `<${tag}> has an onclick handler but is missing a tabindex and/or keyboard event handler, so it can't be operated by keyboard.`,
        });
      }
    });

    return violations;
  });
}
