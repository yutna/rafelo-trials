# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoiceForm < Rafelo::Core::Form
      attribute :customer_name, :string
      attribute :status, :string
      attribute :total, :string

      validates :customer_name, presence: true, length: { maximum: 80 }
      validates :status, inclusion: { in: %w[open paid cancelled] }
      validates :total, presence: true
      validates :total, format: { with: /\A\d+\z/ }, allow_blank: true

      def payload
        {
          customer_name: customer_name,
          status: status,
          total_minor: total.to_i,
          currency: "THB"
        }
      end
    end
  end
end
