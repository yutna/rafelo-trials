require "rails_helper"

RSpec.describe "Billing invoices", type: :request do
  let(:locale) { I18n.default_locale }
  let(:fixture) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/index.json") }
  let(:upstream_base_url) { Rails.application.config.x.upstreams.fetch(:api).base_url }
  let(:headers) { auth_headers(grants: [ RafeloTrials::Billing::Permissions::INVOICE_READ ]) }

  def stub_invoices(body, query: hash_including({}))
    stub_request(:get, "#{upstream_base_url}/invoices")
      .with(query: query)
      .to_return(status: 200, body: body, headers: { "Content-Type" => "application/json" })
  end

  def page_body
    PageMatchers.page_of(response)
  end

  it "renders the index page contract at the maximum page size" do
    stub_invoices(fixture.read, query: hash_including("page" => "1", "per_page" => Rafelo::Core::ListQuery.max_per_page.to_s))

    expect {
      get "/#{locale}/billing/invoices?per_page=#{Rafelo::Core::ListQuery.max_per_page}", headers: headers
    }.to within_budgets("billing/invoices/index")

    expect(response).to have_http_status(:ok)
    expect(response).to match_page_schema("billing/invoices/index")
    expect(response).to be_within_props_budget("billing/invoices/index")
    expect(response).to have_resolvable_hrefs("billing/invoices/index")
    expect(response).to match_policy_capabilities("billing/invoices/index")
    expect(page_body.dig("props", "data", "items").length).to eq(Rafelo::Core::ListQuery.max_per_page)
  end

  it "lists the invoice number, customer name, status, total, and issue date" do
    stub_invoices(fixture.read)

    get "/#{locale}/billing/invoices", headers: headers

    expect(response).to have_http_status(:ok)
    expect(page_body.dig("props", "data", "items").first).to eq(
      "id" => "inv_1",
      "number" => "INV-001",
      "customerName" => "Customer 1",
      "status" => "draft",
      "total" => { "minor" => 1250, "currency" => "THB", "exponent" => 2 },
      "issuedOn" => "2026-01-01"
    )
  end

  it "links to the previous and next pages" do
    body = {
      data: [
        {
          id: "inv_26",
          number: "INV-026",
          customer_name: "Customer 26",
          status: "issued",
          total_minor: 2175,
          currency: "THB",
          issued_on: "2026-01-26"
        }
      ],
      pagination: { kind: "offset", page: 2, perPage: 25, total: 60, pageCount: 3 }
    }.to_json
    stub_invoices(body, query: hash_including("page" => "2", "per_page" => "25"))

    get "/#{locale}/billing/invoices?page=2&per_page=25", headers: headers

    data = page_body.dig("props", "data")
    expect(data.fetch("previousHref")).to include("page=1")
    expect(data.fetch("nextHref")).to include("page=3")
  end

  it "serves the index from the module root and marks the navigation entry current" do
    stub_invoices(fixture.read)

    get "/#{locale}/billing", headers: headers

    page = page_body
    entry = page.dig("props", "nav").find { |item| item["key"] == "billing" }
    expect(response).to have_http_status(:ok)
    expect(page["component"]).to eq("billing/invoices/index")
    expect(entry["path"]).to eq("/#{locale}/billing/")
    expect(entry["current"]).to be(true)
  end

  it "forbids a viewer without the read grant before calling the upstream" do
    get "/#{locale}/billing/invoices", headers: auth_headers(grants: [])

    expect(response).to have_http_status(:forbidden)
    expect(a_request(:get, "#{upstream_base_url}/invoices")).not_to have_been_made
  end
end
