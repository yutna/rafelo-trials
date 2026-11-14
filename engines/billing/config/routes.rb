# frozen_string_literal: true

RafeloTrials::Billing::Engine.routes.draw do
  resources :invoices, only: %i[index new create destroy]
  root to: "invoices#index"
end
