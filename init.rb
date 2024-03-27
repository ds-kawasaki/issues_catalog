require 'redmine'

ActiveSupport::Reloader.to_prepare do
  paths = '/lib/issues_catalog/{patches/*_patch,hooks/*_hook}.rb'
  Dir.glob(File.dirname(__FILE__) + paths).each do |file|
    require file
  end
end


Redmine::Plugin.register :issues_catalog do
  name 'Issues Catalog plugin'
  author 'ds-kawasaki'
  description 'issues catalog plugin for Redmine'
  version '1.1.5'
  url 'https://github.com/ds-kawasaki/issues_catalog'
  author_url 'https://github.com/ds-kawasaki'

  # permission setting
  project_module :issues_catalog do
    permission :use_issues_catalog, { issues_catalog: [:index] }, public: true
  end

  # menu setting
  menu :project_menu, :issues_catalog, { controller: 'issues_catalog', action: 'index' }, caption: :label_catalog, before: :issues, param: :project_id

  # configer setting
  settings default: { 'empty' => true }, partial: 'issues_catalog_settings/settings'
end
