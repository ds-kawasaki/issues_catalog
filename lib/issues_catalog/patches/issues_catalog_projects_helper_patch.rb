require_dependency 'projects_helper'

module ProjectsHelperMethodsIssuesCatalog
  def project_settings_tabs
    tabs = super

    action = { name: 'issues_catalog',
      action: :show,
      partial: 'issues_catalog_settings/show',
      label: :issues_catalog }
    tabs << action if @project.module_enabled?(:issues_catalog)

    tabs
  end
end

ProjectsHelper.prepend(ProjectsHelperMethodsIssuesCatalog)