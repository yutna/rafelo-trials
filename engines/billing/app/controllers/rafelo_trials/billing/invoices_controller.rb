# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesController < Rafelo::Core::BaseController
      layout "application"

      throttle to: 30, within: 1.minute, only: :create, name: "billing/invoices/write"

      def index
        authorize :invoice, :index?, policy_class: InvoicePolicy
        query = Rafelo::Core::ListQuery.from(params, sort: %w[number issued_on total])
        page = gateway(InvoicesGateway).list(query)
        render_page "billing/invoices/index",
                    props: InvoicesIndexProps.new(context: page_context, page: page, query: query)
      end

      def new
        authorize :invoice, :new?, policy_class: InvoicePolicy
        render_page "billing/invoices/new", props: InvoicesNewProps.new(context: page_context)
      end

      def create
        authorize :invoice, :create?, policy_class: InvoicePolicy
        form = InvoiceForm.new(params.permit(:customer_name, :status, :total, :token))
        back = page_context.urls.route(:billing, :new_invoice)
        return redirect_after_write(back, errors: form.error_messages) if form.invalid?

        Rafelo::Core::IdempotencyClaim.call(
          self, token: form.token, payload: form.payload, back: back,
          session_id: Rafelo::Core::Current.session&.id,
          viewer_id: Rafelo::Core::Current.viewer&.id
        ) do |idempotency_key|
          invoice = gateway(InvoicesGateway).create(payload: form.payload, idempotency_key: idempotency_key)
          request.env["rafelo.audit.upstream_id"] = invoice.id.to_s
          redirect_after_write(
            page_context.urls.route(:billing, :invoices),
            notice: t("billing.invoices.created", number: invoice.number)
          )
        end
      rescue Rafelo::Core::ValidationFailed => error
        redirect_after_write(back, errors: form.translate(error.field_codes))
      rescue Rafelo::Core::ApplicationError => error
        raise unless error.code == "resource.conflict"

        redirect_after_write(back, errors: { "base" => I18n.t("billing.invoices.conflict") })
      end
    end
  end
end
