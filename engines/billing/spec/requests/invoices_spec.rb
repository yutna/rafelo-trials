require "rails_helper"

RSpec.describe "Billing invoices", type: :request do
  let(:locale) { I18n.default_locale }
  let(:fixture) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/index.json") }
  let(:create_fixture) { Rails.root.join("engines/billing/spec/fixtures/upstream/invoices/create.json") }
  let(:upstream_base_url) { Rails.application.config.x.upstreams.fetch(:api).base_url }
  let(:headers) { auth_headers(grants: [ RafeloTrials::Billing::Permissions::INVOICE_READ ]) }
  let(:write_headers) do
    auth_headers(
      grants: [
        RafeloTrials::Billing::Permissions::INVOICE_READ,
        RafeloTrials::Billing::Permissions::INVOICE_CREATE
      ]
    )
  end

  def stub_invoices(body, query: hash_including({}))
    stub_request(:get, "#{upstream_base_url}/invoices")
      .with(query: query)
      .to_return(status: 200, body: body, headers: { "Content-Type" => "application/json" })
  end

  def stub_create_invoice(status: 201, body: create_fixture.read)
    stub_request(:post, "#{upstream_base_url}/invoices")
      .to_return(status: status, body: body, headers: { "Content-Type" => "application/json" })
  end

  def page_body
    PageMatchers.page_of(response)
  end

  def form_token(headers, path = "/#{locale}/billing/invoices/new")
    get path, headers: headers
    page_body.dig("props", "meta", "formToken")
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

  it "offers the add-invoice link only to a viewer with the invoice create grant" do
    stub_invoices(fixture.read)

    get "/#{locale}/billing/invoices", headers: write_headers

    expect(page_body.dig("props", "can", "invoice.create", "allowed")).to be(true)
    expect(page_body.dig("props", "data", "newHref")).to eq("/#{locale}/billing/invoices/new")

    get "/#{locale}/billing/invoices", headers: headers

    expect(page_body.dig("props", "can", "invoice.create", "allowed")).to be(false)
  end

  it "renders the new invoice form contract" do
    expect { get "/#{locale}/billing/invoices/new", headers: write_headers }
      .to within_budgets("billing/invoices/new")

    expect(response).to have_http_status(:ok)
    expect(response).to match_page_schema("billing/invoices/new")
    expect(response).to be_within_props_budget("billing/invoices/new")
    expect(response).to have_resolvable_hrefs("billing/invoices/new")
    expect(response).to match_policy_capabilities("billing/invoices/new")
    expect(page_body.dig("props", "meta", "formToken")).to be_present
    expect(page_body.dig("props", "data", "createHref")).to eq("/#{locale}/billing/invoices")
  end

  it "creates an invoice, returns to the list with 303, and replays without a second call" do
    token = form_token(write_headers)
    stub_create_invoice
    params = { customerName: "Ada Example", status: "open", total: 1250, token: token }

    post "/#{locale}/billing/invoices", params: params, headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/#{locale}/billing/invoices")
    expect(
      a_request(:post, "#{upstream_base_url}/invoices")
        .with(body: /"customer_name":"Ada Example".*"status":"open".*"total_minor":1250.*"currency":"THB"/)
    ).to have_been_made.once
    expect(Rafelo::Core::IdempotencyKey.count).to eq(1)
    event = Rafelo::Core::AuditEvent.where(event: "write", outcome: "success").last
    expect(event.resource).to eq("rafelo_trials/billing/invoices")
    expect(event.action).to eq("create")
    expect(event.upstream_id).to eq("inv_101")

    post "/#{locale}/billing/invoices", params: params, headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/#{locale}/billing/invoices")
    expect(a_request(:post, "#{upstream_base_url}/invoices")).to have_been_made.once
  end

  it "returns to the form with an error next to each bad field" do
    token = form_token(write_headers)

    post "/#{locale}/billing/invoices",
         params: { customerName: "", status: "draft", total: "12.5", token: token },
         headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/#{locale}/billing/invoices/new")
    expect(a_request(:post, "#{upstream_base_url}/invoices")).not_to have_been_made

    follow_redirect(write_headers.fetch("Cookie"))
    errors = page_body.dig("props", "errors")
    expect(errors["customerName"]).to be_present
    expect(errors["status"]).to be_present
    expect(errors["total"]).to be_present
  end

  it "maps an upstream 422 to translated field errors" do
    token = form_token(write_headers)
    stub_create_invoice(
      status: 422,
      body: { errors: { customer_name: [ "taken" ], unexpected: [ "invalid" ] } }.to_json
    )

    post "/#{locale}/billing/invoices",
         params: { customerName: "Ada Example", status: "open", total: 1250, token: token },
         headers: write_headers

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("/#{locale}/billing/invoices/new")

    follow_redirect(write_headers.fetch("Cookie"))
    errors = page_body.dig("props", "errors")
    expect(errors["customerName"]).to eq("has already been taken")
    expect(errors["base"]).to eq("is not valid")
  end

  it "forbids a viewer without the read grant before calling the upstream" do
    get "/#{locale}/billing/invoices", headers: auth_headers(grants: [])

    expect(response).to have_http_status(:forbidden)
    expect(a_request(:get, "#{upstream_base_url}/invoices")).not_to have_been_made
  end

  it "refuses the new page and create to a viewer without the create grant" do
    get "/#{locale}/billing/invoices/new", headers: headers
    expect(response).to have_http_status(:forbidden)

    post "/#{locale}/billing/invoices",
         params: { customerName: "Ada Example", status: "open", total: 1250, token: "unused" },
         headers: headers

    expect(response).to have_http_status(:forbidden)
    expect(a_request(:post, "#{upstream_base_url}/invoices")).not_to have_been_made
  end
end
