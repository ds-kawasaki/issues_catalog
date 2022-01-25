require 'projects_helper'

module IssuesCatalog
  module Patches
    module ProjectsHelperMethodsIssuesCatalog
      def project_settings_tabs
        tabs = super

        action = { name: 'issues_catalog',
          action: :show,
          partial: 'issues_catalog_settings/show',
          onclick: 'showTab(\'issues_catalog\', this.href); showTab(\'manage_tags\', this.href)',
          label: :issues_catalog }
        tabs << action if @project.module_enabled?(:issues_catalog)

        tabs
      end
    end
  end
end


# prependだと本番環境で動かない 暫定対応
# ProjectsHelper.prepend(IssuesCatalog::Patches::ProjectsHelperMethodsIssuesCatalog)
ProjectsController.send :helper, IssuesCatalog::Patches::ProjectsHelperMethodsIssuesCatalog