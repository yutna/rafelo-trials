# frozen_string_literal: true

module RafeloTrials
  module Billing
    class InvoicesGateway < Rafelo::Core::Gateway
      upstream :api
      token :viewer

      def list(query)
        payload = parse(
          client.get(
            "invoices",
            params: {
              page: query.page,
              per_page: query.per_page,
              sort: query.sort,
              direction: query.sort && query.direction
            }.compact
          ).body
        )
        items = Array(payload["data"]).map { |row| invoice(row) }
        InvoicesPage.new(items: items, total: payload.dig("pagination", "total").to_i)
      end

      def create(payload:, idempotency_key:)
        response = client.post(
          "invoices",
          body: payload.to_json,
          headers: { "Content-Type" => "application/json" },
          idempotency_key: idempotency_key
        )
        invoice(parse(response.body).fetch("data"))
      end

      private

      def invoice(row)
        Invoice.new(
          id: row.fetch("id").to_s,
          number: row.fetch("number"),
          customer_name: row.fetch("customer_name"),
          status: row.fetch("status"),
          total_minor: row.fetch("total_minor"),
          currency: row.fetch("currency"),
          issued_on: row.fetch("issued_on")
        )
      end

      def parse(body)
        JSON.parse(body.to_s)
      rescue JSON::ParserError, TypeError
        raise Rafelo::Core::ApplicationError.new("unexpected", "Upstream returned malformed JSON")
      end
    end
  end
end
