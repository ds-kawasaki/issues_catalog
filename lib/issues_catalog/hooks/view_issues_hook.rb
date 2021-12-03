module IssuesCatalog
  module Hooks
    class ViewIssuesHook < Redmine::Hook::ViewListener
      render_on :view_issues_context_menu_start, partial: 'issues_catalog/add_context_menu'
      render_on :view_issues_show_description_bottom, partial: 'issues_catalog/add_show_description'
    end
  end
end
