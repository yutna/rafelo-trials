require "rails_helper"

RSpec.describe "Billing module" do
  it "registers its path, permission prefix, and navigation entry" do
    entry = Rafelo::Core::Modules.fetch(:billing)

    expect(entry.path).to eq("/billing")
    expect(entry.permission_prefixes).to eq([ "billing" ])
    expect(entry.nav).to eq(order: 30, label_key: "billing.nav.title", icon: "receipt")
  end

  it "exposes the invoice permissions declared in its manifest" do
    expect(RafeloTrials::Billing::Permissions::INVOICE_READ).to eq("billing:invoice:read")
    expect(RafeloTrials::Billing::Permissions::INVOICE_CREATE).to eq("billing:invoice:create")
  end
end
