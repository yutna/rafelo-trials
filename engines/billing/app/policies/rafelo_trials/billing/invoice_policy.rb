# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicePolicy < Rafelo::Core::BasePolicy
      def index? = permissions.allows?(RafeloTrials::Billing::Permissions::INVOICE_READ)
    end
  end
end
