# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesNewProps < Rafelo::Core::PageProps
      policy_class RafeloTrials::Billing::InvoicePolicy
      capability RafeloTrials::Billing::Permissions::INVOICE_CREATE, :create?

      def envelope
        {
          data: {
            createPath: context.urls.route(:billing, :invoices),
            indexPath: context.urls.route(:billing, :invoices)
          },
          meta: { formToken: Rafelo::Core::FormToken.issue(session_id: Rafelo::Core::Current.session&.id) },
          query: {},
          pagination: nil,
          can: capabilities(RafeloTrials::Billing::Permissions::INVOICE_CREATE)
        }
      end
    end
  end
end
