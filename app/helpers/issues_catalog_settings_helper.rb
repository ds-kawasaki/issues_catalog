module IssuesCatalogSettingsHelper
  include CatalogTagsHelper

  def edit_project_catalog_tag_path(tag)
    '/projects/' + @project.identifier.to_s + '/catalog_tags/' + tag.id.to_s + '/edit'
  end
end
