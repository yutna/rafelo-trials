# frozen_string_literal: true

Rafelo::Core::Modules.register(
  key: :billing,
  engine: RafeloTrials::Billing::Engine,
  path: "/billing",
  permission_prefixes: [ "billing" ],
  nav: { order: 30, label_key: "billing.nav.title", icon: "receipt" }
)
