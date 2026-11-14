# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesIndexProps < Rafelo::Core::PageProps
      policy_class RafeloTrials::Billing::InvoicePolicy
      capability RafeloTrials::Billing::Permissions::INVOICE_READ, :index?
      capability RafeloTrials::Billing::Permissions::INVOICE_CREATE, :create?
      capability RafeloTrials::Billing::Permissions::INVOICE_DELETE, :destroy?

      def initialize(context:, page:, query:)
        super(context: context)
        @page = page
        @query = query
      end

      def envelope
        {
          data: {
            items: @page.items.map { |invoice| row(invoice) },
            newHref: context.urls.route(:billing, :new_invoice),
            previousHref: @query.page > 1 ? page_href(@query.page - 1) : nil,
            nextHref: @query.page < page_count ? page_href(@query.page + 1) : nil
          },
          meta: { formToken: Rafelo::Core::FormToken.issue(session_id: Rafelo::Core::Current.session&.id) },
          query: @query.to_h,
          pagination: {
            kind: "offset",
            page: @query.page,
            perPage: @query.per_page,
            total: @page.total,
            pageCount: page_count
          },
          can: capabilities(
            RafeloTrials::Billing::Permissions::INVOICE_READ,
            RafeloTrials::Billing::Permissions::INVOICE_CREATE,
            RafeloTrials::Billing::Permissions::INVOICE_DELETE
          )
        }
      end

      private

      def row(invoice)
        {
          id: invoice.id,
          number: invoice.number,
          customerName: invoice.customer_name,
          status: invoice.status,
          total: Rafelo::Core::Money.wire(invoice.total_minor, invoice.currency),
          issuedOn: invoice.issued_on,
          deleteHref: context.urls.route(:billing, :invoice, id: invoice.id)
        }
      end

      def page_href(page)
        context.urls.route(:billing, :invoices, page: page, per_page: @query.per_page)
      end

      def page_count
        [ (@page.total.to_f / @query.per_page).ceil, 1 ].max
      end
    end
  end
end
