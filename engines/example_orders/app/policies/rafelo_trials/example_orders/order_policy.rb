# frozen_string_literal: true

module RafeloTrials
  module ExampleOrders
    class OrderPolicy < Rafelo::Core::BasePolicy
      def index? = permissions.allows?(RafeloTrials::ExampleOrders::Permissions::ORDER_READ)
      def show? = index?
      def new? = permissions.allows?(RafeloTrials::ExampleOrders::Permissions::ORDER_CREATE)
      def create? = new?
      def edit? = permissions.allows?(RafeloTrials::ExampleOrders::Permissions::ORDER_UPDATE)
      def update? = edit?
      def export? = permissions.allows?(RafeloTrials::ExampleOrders::Permissions::ORDER_EXPORT)
    end
  end
end
