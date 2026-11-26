require_relative "lib/rafelo_trials/example_customers/version"

Gem::Specification.new do |spec|
  spec.name = "rafelo_trials_example_customers"
  spec.version = RafeloTrials::ExampleCustomers::VERSION
  spec.authors = [ "Yutthana Siphuengchai" ]
  spec.summary = "RafeloTrials example customers domain"
  spec.description = "The example_customers domain engine of the RafeloTrials BFF template."
  spec.license = "MIT"
  spec.files = Dir["lib/**/*", "app/**/*", "config/**/*", "package.yml"]
  spec.require_paths = [ "lib" ]
end
