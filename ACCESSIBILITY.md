# ACCESSIBILITY.md

A guide to the accessibility patterns used in AccessiBoard, written for
whoever picks up this codebase next. Every pattern below links to the WAI-ARIA
Authoring Practices Guide (APG) page it follows and explains *why* it's built
the way it is, not just what the code does.

Target: WCAG 2.1 Level AA.

---

## 1. Global structure

### Skip link
[`SkipLink.jsx`](client/src/components/SkipLink.jsx) is the first element in
the DOM on every page. It's visually hidden until focused (`.skip-link` in
[app.css](client/src/styles/app.css)), then jumps to `#main-content`. Without
it, a keyboard user has to tab through the entire header/nav on every single
page before reaching content — this is a WCAG 2.4.1 (Bypass Blocks)
requirement, not a nicety.

### Landmarks
[`Layout.jsx`](client/src/components/Layout.jsx) always renders `<header>`,
`<nav aria-label="Primary">`, `<main id="main-content">`, and `<footer>` —
never a `<div>` standing in for one of these. Screen reader users navigate by
landmark region (NVDA/VoiceOver both have a landmarks list), so `<div
class="header">` is invisible to that navigation mode where `<header>` is not.

### Focus on route change (the classic SPA bug)
Client-side routing doesn't reload the page, so without help, focus silently
stays wherever it was — usually on the nav link that was just clicked — while
the *visible* content changes underneath it. A screen reader user gets no
signal that navigation happened at all.

[`Layout.jsx`](client/src/components/Layout.jsx) fixes this: on every route
change (except opening a modal — see below), it finds the new page's `<h1>`
and moves focus there, adding `tabindex="-1"` if needed so a heading (not
normally focusable) can receive focus programmatically. This means every page
in this app needs exactly one `<h1>`, and it needs to describe the page.

### Visible focus indicator
One global `:focus-visible` style in [theme.css](client/src/styles/theme.css)
— a 3px outline in the accent color with a 2px offset — applied everywhere,
never overridden with `outline: none`. WCAG 2.4.7.

---

## 2. Color & contrast (including dark mode)

Every color pair in [theme.css](client/src/styles/theme.css) was checked
against the WCAG relative-luminance contrast formula *before* being committed
— not eyeballed. Body text sits at 9–17:1, the accent color used for links and
button text at 7.3–8.3:1 (both light and dark theme), and UI-component
outlines (borders, focus rings) clear the 3:1 threshold for non-text contrast.
The `a11y-scan` contrast check (1.4.3) re-verifies this at runtime by reading
actual computed styles, in both themes — see [AUDIT_LOG.md](AUDIT_LOG.md).

Dark mode is a first-class theme, not an inverted filter: it has its own
token values in `[data-theme='dark']`, chosen and verified independently
rather than assumed to inherit the light theme's contrast margins.

---

## 3. Component patterns

### Dialog (Modal) — [Modal.jsx](client/src/components/Modal.jsx)
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

Used for the job detail overlay (opened from the listings grid) and can be
reused for any confirm/alert dialog.

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing at the
  dialog's own heading — a screen reader announces the dialog's name and
  scope the instant it opens.
- **Focus trap:** on open, focus moves to the first focusable element inside
  the dialog; `Tab`/`Shift+Tab` are intercepted so focus cycles within the
  dialog instead of escaping into page content behind it. See the AUDIT_LOG
  entry about why this trap must not filter elements by `offsetParent` — that
  property is `null` for *any* descendant of a `position: fixed` ancestor,
  in every browser, which describes this dialog's entire contents.
- **Escape closes it**, and closing (by any means) returns focus to whatever
  element opened the dialog — never to `document.body`, which would strand a
  keyboard user back at the top of the page.
- The job detail route (`/jobs/:id`) renders as this same content either
  inside a `Modal` (when reached by clicking a job card, via React Router's
  background-location state) or as a plain full page (when the URL is loaded
  directly) — so the deep link and the "opens as a dialog" requirement are
  the same route, not two implementations to keep in sync.

### Tabs — [Tabs.jsx](client/src/components/Tabs.jsx)
APG: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

Used on the admin dashboard (Active / Drafts / Archived).

- `role="tablist"` on the container, `role="tab"` with `aria-selected` on
  each button, `role="tabpanel"` with `aria-labelledby` on the content.
- Only the active tab is in the natural tab order (`tabindex="0"`); the rest
  are `tabindex="-1"` and reachable via **arrow keys** (`Home`/`End` too) —
  this is the APG's "manual activation" tab pattern, matching how every
  native OS tab control behaves.

### Combobox — [Combobox.jsx](client/src/components/Combobox.jsx)
APG: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

Used for job category selection on the admin job form — deliberately *not* a
native `<select>` dressed up, so it demonstrates the full pattern.

- `role="combobox"` on the text input with `aria-expanded`, `aria-controls`
  (pointing at the listbox), and `aria-autocomplete="list"`.
- `aria-activedescendant` tracks the highlighted option *without moving DOM
  focus off the input* — this is what lets a screen reader announce "Design,
  2 of 3" while the user keeps typing.
- Options are filtered live as the user types; `ArrowDown`/`ArrowUp` move the
  active option, `Enter` commits it, `Escape` closes the list.

### Sortable data table — [DataTable.jsx](client/src/components/DataTable.jsx)
APG table guidance: https://www.w3.org/WAI/ARIA/apg/patterns/table/

Used for the admin postings table.

- `<caption>` names the table; every column header is a real `<th
  scope="col">`, never a styled `<td>`.
- `aria-sort="ascending" | "descending" | "none"` on the currently-relevant
  `<th>` — this is what lets a screen reader announce the sort state when
  navigating into the table, without needing to hear every column.
- Sort is triggered by a `<button>` inside the header cell (so it's reachable
  and operable by keyboard on its own), and a redundant visually-hidden
  `aria-live="polite"` region announces "Sorted by Company, ascending" for
  users who aren't currently focused inside the table when they trigger a
  sort from elsewhere.

### Form validation — [ApplyPage.jsx](client/src/pages/ApplyPage.jsx), [AdminJobFormPage.jsx](client/src/pages/AdminJobFormPage.jsx)
APG forms guidance: https://www.w3.org/WAI/ARIA/apg/patterns/

- Every input has a real `<label htmlFor>` — never placeholder-only labeling.
- On blur (and on every change after the first blur), a field's error message
  renders in a `<p>` with a stable `id`; the input's `aria-describedby` points
  at that `id` and `aria-invalid="true"` is set. A screen reader announces the
  invalid state and reads the associated error text together with the field
  the moment it receives focus — not as a disconnected message elsewhere on
  the page.
- Errors are real-time but not aggressive: they appear on blur/change, not on
  every keystroke before the user has finished typing, so a screen reader
  isn't interrupted mid-input.

### Checkbox / radio groups — [CheckboxGroup.jsx](client/src/components/CheckboxGroup.jsx)
Every group is a real `<fieldset>` with a `<legend>` — this is what gives a
screen reader the group's purpose ("Role type") before it announces each
option, instead of reading three unlabeled checkboxes with no shared context.
Native `<input type="checkbox">`/`<input type="radio">` are used throughout
rather than styled `<div>`s, so keyboard operability (Space/Arrow keys) is
free and doesn't need to be reimplemented.

### Live regions
Two `aria-live="polite"` regions exist for different reasons:
- **Search results count** ([JobListingsPage.jsx](client/src/pages/JobListingsPage.jsx)):
  announces "N results found" as filters change, so a screen reader user
  filtering the list hears the effect of their action without having to
  re-navigate to the results.
- **Sort announcement** ([AdminDashboardPage.jsx](client/src/pages/AdminDashboardPage.jsx)):
  backs up the `aria-sort` attribute change with an explicit announcement.

Both are `polite` (not `assertive`) — they wait for the user's current screen
reader output to finish rather than interrupting it, since neither is
time-critical.

---

## 4. Images & non-text content
Every `<img>` in the app carries an explicit `alt`. Decorative images (none
currently in the app, but the pattern to follow if one is added) use
`alt=""` so screen readers skip them — `a11y-scan`'s 1.1.1 check only flags a
*missing* `alt` attribute, which is the actual failure mode, not `alt=""`.

## 5. Verifying changes
Before merging anything that touches markup:
1. `cd a11y-scan && node src/index.js --local --port 5173` against the
   running dev server — fix anything it flags before moving on.
2. `cd client && npm test` — RTL queries by role/label/text, so a passing
   test is itself evidence the markup is accessible (you can't
   `getByRole('button', { name: ... })` a `<div>` with no role or name).
3. A full keyboard-only pass (Tab, Shift+Tab, Enter, Space, arrows, Esc) of
   whatever flow changed.
4. See [AUDIT_LOG.md](AUDIT_LOG.md) for the format to log what you found.
