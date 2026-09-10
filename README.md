# AccessiBoard

A WCAG 2.1 AA job board built to demonstrate accessibility engineering
end-to-end: accessible UI built from first principles (no component library
hiding markup or ARIA), plus **a11y-scan**, a hand-written audit CLI (no
axe-core) used throughout development to catch regressions.

**Contents:** [Portfolio summary](#portfolio-summary) &middot;
[Features](#features) &middot; [Tech stack](#tech-stack) &middot;
[Setup](#setup) &middot; [a11y-scan usage](#a11y-scan-usage)

## Portfolio summary

- Built every interactive pattern a modern job board needs (modal dialog,
  tabs, combobox, sortable data table, live-region search/sort
  announcements, real form validation), against the matching WAI-ARIA APG
  pattern, documented in [ACCESSIBILITY.md](ACCESSIBILITY.md).
- Built the audit tooling itself rather than wrapping an existing library:
  [a11y-scan](a11y-scan) hand-implements 7 WCAG 2.1 success-criterion checks,
  including a from-scratch relative-luminance contrast calculator, and
  crawls a running site with Playwright.
- Used that tool against the app throughout development and kept a running
  log of what it caught and how it was resolved, see
  [AUDIT_LOG.md](AUDIT_LOG.md), including a dialog focus-trap edge case
  caused by a browser quirk (`offsetParent` is `null` for any descendant of
  a `position: fixed` element).

## Features

**Public**
- Searchable, filterable job listings with a live-announced results count
- Job detail as both a focus-trapped modal and a deep-linkable route
- Multi-field application form with real-time, screen-reader-linked validation

**Admin**
- Email/password login (JWT session)
- Dashboard with status tabs (Active / Drafts / Archived) and a sortable table
- Job posting form with an ARIA combobox for category selection
- Full light and dark theme, both contrast-checked against WCAG AA

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (function components + hooks), plain CSS, React Router 6 |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` (see [note below](#database-note)) |
| Testing | Jest + React Testing Library (queries by role/label) |
| Audit tool | Node CLI + Playwright for crawling, hand-written DOM/style checks |

### Database note
Built on SQLite (`better-sqlite3`): the same relational schema/queries
you'd write against PostgreSQL, but zero-config for local development: no
separate database server to install or run. [server/src/db.js](server/src/db.js)
and the query layer in [server/src/routes](server/src/routes) are written so
swapping in `pg` + a connection string is the only change needed to move to
Postgres for a production deploy.

## Project layout

```
ReachAble/
├── client/             React app (Vite)
├── server/             Express API + SQLite
├── a11y-scan/          audit CLI (Playwright + hand-written WCAG checks)
├── ACCESSIBILITY.md    pattern-by-pattern style guide
└── AUDIT_LOG.md        issue -> criterion -> fix -> re-test log
```

## Setup

Requires Node.js 18+.

```bash
# 1. Backend
cd server
npm install
npm run dev   # http://localhost:4000 (seeds demo jobs + admin user on first run)

# 2. Frontend (separate terminal)
cd client
npm install
npm run dev   # http://localhost:5173, proxies /api to :4000

# 3. Audit tool (separate terminal, needs the frontend running)
cd a11y-scan
npm install
npx playwright install chromium   # one-time browser download
node src/index.js --local --port 5173
```

**Demo admin login:** `admin@accessiboard.test` / `AdminPass123!`
(seeded automatically the first time the server starts).

### Running tests

```bash
cd client
npm test
```

### Building for production

```bash
cd client && npm run build   # outputs client/dist
cd server && npm start       # serves the API; point a static host at client/dist
```

## a11y-scan usage

```bash
node src/index.js <url> [--json] [--html] [--max-pages N]
node src/index.js --local [--port 5173] [--json] [--html]
```

Crawls same-origin links breadth-first (default 5 pages) and runs 7
hand-written checks, each mapped to a WCAG 2.1 success criterion:

| Criterion | What it checks |
|---|---|
| 1.1.1 Non-text Content | `<img>` missing an `alt` attribute |
| 1.3.1 Info and Relationships | form control with no associated label |
| 1.4.3 Contrast (Minimum) | computed text/background contrast below 4.5:1 (3:1 for large text) |
| 2.1.1 Keyboard | `onclick` on a non-interactive element with no tabindex/keyboard handler |
| 2.4.4 Link Purpose | link text like "click here" with no `aria-label` |
| 2.4.6 Headings and Labels | skipped heading level (e.g. h1 to h4) |
| 4.1.2 Name, Role, Value | custom ARIA widget missing its role's required state attribute |

Exits non-zero if any violation is found, so it's CI-usable as-is with
`--json`.
