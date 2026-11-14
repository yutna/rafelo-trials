# frozen_string_literal: true

Rafelo::Core::Modules.register(
  key: :billing,
  engine: RafeloTrials::Billing::Engine,
  path: "/billing",
  permission_prefixes: [ "billing" ],
  nav: { order: Rafelo::Core::Modules.all.map { |entry| entry.nav[:order] }.compact.max.to_i + 10, label_key: "billing.nav.title", icon: "receipt" }
)
