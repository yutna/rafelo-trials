require_relative "../rails_helper"

RSpec.describe "Billing invoices", type: :request do
  let(:locale) { I18n.default_locale }
  let(:upstream_base_url) { Rails.application.config.x.upstreams.fetch(:api).base_url }
  let(:fixture) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/index.json") }
  let(:inertia_headers) do
    {
      "X-Inertia" => "true",
      "X-Inertia-Version" => Rafelo::Core::AssetVersion.call
    }
  end
  let(:headers) do
    auth_headers(grants: [ RafeloTrials::Billing::Permissions::INVOICE_READ ]).merge(inertia_headers)
  end

  def stub_invoices(body, query: hash_including({}))
    stub_request(:get, "#{upstream_base_url}/invoices")
      .with(query: query)
      .to_return(status: 200, body: body, headers: { "Content-Type" => "application/json" })
  end

  def page_body
    PageMatchers.page_of(response)
  end

  it "renders the index page contract at the maximum page size" do
    stub_invoices(fixture.read, query: hash_including("page" => "1", "per_page" => "100"))

    expect { get "/#{locale}/billing/invoices?per_page=100", headers: headers }
      .to within_budgets("billing/invoices/index")

    expect(response).to have_http_status(:ok)
    expect(response).to match_page_schema("billing/invoices/index")
    expect(response).to be_within_props_budget("billing/invoices/index")
    expect(response).to have_resolvable_hrefs("billing/invoices/index")
    expect(response).to match_policy_capabilities("billing/invoices/index")
    expect(page_body.dig("props", "data", "items").length).to eq(Rafelo::Core::ListQuery.max_per_page)
  end

  it "lists the invoice number, customer name, status, total, and issue date" do
    stub_invoices(fixture.read, query: hash_including("per_page" => "25"))

    get "/#{locale}/billing/invoices", headers: headers

    item = page_body.dig("props", "data", "items").first
    expect(item).to include(
      "number" => "INV-001",
      "customerName" => "Customer 1",
      "status" => "draft",
      "issuedOn" => "2026-01-01"
    )
    expect(item.fetch("total")).to eq("minor" => 1250, "currency" => "THB", "exponent" => 2)
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

  it "forbids a viewer without the read grant before calling the upstream" do
    forbidden = auth_headers(grants: []).merge(inertia_headers)

    get "/#{locale}/billing/invoices", headers: forbidden

    expect(response).to have_http_status(:forbidden)
    expect(a_request(:get, "#{upstream_base_url}/invoices")).not_to have_been_made
  end
end
