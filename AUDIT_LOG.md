# AUDIT_LOG

Running record of accessibility issues found during development, the WCAG 2.1
criterion each one violates, the fix applied, and the re-test result. New
entries go at the top.

---

## 2026-09-10 — Modal focus trap silently no-ops behind a `position: fixed` overlay

- **Found via:** Jest + RTL test (`Modal.test.jsx`, "traps Tab focus inside the dialog").
- **Criterion:** 2.1.2 No Keyboard Trap / 2.4.3 Focus Order (dialog focus management).
- **Issue:** `Modal.jsx`'s Tab-trap handler filtered candidate focusable elements
  with `el.offsetParent !== null` to skip hidden elements. `offsetParent` is
  spec'd to return `null` for *any* element that has a `position: fixed`
  ancestor — which describes every element inside `.modal-overlay` (itself
  `position: fixed`). The filter silently zeroed out the candidate list on
  every keystroke, so `Tab`/`Shift+Tab` fell through to the browser's default
  behavior and focus could escape the dialog into the rest of the page —
  exactly the SPA modal bug WCAG 2.4.3 calls out. This is a genuine browser
  behavior, not a jsdom-only quirk, so it would have shipped.
- **Fix:** Dropped the `offsetParent` visibility filter in
  [Modal.jsx](client/src/components/Modal.jsx) — the dialog only ever renders
  elements that should be focusable, so no separate visibility check is
  needed.
- **Re-test:** `npm test` in `client/` — `Modal.test.jsx` "traps Tab focus
  inside the dialog" now passes; forward and shift+Tab correctly cycle
  between the close button and dialog content without escaping.

---

## 2026-09-10 — Job card heading skips a level (h1 → h3)

- **Found via:** `a11y-scan --local` run against the listings page.
- **Criterion:** 2.4.6 Headings and Labels.
- **Issue:** The listings page had an `<h1>` page title and `<h3>` job card
  titles with no `<h2>` in between, breaking the heading outline screen
  reader users rely on to navigate by heading level.
  ```
  [FAIL] 2.4.6 Headings and Labels (1 violation)
  Heading level jumps from h1 to h3, skipping a level.
  main#main-content > div.listings-layout > div > ul.job-grid > li.job-card:nth-of-type(1) > h3
  ```
- **Fix:** Added an `<h2>Job listings</h2>` heading above the results list in
  [JobListingsPage.jsx](client/src/pages/JobListingsPage.jsx), so the outline
  reads h1 → h2 (Job listings) → h3 (each job title).
- **Re-test:** Re-ran `a11y-scan --local` — `2.4.6 Headings and Labels: PASS
  (0 violations)`, `Total violations: 0` across all 3 crawled pages.

---

## 2026-09-10 — Full-app automated sweep (baseline)

- **Checked:** `/` (listings, light + dark theme), `/jobs/:id` (deep-linked
  detail page), `/jobs/:id/apply` (application form), `/admin/login`,
  `/admin` (dashboard, authenticated), `/admin/jobs/new` (combobox + form).
- **Tool:** `a11y-scan` against all 7 hand-written checks (1.1.1, 1.3.1,
  1.4.3, 2.1.1, 2.4.4, 2.4.6, 4.1.2).
- **Result:** 0 violations on every page, in both light and dark theme.
