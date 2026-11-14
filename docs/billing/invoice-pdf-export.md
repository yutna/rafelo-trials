# PDF export of the billing invoice list

Status: blocked on owner decisions. Tracking issue: #23. Draft pull request: #24.

This page records the plan and the open decisions. It does not decide them.

## Outcome

A viewer on `/billing/invoices` can request a PDF export of the invoice list. The export runs as a background job, is stored through `Rafelo::Core::Export` for the requesting viewer, and downloads through core's authorized export path. The PDF carries the invoice list title, the invoice rows, and an invoice total at the bottom.

## Open decisions

1. **PDF library and ADR (WF-06).** The stack has no PDF writer. Recommended: `prawn` 2.5.0 with `prawn-table` 0.2.2; both are pure Ruby, pinned exactly, and need no native build. Alternatives: `hexapdf` (writer without table layout), an HTML-to-PDF browser path (adds a browser and its process to the production image), or a hand-written minimal PDF writer (rejected: maintenance and malformed-PDF risk). A new framework-level library needs an ADR, and the owner approves the library and the ADR.
2. **Dependency issue (WF-06).** A new dependency needs an issue that states why. Issue #23 states why the dependency is proposed; the owner confirms whether that is enough or asks for a separate dependency issue.
3. **Thai font and licence.** A `th` export must render Thai text. Prawn's built-in fonts cannot, and neither the repository nor the production image carries a font. Options: bundle a Thai font such as Noto Sans Thai (SIL OFL 1.1) with the billing engine and record it in `THIRD_PARTY_NOTICES.md`, install a font in the production image, or choose the HTML/browser-to-PDF path. The owner chooses the font and approves its licence and distribution.
4. **Total definition.** "The invoice total at the bottom" is not defined by the code or the upstream contract. The list is paginated and every invoice carries its own currency, so the owner decides: all invoices in the export or only the current page; one total per currency, one grand total only when every invoice shares a currency, or a separate total for each currency; and which statuses count (draft, issued, paid, void).
5. **Export permission.** Billing has `read`, `create`, and `delete`. The owner decides whether export needs a new `billing:invoice:export` key, matching the example module's export pattern, or is allowed to every viewer with `billing:invoice:read`.
6. **Export size.** The viewer job budget is 10 upstream calls; at 100 invoices per page that covers 1,000 invoices. The owner confirms the maximum export size or the behaviour past it.

## Proposed slice after the decisions

- Add `POST /billing/invoices/export`, authorize the chosen export capability, claim the form token through `Rafelo::Core::IdempotencyClaim`, build a `Rafelo::Core::Export` for the viewer, enqueue the export job, and redirect with 303.
- Add an `InvoiceExportJob` on `Rafelo::Core::ExportJob` that fetches every page with the viewer's session and a bounded call budget.
- Add a billing `InvoiceListPdf` that renders the localized title, the invoice rows, and the chosen total through the approved library and font.
- Add the export capability and `exportPath` to the invoices index props and contract; hide the control without the capability; add copy in every configured locale.
- Cover authorization, idempotent replay, the 403 without the grant, all pages fetched, the `application/pdf` attachment, the PDF title and total, and the visible and hidden control.

## Out of scope

- Implementing the export before the library, ADR, dependency, total, permission, and font decisions.
- A new upstream, invoice filters, or changes to the invoice create and delete flows.
- A general export framework, exports of other lists, or a scheduled export.
- Changes to any guard file.
