# frozen_string_literal: true

Rails.application.config.session_store :cookie_store,
  key: Rails.env.production? ? "__Host-rafelo_trials_session" : "rafelo_trials_session",
  secure: !Rails.env.local?,
  httponly: true,
  same_site: :lax
