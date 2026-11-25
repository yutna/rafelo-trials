# Customer contact details on the billing invoices list

Status: blocked on owner decisions. Tracking issue: #54. Draft pull request:
#55.

This page records the plan and the open decisions. It does not decide them.

## Outcome

A viewer on `/billing/invoices` sees each customer's contact details next to the
customer name in the invoice row. Rails reads the values from the `api` upstream
through `InvoicesGateway`, maps them through `Invoice` and `InvoicesIndexProps`,
and the React list renders them in the Customer cell.

## What the repository shows

- `engines/billing/spec/fixtures/upstream/invoices/index.json` is the only
  invoice list-response shape in the repository. It carries `customer_name` and
  no contact field.
- `engines/billing/app/gateways/rafelo_trials/billing/invoices_gateway.rb` maps
  only the fields the fixture carries.
- The app has no upstream API document, OpenAPI file, or customer endpoint.
- The fixture is synthetic (TS-03); it is not an upstream contract.

The fields, their keys, and their response shape therefore cannot be derived
from the repository.

## Open decisions

1. **Which contact details, and what does the upstream return?** Decide which
   details to show (for example email, phone, postal address, or a subset) and
   give their exact keys and shape. Are they flat on each `GET /invoices` item
   (for example `customer_email`) or nested (for example
   `customer: { email, phone }`)? Are they already on the list response, or must
   the upstream add a field or endpoint first? An example response settles it.
2. **Who may see them?** Every viewer with `billing:invoice:read` sees the
   customer name today. Decide whether every contact detail is visible under
   that same grant, or whether a detail needs its own permission key or masking
   (BE-03, CT-10).
3. **What does a row show when a detail is missing or empty?** Hide the detail,
   or show a localized label? If a label, it must exist in `en` and `th`
   (CT-08), and the owner supplies the wording or approves it.
4. **Plain text or links?** Plain text needs no URL. A `mailto:` or `tel:` link
   is a URL: Rails must build it and pass it in props (ARCH-10), and the current
   `isSafeUrl` accepts only `http(s)` and app paths, so a link also needs a
   safe-URL policy change that a person approves (FE-18).

## Proposed slice after the decisions

- Extend `Invoice`, `InvoicesGateway#invoice`, and `InvoicesIndexProps#row` with
  the confirmed fields.
- Extend the invoices index Zod schema and regenerate the page contract
  additively (CT-12).
- Render the details in the Customer cell with a stable `testId` per detail
  (FE-09); add copy only for a decided missing-value label (CT-08).
- Add the confirmed fields to the synthetic index and create fixtures.
- Cover the props through the real gateway and props objects, the row rendering,
  and keep the schema, budget, href, and capability checks (TS-01, TS-02,
  TS-04).
- Run `bin/check billing` and `bin/ci`; change no guard file.

## Out of scope

- Implementing before the four decisions are answered.
- A new upstream endpoint or customer lookup unless the list response has no
  contact fields.
- A new permission or masking rule unless decision 2 chooses one.
- The new-invoice form and any page other than the billing invoices index.
- Sorting or filtering by a contact detail.
