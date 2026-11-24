require_relative "../rails_helper"

RSpec.describe RafeloTrials::Billing::InvoiceForm do
  def form(attributes)
    described_class.new({ token: "token" }.merge(attributes))
  end

  it "accepts a whole total and submits minor units in THB" do
    invoice = form(customer_name: "Ada Example", status: "paid", total: "1250")

    expect(invoice).to be_valid
    expect(invoice.payload).to eq(
      customer_name: "Ada Example",
      status: "paid",
      total_minor: 1250,
      currency: "THB"
    )
  end

  it "accepts the cancelled status and a zero total" do
    invoice = form(customer_name: "Ada Example", status: "cancelled", total: "0")

    expect(invoice).to be_valid
  end

  it "rejects an unknown status" do
    invoice = form(customer_name: "Ada Example", status: "draft", total: "1250")

    expect(invoice).not_to be_valid
    expect(invoice.error_messages).to include("status")
  end

  it "rejects a total that is not a whole number" do
    invoice = form(customer_name: "Ada Example", status: "open", total: "12.50")

    expect(invoice).not_to be_valid
    expect(invoice.error_messages).to include("total")
  end

  it "rejects a missing customer name and a name over 80 characters" do
    expect(form(customer_name: "", status: "open", total: "1250").error_messages).to include("customerName")

    invoice = form(customer_name: "a" * 81, status: "open", total: "1250")

    expect(invoice).not_to be_valid
    expect(invoice.error_messages).to include("customerName")
  end
end
