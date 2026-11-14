# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicePolicy < Rafelo::Core::BasePolicy
      def index? = permissions.allows?(RafeloTrials::Billing::Permissions::INVOICE_READ)

      def new? = permissions.allows?(RafeloTrials::Billing::Permissions::INVOICE_CREATE)

      def create? = new?

      def destroy? = permissions.allows?(RafeloTrials::Billing::Permissions::INVOICE_DELETE)
    end
  end
end
