# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesController < Rafelo::Core::BaseController
      layout "application"

      def index
        authorize :invoice, :index?, policy_class: InvoicePolicy
        query = Rafelo::Core::ListQuery.from(params, sort: [])
        page = gateway(InvoicesGateway).list(query)
        render_page "billing/invoices/index",
                    props: InvoicesIndexProps.new(context: page_context, page: page, query: query)
      end
    end
  end
end
