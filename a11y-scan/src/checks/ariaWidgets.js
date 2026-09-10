// WCAG 2.1 — 4.1.2 Name, Role, Value
// https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html
// A custom widget that declares an ARIA role takes on that role's contract:
// it must expose the state/value attributes assistive tech expects for it.
export const criterion = '4.1.2 Name, Role, Value';

const REQUIRED_ATTRS_BY_ROLE = {
  button: [],
  checkbox: ['aria-checked'],
  radio: ['aria-checked'],
  switch: ['aria-checked'],
  combobox: ['aria-expanded'],
  tab: ['aria-selected'],
  tabpanel: [],
  slider: ['aria-valuenow'],
  dialog: ['aria-label|aria-labelledby'],
  tablist: [],
};

export async function run(page) {
  return page.evaluate((requiredAttrsByRole) => {
    const { getSelector, outerHtmlSnippet } = window.__a11yScanUtils;
    const violations = [];

    document.querySelectorAll('[role]').forEach((el) => {
      const role = el.getAttribute('role');
      const requirements = requiredAttrsByRole[role];
      if (!requirements) return;

      requirements.forEach((requirement) => {
        const options = requirement.split('|');
        const satisfied = options.some((attr) => el.hasAttribute(attr));
        if (!satisfied) {
          violations.push({
            selector: getSelector(el),
            html: outerHtmlSnippet(el),
            message: `Element with role="${role}" is missing required attribute ${options.join(' or ')}.`,
          });
        }
      });

      if (role === 'button') {
        const tag = el.tagName.toLowerCase();
        const isNativelyFocusable = tag === 'button' || tag === 'a' || el.hasAttribute('tabindex');
        if (!isNativelyFocusable) {
          violations.push({
            selector: getSelector(el),
            html: outerHtmlSnippet(el),
            message: 'Element with role="button" is not focusable — add tabindex="0".',
          });
        }
      }
    });

    return violations;
  }, REQUIRED_ATTRS_BY_ROLE);
}
