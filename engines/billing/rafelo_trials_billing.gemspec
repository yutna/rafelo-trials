require_relative "lib/rafelo_trials/billing/version"

Gem::Specification.new do |spec|
  spec.name = "rafelo_trials_billing"
  spec.version = RafeloTrials::Billing::VERSION
  spec.authors = [ "Yutthana Siphuengchai" ]
  spec.summary = "Rafelo billing module"
  spec.description = "The billing product module of the Rafelo BFF template."
  spec.license = "MIT"
  spec.files = Dir["lib/**/*", "app/**/*", "config/**/*", "db/**/*", "package.yml"]
  spec.require_paths = [ "lib" ]
end
