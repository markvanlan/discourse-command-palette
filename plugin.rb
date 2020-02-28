# frozen_string_literal: true

# name: discourse-command-palette
# about: Get around Discourse even faster
# version: 0.1
# authors: Mark VanLandingham

enabled_site_setting :command_palette_enabled
hide_plugin if self.respond_to?(:hide_plugin)

PLUGIN_NAME ||= -"discourse-command-palette"

after_initialize do

  module ::CommandPallete
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace CommandPallete
    end
  end

  CommandPallete::Engine.routes.draw do
  end

  Discourse::Application.routes.append do
    mount ::CommandPallete::Engine, at: '/command-palette'
  end
end
