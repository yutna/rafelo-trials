require "rails_helper"

RSpec.describe "Billing invoices", type: :request do
  let(:fixture_path) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/index.json") }
  let(:create_fixture_path) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/create.json") }
  let(:read_headers) { auth_headers(grants: [ "billing:invoice:read" ]) }
  let(:write_headers) { auth_headers(grants: [ "billing:invoice:read", "billing:invoice:create" ]) }
  let(:delete_headers) { auth_headers(grants: [ "billing:invoice:read", "billing:invoice:delete" ]) }

  def stub_invoices(payload)
    stub_request(:get, "http://localhost:4000/invoices")
      .with(query: hash_including({}))
      .to_return(status: 200, body: payload.to_json, headers: { "Content-Type" => "application/json" })
  end

  def stub_create_invoice
    stub_request(:post, "http://localhost:4000/invoices")
      .to_return(status: 201, body: create_fixture_path.read, headers: { "Content-Type" => "application/json" })
  end

  def stub_delete_invoice(id = "inv_1", status: 204)
    stub_request(:delete, "http://localhost:4000/invoices/#{id}")
      .to_return(status: status, body: "")
  end

  def form_token(headers, path = "/en/billing/invoices/new")
    get path, headers: headers
    PageMatchers.page_of(response).dig("props", "meta", "formToken")
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
    expect(invoice["deleteHref"]).to eq("/en/billing/invoices/inv_1")
    expect(page_body.dig("props", "meta", "formToken")).to be_present
    expect(page_body.dig("props", "can", "invoice.read", "allowed")).to be(true)
    expect(page_body.dig("props", "can", "invoice.delete", "allowed")).to be(false)
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

  it "offers the create link only to a viewer with the invoice create grant" do
    stub_invoices(JSON.parse(fixture_path.read))

    get "/en/billing/invoices", headers: write_headers
    expect(page_body.dig("props", "can", "invoice.create", "allowed")).to be(true)
    expect(page_body.dig("props", "data", "newHref")).to eq("/en/billing/invoices/new")

    get "/en/billing/invoices", headers: read_headers
    expect(page_body.dig("props", "can", "invoice.create", "allowed")).to be(false)
  end

  it "renders the new invoice form within its contract and budgets" do
    expect { get "/en/billing/invoices/new", headers: write_headers }
      .to within_budgets("billing/invoices/new")

    expect(response).to have_http_status(:ok)
    expect(response).to match_page_schema("billing/invoices/new")
    expect(response).to be_within_props_budget("billing/invoices/new")
    expect(response).to have_resolvable_hrefs("billing/invoices/new")
    expect(response).to match_policy_capabilities("billing/invoices/new")
    expect(page_body.dig("props", "meta", "formToken")).to be_present
    expect(page_body.dig("props", "can", "invoice.create", "allowed")).to be(true)
  end

  it "creates an invoice through the gateway, returns to the list with 303, and replays without a second call" do
    token = form_token(write_headers)
    stub_create_invoice
    params = { customerName: "Ada Example", status: "open", total: 1250, token: token }

    post "/en/billing/invoices", params: params, headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/en/billing/invoices")
    expect(
      a_request(:post, "http://localhost:4000/invoices")
        .with(body: /"customer_name":"Ada Example".*"total_minor":1250.*"currency":"THB"/)
    ).to have_been_made.once
    expect(Rafelo::Core::IdempotencyKey.count).to eq(1)

    post "/en/billing/invoices", params: params, headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/en/billing/invoices")
    expect(a_request(:post, "http://localhost:4000/invoices")).to have_been_made.once
  end

  it "returns to the form with errors next to each bad field" do
    token = form_token(write_headers)

    post "/en/billing/invoices",
         params: { customerName: "", status: "draft", total: "12.5", token: token },
         headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/en/billing/invoices/new")
    expect(a_request(:post, "http://localhost:4000/invoices")).not_to have_been_made

    follow_redirect(write_headers.fetch("Cookie"))
    errors = page_body.dig("props", "errors")
    expect(errors["customerName"]).to be_present
    expect(errors["status"]).to be_present
    expect(errors["total"]).to be_present
  end

  it "denies a viewer without the invoice create grant" do
    post "/en/billing/invoices",
         params: { customerName: "Ada Example", status: "open", total: 1250, token: "unused" },
         headers: read_headers

    expect(response).to have_http_status(:forbidden)
    expect(a_request(:post, "http://localhost:4000/invoices")).not_to have_been_made
  end

  it "offers the delete control and its href only to a viewer with the invoice delete grant" do
    stub_invoices(JSON.parse(fixture_path.read))

    get "/en/billing/invoices", headers: delete_headers
    expect(page_body.dig("props", "can", "invoice.delete", "allowed")).to be(true)
    expect(page_body.dig("props", "data", "items", 0, "deleteHref")).to eq("/en/billing/invoices/inv_1")

    get "/en/billing/invoices", headers: write_headers
    expect(page_body.dig("props", "can", "invoice.delete", "allowed")).to be(false)
  end

  it "deletes an invoice through the gateway, returns to the list with 303, and replays without a second call" do
    stub_invoices(JSON.parse(fixture_path.read))
    get "/en/billing/invoices", headers: delete_headers
    token = page_body.dig("props", "meta", "formToken")
    stub_delete_invoice

    delete "/en/billing/invoices/inv_1", params: { token: token }, headers: delete_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/en/billing/invoices")
    expect(a_request(:delete, "http://localhost:4000/invoices/inv_1")).to have_been_made.once
    expect(Rafelo::Core::IdempotencyKey.count).to eq(1)

    delete "/en/billing/invoices/inv_1", params: { token: token }, headers: delete_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/en/billing/invoices")
    expect(a_request(:delete, "http://localhost:4000/invoices/inv_1")).to have_been_made.once
  end

  it "treats an invoice the upstream already deleted as deleted" do
    stub_invoices(JSON.parse(fixture_path.read))
    get "/en/billing/invoices", headers: delete_headers
    token = page_body.dig("props", "meta", "formToken")
    stub_delete_invoice(status: 404)

    delete "/en/billing/invoices/inv_1", params: { token: token }, headers: delete_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/en/billing/invoices")
  end

  it "denies a viewer without the invoice delete grant" do
    delete "/en/billing/invoices/inv_1", params: { token: "unused" }, headers: read_headers

    expect(response).to have_http_status(:forbidden)
    expect(a_request(:delete, "http://localhost:4000/invoices/inv_1")).not_to have_been_made
  end
end
