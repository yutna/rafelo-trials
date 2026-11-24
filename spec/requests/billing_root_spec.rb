require "rails_helper"

RSpec.describe "Billing module root", type: :request do
  it "serves the invoices index from the module root and marks it current in navigation" do
    stub_request(:get, "http://localhost:4000/invoices")
      .with(query: hash_including({}))
      .to_return(
        status: 200,
        body: Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/index.json").read,
        headers: { "Content-Type" => "application/json" }
      )

    get "/en/billing", headers: auth_headers(grants: [ RafeloTrials::Billing::Permissions::INVOICE_READ ])

    page = JSON.parse(response.body[/<script[^>]*data-page="app"[^>]*>(.*?)<\/script>/m, 1])
    billing = page.dig("props", "nav").find { |entry| entry["key"] == "billing" }
    expect(response).to have_http_status(:ok)
    expect(page["component"]).to eq("billing/invoices/index")
    expect(billing["path"]).to eq("/en/billing")
    expect(billing["current"]).to be(true)
  end
end
