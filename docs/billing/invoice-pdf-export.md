# PDF export of the billing invoice list

Status: blocked on owner decisions. Tracking issue: #77. Base branch: `round-4`.

This page records the plan and the open decisions. It does not decide them, and
this pull request contains no library, font, lockfile, or implementation change.
A previous round recorded the same request in #56 and opened draft PR #57 against
`round-3`; both stay open. This page is the `round-4` record against the current
code, which now shows the customer email (#76).

## Outcome

A viewer on `/billing/invoices` can request a PDF of the invoice list. The PDF
carries a localized title, the invoice rows, and an invoice total at the bottom.
It is produced for that viewer, stored through `Rafelo::Core::Export` (BE-18),
and downloaded from an authorized path bound to the viewer. A whole-list export
can need up to 10 pages, more than the 3-call request budget, so it runs as a
job.

## What the repository shows

- No PDF writer is in `Gemfile` or `Gemfile.lock`. The only export in the
  template is `example_orders`, which renders CSV in a
  `Rafelo::Core::ExportJob`.
- `GET /invoices` returns at most 100 items per page
  (`Rafelo::Core::ListQuery::MAX_PER_PAGE`), with `pagination.total`; the index
  fixture has 120 invoices over two pages. Each item carries `number`,
  `customer_name`, `customer_email`, `status`, `total_minor`, `currency`, and
  `issued_on`. The fixture is all THB, but the wire contract allows any
  ISO-4217 code per invoice.
- `config/budgets.yml` allows 3 upstream calls per request and 10 per job. A
  whole-list export cannot run inside the request; a current-page export can.
- `Rafelo::Core::Export` stores a file in Active Storage, expires after 6 hours
  (`exports.ttl_seconds`), and `Rafelo::Core::ExportsController#show` checks the
  viewer and redirects to a short-lived signed URL. The app mounts only
  `core/export_files/:signed_id`; there is no route for `ExportsController#show`
  and no page that lists a viewer's finished exports. The example export
  flashes "queued" and never links the file.
- The template's design_system has no `DownloadLink` even though BE-18 says it
  provides one. `Link` renders an Inertia visit for an app path, so it cannot
  serve a download.
- The locale already has `billing.invoices.title` ("Invoices"/"ใบแจ้งหนี้"), the
  column labels, and `billing.invoices.total`. New copy is needed for an export
  control, a queued notice, a download label, and any truncation note.
- `Rafelo::Core::DateFormatter` renders Buddhist Era dates in `th`; Active Job
  serializes the enqueuing locale and runs the job inside `I18n.with_locale`
  (BE-19), so a `th` export can satisfy FE-20.
- `billing.invoice` currently has `read`, `create`, and `delete`.
  `example_orders` has an `export` key and a `POST /orders/export` action.
- `/Gemfile`, `/Gemfile.lock`, `/Dockerfile`, `.devcontainer/`,
  `engines/*/package.yml`, and `config/budgets.yml` are code-owned. A change to
  one needs an owner's approval.

## Open decisions

### 1. Scope: the current page or the whole list

The request says "the billing invoice list", but the list is paginated.

- **Whole list (recommended).** The PDF is a file of the list, not of one page.
  It can need up to 10 upstream calls, so it uses the job, the `core_exports`
  record, and a download surface. A whole-list export capped at 300 invoices
  (three pages) could also stream synchronously, but it would not cover the
  1,000-invoice budget and is not recommended.
- **Current page.** Fits one upstream call and could stream synchronously with
  no job, no export record, and no download surface. The title and the total
  then describe only that page, which is easy to misread in a file.

What the choice changes: the architecture (synchronous response or job plus
download surface), the meaning of the total, and the acceptance tests.

### 2. How the PDF is produced: library, licence, dependency, and ADR

There is no PDF writer today. This is a new runtime dependency; because it
becomes the only PDF rendering path, treat it as framework-level (WF-06) and add
an ADR when it is chosen. `Gemfile` and `Gemfile.lock` are code-owned.

- **A. Prawn 2.5.0 with prawn-table 0.2.2 (recommended if the licence is
  accepted).** Pure Ruby; no browser or separate process. It adds `pdf-core`
  0.10.0, `ttfunk` 1.8.0, and `matrix` 0.4.3. **Prawn, prawn-table, pdf-core,
  and ttfunk are GPLv2/GPLv3 or the Ruby licence ("Nonstandard" in the gemspec),
  not MIT.** The Ruby licence is the permissive branch, but a licence owner must
  accept it. `ttfunk 1.8.0` requires `bigdecimal ~> 3.1`, so the locked
  `bigdecimal 4.1.3` would be downgraded to 3.3.1. Changes: new gems and
  lockfile, the `bigdecimal` downgrade, a licence review, a new ADR; no
  production image change.
- **B. HexaPDF 1.11.2.** Pure Ruby. AGPL-3.0 or a commercial licence; AGPL's
  network-use terms need a legal decision, and a commercial licence costs money.
  It has no table helper, so the layout is more code. Changes: a dependency, a
  legal or purchase decision, an ADR; no `bigdecimal` constraint known.
- **C. HTML-to-PDF through a headless browser (Grover 2.0.1 and Chromium via
  Puppeteer; Ferrum is the Ruby equivalent).** Grover is MIT, but it adds a Node
  package and Chromium to the production and CI images and runs a browser in the
  job. The HTML template would be a second rendering of the list, because the
  app has no SSR (ADR-22). Changes: a dependency, guarded image changes, job
  memory and time, a new attack surface; no Ruby font work.
- **D. Browser print-to-PDF (no library).** A print-friendly view and the
  viewer's own "Save as PDF". It is not a stored or downloadable export, has no
  core export, audit, or expiry, and cannot be emailed by the system. Changes
  the outcome; no dependency or font decision.
- **E. A managed PDF service.** Sends invoice data, including the customer
  email, to a third party; needs a data-processing and cost decision. Not
  recommended.

Recommendation: A, subject to the licence owner accepting the Ruby licence. If
that licence is rejected, B with a commercial licence, then D. C is the largest
operational change; E sends personal data outside the boundary.

What the choice changes: dependencies and lockfile, the ADR, the licence
review, the production image, the job runtime, and whether a file is stored at
all.

### 3. Thai font, licence, and where it lives

`th` is configured, so a `th` PDF must render Thai, Latin letters, digits, and
the baht sign. The production Dockerfile installs no Thai font package. A
prototype showed that the system `Noto Sans Thai` renders Thai but shows Latin
letters and digits as missing-glyph boxes; Sarabun renders all four.

- **A. Bundle Sarabun Regular and Bold in the repository (recommended).** SIL
  OFL 1.1; add the two files and the OFL text to `THIRD_PARTY_NOTICES.md`. No
  guarded file; the same rendering in development, CI, and production. Changes:
  two binary files (about 180 KB) and a notice.
- **B. Install a font in the production and development images.** Changes
  `Dockerfile` and `.devcontainer/`, both code-owned; the output can drift
  between hosts and the licence notice is still needed.
- **C. Use a system font at runtime.** No new asset, but production has no Thai
  font; not viable without the image change above.
- **D. Ship only an English PDF, or transliterate Thai.** Changes the product
  for `th` viewers and does not meet FE-20.

Recommendation: A. The owner approves the font, the SIL OFL 1.1 terms, and the
notice. Noto Sans Thai plus a separate Latin font is two files and more notice
work; one font that covers both is simpler.

### 4. The total's money rule

The files do not define "the invoice total at the bottom". The list is
paginated, each invoice has its own currency, and the statuses include draft,
issued, paid, cancelled, and void.

- **Which rows:** every invoice in the export (recommended) or the current page.
- **Which statuses:** every row shown (recommended, so the bottom line
  reconciles with the rows above it) or only some statuses, such as issued and
  paid. If the owner wants an amount due, the PDF must say which statuses it
  excludes.
- **Currencies:** one total per currency (recommended), or one grand total only
  when every invoice shares a currency. Never add across currencies. Sum in
  integer minor units with `Rafelo::Core::Money.exponent`.

What the choice changes: the number of totals and their labels, how the PDF
reads for a mixed-currency list, and the tests. Every choice keeps the sum in
integer minor units, never a float.

### 5. Who may export, and whether the PDF carries customer email

The list now shows `customer_email`, and the PDF is a portable copy that leaves
the app.

- **Permission:** a new `billing:invoice:export` key (recommended, like
  `example_orders`) or the existing `billing:invoice:read`. A new key is denied
  until the identity provider grants it, so the owner also decides who receives
  the grant.
- **Personal data:** include the customer email (match the list) or the
  customer name only. Recommendation: include the email only when the export
  key is granted; otherwise name only. The file can be forwarded and outlives
  the session.
- **Title and columns:** the localized `invoices.title` plus the list columns
  minus actions (recommended), or a narrower register. A different report title
  is new copy in `en` and `th`.

What the choice changes: the permission manifest, the generated permissions,
the policy, the props and contract capability, the identity-provider grant, the
PDF columns, and the copy.

### 6. Export size and behaviour past it

The job budget is 10 `api` calls and a page holds at most 100, so 10 pages cover
1,000 invoices; the fixture has 120. A larger list exceeds the budget.

- **Cap at 1,000 and state it in the PDF (recommended).** Fetch 10 pages and
  print "First 1,000 of N invoices" when `pagination.total` is larger. Honest
  and needs no guard change.
- **Fail above 1,000 with a clear error.** Safe, but the list has no filters, so
  the viewer cannot narrow it.
- **Export the first 1,000 silently.** Rejected: a truncated file that looks
  complete is worse than a failed export.
- **Raise the job budget** in `config/budgets.yml` (a guard file) to cover every
  invoice. The owner approves the budget change; call time and upstream load
  grow with it.

Recommendation: cap at 1,000 and state it. The queued notice cannot know the
count yet; the PDF and the finished-export row can.

### 7. How the viewer gets the file

`Rafelo::Core::Export` and `ExportsController#show` exist, but the app has no
route for the click and no page that lists a viewer's exports.

- **A. A billing exports route plus a recent-exports block on the invoices page
  (recommended).** A `GET /billing/invoices/exports/:id` action inherits core's
  `ExportsController`, authorizes ownership, and redirects to the signed URL;
  the index props carry the viewer's recent exports and a plain download link
  per ready file. Changes: route, controller, props and contract, copy, tests.
- **B. A generic exports page in core.** One surface for every module, but core
  has no page today; it adds a core page and contract and a larger scope. It
  should be its own issue.
- **C. A notification or email when ready.** Needs a notification or mailer path
  the app does not have.
- **D. A synchronous download.** Possible only for the current page within the
  3-call request budget; a whole-list export needs the job.

Recommendation: A. It keeps ownership and the signed URL in core and gives the
viewer a link without guessing a URL.

Both A and the link itself need a plain anchor, not an Inertia visit. The
template is missing the `DownloadLink` that BE-18 names, so this decision also
chooses whether to add `DownloadLink` to design_system or extend `Link` with a
download variant. Either is a design_system public API change with a component
test and a catalog baseline, and a person reviews the baseline (TS-11).

What the choice changes: routes, a controller, props and contract, a page
section, copy, a design_system component or API change, and where the download
link lives.

## Proposed slice after the decisions

1. Add the approved library, font, ADR, and third-party notice.
2. Add `POST /billing/invoices/export`: authorize the chosen capability, claim
   the form token through `Rafelo::Core::IdempotencyClaim`, build
   `Rafelo::Core::Export` for the viewer with filename `invoices.pdf`, enqueue
   `InvoiceExportJob`, and redirect with 303 and the queued notice.
3. Add `InvoiceExportJob < Rafelo::Core::ExportJob`: fetch pages with the
   viewer's session and the job budget, stop at the approved cap, and attach the
   PDF as `application/pdf`.
4. Add a billing PDF renderer: the localized title, the approved columns, the
   per-currency totals in integer minor units, `Rafelo::Core::DateFormatter`
   dates (Buddhist Era in `th`), the approved truncation note, and the approved
   font.
5. Add the export capability and href to the invoices index props and contract,
   hide the control without the capability, add the approved download surface,
   add copy in every configured locale, and regenerate the page schema,
   permissions, locale catalogs, and Zod schema.
6. Add the missing plain download link (a `DownloadLink` or a `Link` variant),
   with its API file, component test, catalog entry, and baseline.
7. Tests: request specs for authorization, the export capability and href, the
   403 without the grant, and idempotent replay; a job spec for every page, the
   cap, the viewer's session, and `application/pdf`; a renderer spec for the
   title, the per-currency totals, and a Buddhist Era year in `th`; Vitest for
   the visible and hidden export control; keep the index's schema, budget, href,
   and policy checks at the maximum page size.
8. Run `bin/check billing`, `bin/check design_system` if the link changes, and
   `bin/ci`; change no guard file without the owner's approval.

## Out of scope

- Implementing before the seven decisions are made.
- A scheduled export, a general export framework, or exports of other lists.
- Invoice filters (the list has none today), a new upstream, or changes to the
  invoice create and delete flows.
- A core page for exports unless decision 7 chooses it; that would be its own
  issue.
- Raising a budget, changing a guard file, or adding a visual baseline without
  the owner's approval.

## Risks

- The chosen library's licence may not be acceptable. Prawn's Ruby licence
  branch needs a legal read; HexaPDF's AGPL needs acceptance or a purchase.
- Bundling a font adds a binary asset and a notice; the `th` copy, long customer
  names, and combining marks need proofreading. Prawn does no complex text
  shaping, though the prototype rendered Thai correctly.
- The `bigdecimal` downgrade from 4.1.3 to 3.3.1 if Prawn is chosen; the app
  must still boot and pass its numeric tests.
- A cross-currency grand total is invalid; per-currency totals avoid it.
- The customer email in a downloadable file is personal data; the permission
  and column decisions limit it.
- The 1,000-invoice cap must be visible in the PDF, not silent.
- The download surface does not exist in the template; the missing
  `DownloadLink` is part of the slice, and its visual baseline needs a person's
  review.

## Technical evidence

- There is no PDF writer in the bundle. Prawn 2.5.0, prawn-table 0.2.2,
  pdf-core 0.10.0, ttfunk 1.8.0, and matrix 0.4.3 are not in `Gemfile.lock`.
- Gem licences, read from the gemspecs: Prawn 2.5.0, prawn-table 0.2.2,
  pdf-core 0.10.0, and ttfunk 1.8.0 are GPLv2/GPLv3 or the Ruby licence
  (`Nonstandard`/`RUBY`), not MIT. HexaPDF 1.11.2 is AGPL-3.0. Grover 2.0.1 is
  MIT.
- `Gemfile.lock` locks `bigdecimal 4.1.3`; `ttfunk 1.8.0` requires
  `bigdecimal ~> 3.1`. An isolated prototype outside this repository (Prawn
  2.5.0, prawn-table 0.2.2, Ruby 4.0.10) resolved `bigdecimal 3.3.1` and
  rendered a Thai title, Thai customer names, a Buddhist Era date
  (`25 พฤศจิกายน 2569`), invoice numbers, and `฿1,250.00` with Sarabun Regular
  and Bold. The same prototype with the system `Noto Sans Thai` rendered Latin
  letters and digits as missing-glyph boxes.
- Sarabun is licensed under SIL OFL 1.1 (Google Fonts, `ofl/sarabun/OFL.txt`);
  its files include Thai, Latin, digits, and the baht sign.
- `ListQuery::MAX_PER_PAGE` is 100; `config/budgets.yml` gives jobs 10 `api`
  calls; the index fixture has `pagination.total` 120 and is all THB, while the
  wire contract allows any three-letter currency per invoice.
- `Rafelo::Core::Export` expires in 6 hours and `ExportsController#show` checks
  `viewer_id`; the app has no route for it and no export list.
- Active Job 8.1 serializes `locale` and runs the job inside
  `I18n.with_locale`; `Rafelo::Core::DateFormatter` renders `th` with Thai months
  and year + 543.
- The design_system `public/index.ts` has no `DownloadLink`; `Link` uses an
  Inertia visit for an app path.

## How to test after the decisions

1. Sign in with the chosen export grant and open `/en/billing/invoices`; the
   export control is visible.
2. Request the export; the response is 303 with the queued notice, one
   `core_exports` row exists for the viewer, and one job is enqueued.
3. Wait for the job, then download from the approved surface; the file opens as
   `application/pdf`, named `invoices.pdf`, with the title, rows, and the
   approved total(s).
4. Repeat in `/th`; the title, labels, customer names, and dates are Thai, and
   the dates show a Buddhist Era year.
5. With more than 1,000 invoices, the PDF states the cap; with no grant, the
   control is hidden and `POST` returns 403; replaying the token creates no
   second export or job.
6. Run `bin/check billing` and `bin/ci`.

## Spec rule IDs

WF-01, WF-02, WF-03, WF-06, ADR-32; BE-01, BE-03, BE-06, BE-12, BE-13, BE-15,
BE-16, BE-18, BE-19, BE-20; CT-01, CT-02, CT-03, CT-08, CT-10, CT-12; FE-01,
FE-07, FE-09, FE-11, FE-18, FE-20; TS-01, TS-02, TS-04, TS-11; ARCH-05, ARCH-08,
ARCH-10, ARCH-13; SEC-02, SEC-10; OPS-01, OPS-08.
