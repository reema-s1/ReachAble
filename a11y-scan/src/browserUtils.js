// Injected into every crawled page via page.addInitScript(). Defines
// window.__a11yScanUtils so each check's page.evaluate() callback can build
// a readable locator for a violating element without re-declaring helpers.
export function installBrowserUtils() {
  window.__a11yScanUtils = {
    getSelector(el) {
      if (!(el instanceof Element)) return '';
      const parts = [];
      let node = el;
      while (node && node.nodeType === 1 && parts.length < 6) {
        let part = node.tagName.toLowerCase();
        if (node.id) {
          part += `#${node.id}`;
          parts.unshift(part);
          break;
        }
        if (node.classList.length > 0) {
          part += `.${Array.from(node.classList).slice(0, 2).join('.')}`;
        }
        const parent = node.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
          if (siblings.length > 1) {
            part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
          }
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(' > ');
    },
    outerHtmlSnippet(el, maxLen = 140) {
      const html = el.outerHTML || '';
      return html.length > maxLen ? `${html.slice(0, maxLen)}…` : html;
    },
  };
}
