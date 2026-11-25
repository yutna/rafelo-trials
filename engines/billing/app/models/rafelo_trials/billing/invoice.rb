# frozen_string_literal: true

module RafeloTrials
  module Billing
    Invoice = Data.define(:id, :number, :customer_name, :status, :total_minor, :currency, :issued_on)

    InvoicesPage = Data.define(:items, :total)
  end
end
