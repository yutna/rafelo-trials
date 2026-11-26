require_relative "lib/rafelo_trials/example_orders/version"

Gem::Specification.new do |spec|
  spec.name = "rafelo_trials_example_orders"
  spec.version = RafeloTrials::ExampleOrders::VERSION
  spec.authors = [ "Yutthana Siphuengchai" ]
  spec.summary = "RafeloTrials example orders module"
  spec.description = "The example_orders product module of the RafeloTrials BFF template."
  spec.license = "MIT"
  spec.files = Dir["lib/**/*", "app/**/*", "config/**/*", "db/**/*", "package.yml"]
  spec.require_paths = [ "lib" ]
end
