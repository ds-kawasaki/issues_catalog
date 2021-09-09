module IssuesCatalog
  module Hooks
    class ViewContextMenuHook < Redmine::Hook::ViewListener
      render_on :view_issues_context_menu_start, partial: 'issues_catalog/add_context_menu'
      render_on :view_issues_fields_mapping_bottom, partial: 'catalog_tags/add_issues_fields_mapping'
    end
  end
end
