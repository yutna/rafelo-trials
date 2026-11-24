# frozen_string_literal: true

require "rails/engine"
require "rafelo_core"

module RafeloTrials
  module ExampleOrders
    class Engine < ::Rails::Engine
      isolate_namespace RafeloTrials::ExampleOrders

      initializer "rafelo_trials_example_orders.migration_paths" do |app|
        config.paths["db/migrate"].expanded.each { |path| app.config.paths["db/migrate"] << path }
      end
    end
  end
end
