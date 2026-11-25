# Billing module

Read the root AGENTS.md first. This engine is a product module, not a domain
engine: it owns its registry entry, routes, pages, and permissions.

- The registry entry lives in `engines/billing/config/module.rb`: key
  `billing`, path `/billing`, permission prefix `billing`, and the navigation
  metadata (ARCH-06).
- It depends only on `engines/core` and `engines/design_system` (ARCH-08).
  Anything another engine needs is exported through
  `engines/billing/app/public/` (Ruby) or
  `engines/billing/app/frontend/public/` (TypeScript) and imported as
  `@billing/public/...` (ARCH-09).
- Permissions are the `billing` prefix declared in
  `engines/billing/config/permissions.yml`; use the generated constants, never
  string keys (BE-03).
- Follow the app layering: a page renders one screen, containers own hooks and
  state, components stay presentational, `domain/` and `forms/` stay
  framework-free, and every user-facing string lives under
  `engines/billing/config/locales`.

The module owns invoices and serves them from `/billing/invoices`, which is
also the module root. The read-only index page requires
`billing:invoice:read`, reads the `api` upstream through `InvoicesGateway`,
and lists invoice number, customer name and email, status, total, and issue
date. The email is the flat `customer_email` the `GET /invoices` list response
carries for every invoice. A new page starts from `rafelo:page` (GEN-02); the
first index page adds the `root` route the navigation entry points at.
