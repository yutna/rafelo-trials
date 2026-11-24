# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesController < Rafelo::Core::BaseController
      layout "application"

      throttle to: 30, within: 1.minute, only: %i[create destroy], name: "billing/invoices/write"

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

      def destroy
        authorize :invoice, :destroy?, policy_class: InvoicePolicy
        back = index_href
        Rafelo::Core::IdempotencyClaim.call(
          self,
          token: params[:token],
          payload: { id: params[:id].to_s },
          back: back,
          session_id: Rafelo::Core::Current.session&.id,
          viewer_id: Rafelo::Core::Current.viewer&.id
        ) do |idempotency_key|
          gateway(InvoicesGateway).delete(id: params[:id].to_s, idempotency_key: idempotency_key)
          request.env["rafelo.audit.upstream_id"] = params[:id].to_s
          redirect_after_write(back, notice: t("billing.invoices.deleted"))
        end
      rescue Rafelo::Core::ApplicationError => error
        raise unless error.code == "resource.conflict"

        redirect_after_write(back, errors: { "base" => t("billing.invoices.delete_failed") })
      end

      private

      # The delete returns the viewer to the page they left, never to page 1 of
      # the list; ListQuery normalizes the values the same way the index does.
      def index_href
        return page_context.urls.route(:billing, :invoices) if params[:page].blank? && params[:per_page].blank?

        query = Rafelo::Core::ListQuery.from(params, sort: %w[number issued_on total])
        page_context.urls.route(:billing, :invoices, page: query.page, per_page: query.per_page)
      end
    end
  end
end
