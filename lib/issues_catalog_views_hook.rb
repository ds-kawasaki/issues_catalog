class IssuesCatalogViewsHookListener < Redmine::Hook::ViewListener
  render_on :view_issues_sidebar_issues_bottom, partial: 'issues/issues_catalog_sidebar'
end