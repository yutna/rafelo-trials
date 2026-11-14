require "rails_helper"

RSpec.describe "Billing invoices", type: :request do
  let(:fixture_path) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/index.json") }
  let(:read_headers) { auth_headers(grants: [ "billing:invoice:read" ]) }

  def stub_invoices(payload)
    stub_request(:get, "http://localhost:4000/invoices")
      .with(query: hash_including({}))
      .to_return(status: 200, body: payload.to_json, headers: { "Content-Type" => "application/json" })
  end

  def page_body
    PageMatchers.page_of(response)
  end

  it "renders the read-only index at the maximum page size within its contract and budgets" do
    stub_invoices(JSON.parse(fixture_path.read))

    expect { get "/en/billing/invoices?per_page=#{Rafelo::Core::ListQuery.max_per_page}", headers: read_headers }
      .to within_budgets("billing/invoices/index")

    expect(response).to have_http_status(:ok)
    expect(response).to match_page_schema("billing/invoices/index")
    expect(response).to be_within_props_budget("billing/invoices/index")
    expect(response).to have_resolvable_hrefs("billing/invoices/index")
    expect(response).to match_policy_capabilities("billing/invoices/index")

    invoice = page_body.dig("props", "data", "items").first
    expect(invoice).to include(
      "number" => "INV-001",
      "customerName" => "Ada Example",
      "status" => "draft",
      "issuedOn" => "2026-11-12"
    )
    expect(invoice.dig("total", "minor")).to eq(1250)
    expect(page_body.dig("props", "can", "invoice.read", "allowed")).to be(true)
  end

  it "sends the standard offset query and builds the pagination links in Rails" do
    fixture = JSON.parse(fixture_path.read)
    fixture["data"] = fixture.fetch("data").first(1)
    fixture["pagination"] = { "kind" => "offset", "page" => 2, "perPage" => 25, "total" => 60, "pageCount" => 3 }
    stub_request(:get, "http://localhost:4000/invoices")
      .with(query: hash_including("page" => "2", "per_page" => "25"))
      .to_return(status: 200, body: fixture.to_json, headers: { "Content-Type" => "application/json" })

    get "/en/billing/invoices?page=2&per_page=25", headers: read_headers

    expect(response).to have_http_status(:ok)
    data = page_body.dig("props", "data")
    expect(data["previousHref"]).to include("page=1")
    expect(data["previousHref"]).to include("per_page=25")
    expect(data["nextHref"]).to include("page=3")
    expect(data["nextHref"]).to include("per_page=25")
  end

  it "denies a viewer without the invoice read grant" do
    get "/en/billing/invoices", headers: auth_headers

    expect(response).to have_http_status(:forbidden)
  end
end
