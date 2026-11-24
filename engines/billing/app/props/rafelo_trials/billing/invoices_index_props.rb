# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesIndexProps < Rafelo::Core::PageProps
      policy_class RafeloTrials::Billing::InvoicePolicy
      capability RafeloTrials::Billing::Permissions::INVOICE_READ, :index?

      def initialize(context:, page:, query:)
        super(context: context)
        @page = page
        @query = query
      end

      def envelope
        {
          data: {
            items: @page.items.map { |invoice| row(invoice) },
            previousHref: previous_href,
            nextHref: next_href
          },
          meta: {},
          query: @query.to_h,
          pagination: {
            kind: "offset",
            page: @query.page,
            perPage: @query.per_page,
            total: @page.total,
            pageCount: page_count
          },
          can: capabilities(RafeloTrials::Billing::Permissions::INVOICE_READ)
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
          issuedOn: invoice.issued_on
        }
      end

      def previous_href
        return if @query.page <= 1

        page_href(@query.page - 1)
      end

      def next_href
        return if @query.page >= page_count

        page_href(@query.page + 1)
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
