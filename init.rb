Redmine::Plugin.register :issues_catalog do
  name 'Issues Catalog plugin'
  author 'ds-kawasaki'
  description 'issues catalog plugin for Redmine'
  version '0.0.1'
  url 'https://github.com/ds-kawasaki/issues_catalog'
  author_url 'https://github.com/ds-kawasaki/issues_catalog'

  # permission setting
  project_module :issues_catalog do
    permission :use_issues_catalog, { issues_catalog: [:index] }, public: true
  end

  # menu setting
  menu :project_menu, :issues_catalog, { controller: 'issues_catalog', action: 'index' }, caption: :label_issues_catalog_plural, after: :roadmap, param: :project_id

end
