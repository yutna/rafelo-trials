# Billing module

Read the root AGENTS.md first. This is a product module: it owns its routes,
pages, registry entry, and permissions. It is not a domain engine.

- Registry: `engines/billing/config/module.rb` registers key `billing`, path
  `/billing`, permission prefix `billing`, and the navigation entry (ARCH-06).
- Dependencies: `engines/core` and `engines/design_system` only (ARCH-08).
- Public surface: `engines/billing/app/public/` for Ruby and
  `engines/billing/app/frontend/public/` for TypeScript, imported as
  `@billing/public/...` (ARCH-09).
- Permissions: the `billing` prefix, generated as constants from
  `engines/billing/config/permissions.yml` (BE-03).
- Pages render one screen, containers own hooks and state, components stay
  presentational, `domain/` and `forms/` are framework-free, and all
  user-facing copy lives in `engines/billing/config/locales`.

The module owns no page, controller, gateway, or upstream call yet. It will own
invoices. Its first page is created with `rafelo:page` (GEN-02), which also adds
the `root` route navigation needs; until then the module stays out of
navigation.
