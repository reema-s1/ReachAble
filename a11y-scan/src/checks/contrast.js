// WCAG 2.1 — 1.4.3 Contrast (Minimum)
// https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
// Computes the actual rendered contrast ratio between each text node's color
// and its effective background, per the WCAG relative-luminance formula.
export const criterion = '1.4.3 Contrast (Minimum)';

export async function run(page) {
  return page.evaluate(() => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;

    function parseColor(str) {
      const match = str.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(',').map((p) => parseFloat(p.trim()));
      const [r, g, b, a = 1] = parts;
      return { r, g, b, a };
    }

    function relativeLuminance({ r, g, b }) {
      const channel = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    }

    function contrastRatio(c1, c2) {
      const l1 = relativeLuminance(c1);
      const l2 = relativeLuminance(c2);
      const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
      return (hi + 0.05) / (lo + 0.05);
    }

    function effectiveBackground(el) {
      let node = el;
      while (node) {
        const style = getComputedStyle(node);
        const bg = parseColor(style.backgroundColor);
        if (bg && bg.a > 0) return bg;
        node = node.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    function isLargeText(style) {
      const px = parseFloat(style.fontSize);
      const weight = parseInt(style.fontWeight, 10) || 400;
      return px >= 24 || (px >= 18.66 && weight >= 700);
    }

    const violations = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode(el) {
        const hasOwnText = Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 0
        );
        if (!hasOwnText) return NodeFilter.FILTER_SKIP;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') return NodeFilter.FILTER_SKIP;
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let el = walker.nextNode();
    const seen = new Set();
    while (el) {
      const style = getComputedStyle(el);
      const fg = parseColor(style.color);
      if (fg) {
        const bg = effectiveBackground(el);
        const ratio = contrastRatio(fg, bg);
        const threshold = isLargeText(style) ? 3 : 4.5;
        if (ratio < threshold) {
          const key = getSelector(el);
          if (!seen.has(key)) {
            seen.add(key);
            violations.push({
              selector: key,
              html: outerHtmlSnippet(el),
              message: `Text contrast ratio is ${ratio.toFixed(2)}:1, below the required ${threshold}:1.`,
            });
          }
        }
      }
      el = walker.nextNode();
    }

    return violations;
  });
}
