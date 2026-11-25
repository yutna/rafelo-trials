# PDF export of the billing invoice list

Status: blocked on owner decisions. Tracking issue: #56. The linked pull request is the
hand-over and stays open until the decisions below are made.

This page records the plan and the open decisions. It does not decide them.

## Outcome

A viewer on `/billing/invoices` can request a PDF export of the invoice list. The export
runs as a background job, is stored through `Rafelo::Core::Export` for the requesting
viewer, and downloads through an authorized export path. The PDF carries the invoice list
title, the invoice rows, and an invoice total at the bottom.

## Open decisions

1. **PDF library, dependency, and ADR (WF-06).** The stack has no PDF writer.
   Recommended: `prawn` 2.5.0 with `prawn-table` 0.2.2. Both are pure Ruby and
   MIT-licensed, but a prototype under this app's Ruby 4.0.10 shows the real cost: they
   add `pdf-core` 0.10.0, `ttfunk` 1.8.0, and `matrix` 0.4.3, and they force `bigdecimal`
   from the locked 4.1.3 down to 3.3.1 because `prawn` requires `~> 3.1`. `/Gemfile` and
   `/Gemfile.lock` are code-owned, so the owner also approves that dependency change.
   Alternatives: `hexapdf` (AGPL-3.0 or a commercial licence, and no table layout), an
   HTML-to-PDF browser path (adds a browser and its process to the production image), or
   a hand-written minimal PDF writer (rejected: malformed-PDF and maintenance risk). A
   new framework-level library also needs its own ADR; this issue proposes one and the
   owner approves it.
2. **Thai font and licence.** A `th` export must render Thai text. `Noto Sans Thai` alone
   has no Latin letters, digits, or the baht sign, so a prototype rendered `INV-001`,
   `2569`, and `฿1,250.00` as missing-glyph boxes. Recommended: bundle `Sarabun` Regular
   and Bold (SIL OFL 1.1), which includes Thai, Latin, digits, and the baht sign; a
   prototype rendered the title, Thai names, Buddhist Era dates, invoice numbers, and
   amounts correctly, including the combining marks. The owner approves the font, its
   licence, and its distribution, and the font and its OFL text go into
   `THIRD_PARTY_NOTICES.md`. Alternatives: bundle a second Latin font with
   `Noto Sans Thai`, or install a font in the production image.
3. **Total definition.** "The invoice total at the bottom" is not defined by the code or
   the upstream contract. The list is paginated and every invoice carries its own
   currency, so the owner decides:
   - all invoices in the export or only the current page;
   - one total per currency, one grand total only when every invoice shares a currency,
     or a separate total for each currency;
   - which statuses count (draft, issued, paid, void).

   Recommendation: every invoice in the export, all statuses the list shows, and one
   total per currency, summed in minor units with `Rafelo::Core::Money.exponent` so no
   float is involved.

4. **Export permission.** The billing manifest currently has `read`, `create`, and
   `delete`. The owner decides whether export needs a new `billing:invoice:export` key,
   matching the example module's export pattern, or is allowed to every viewer with
   `billing:invoice:read`. A new key is denied until the identity provider grants it, so
   the owner also decides who receives the grant.
5. **Export size.** The job budget is 10 upstream calls (`config/budgets.yml`,
   `jobs.upstream_calls_per_request.api`), and the list serves at most 100 invoices per
   page, so 10 pages cover 1,000 invoices. The fixture list has 250 invoices over 3
   pages. The owner confirms the maximum export size and what happens past it: stop at
   the cap, export the first 1,000 with a note, or fail the export with a clear error.
6. **Download surface.** The template's example export queues a file and flashes "Export
   queued" but exposes no download link after the job finishes; the `core_exports` record
   and core's `ExportsController` exist, but no route or page lists a viewer's finished
   exports. The owner decides how the viewer reaches the file: a recent-exports list on
   `/billing/invoices` with `DownloadLink`s, a billing exports route for one export, or a
   later notification. This is user-visible and not implied by the request.

## Technical evidence

A prototype outside the repository, with `prawn` 2.5.0 and `prawn-table` 0.2.2 under Ruby
4.0.10, rendered a Thai title, Thai customer names, invoice numbers, Buddhist Era dates,
and per-currency amounts. `Sarabun` Regular and Bold rendered Thai, Latin, digits, and the
baht sign; `Noto Sans Thai` rendered the Latin and digits as missing-glyph boxes. The
prototype also showed the dependency cost in decision 1: Bundler resolves `bigdecimal`
3.3.1 for `prawn`, below the app's locked 4.1.3.

## Proposed slice after the decisions

- Add `POST /billing/invoices/export`, authorize the chosen export capability, claim the
  form token through `Rafelo::Core::IdempotencyClaim`, build a `Rafelo::Core::Export` for
  the viewer, enqueue the export job, and redirect with 303.
- Add an `InvoiceExportJob` on `Rafelo::Core::ExportJob` that fetches every page with the
  viewer's session and a bounded call budget.
- Add a billing `InvoiceListPdf` that renders the localized title, the invoice rows, and
  the chosen total through the approved library and font.
- Add the export capability and href to the invoices index props and contract; hide the
  control without the capability; add copy in every configured locale.
- Add the approved download surface for a finished export, bound to the viewer.
- Cover authorization, idempotent replay, the 403 without the grant, all pages fetched,
  the `application/pdf` attachment, the PDF title and total, a `th` Buddhist Era year, and
  the visible and hidden control.

## Out of scope

- Implementing the export before the library, ADR, dependency, total, permission, font,
  size, and download-surface decisions.
- A new upstream, invoice filters, or changes to the invoice create and delete flows.
- A general export framework, exports of other lists, or a scheduled export.
- Changes to any guard file.
