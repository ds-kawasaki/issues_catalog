module IssuesCatalogSettingsHelper
  include CatalogTagsHelper

  def edit_project_catalog_tag_path(tag)
    '/projects/' + @project.identifier.to_s + '/catalog_tags/' + tag.id.to_s + '/edit'
  end

  def select_catalog_tags(project)
    tags = project.catalog_tags.to_a
    # タグカテゴリ割り当ててるけど、未使用のタグを追加して手動で割り当て解除できるように
    categories = project.catalog_tag_categories.pluck('catalog_tag_categories.id')
    ActsAsTaggableOn::Tag.includes(:catalog_relation_tag_categories)
                         .where(catalog_relation_tag_categories: {catalog_tag_category_id: categories})
                         .order('tags.name')
                         .each do |t|
      unless tags.index {|v| v.id == t.id }
        tags.append(t)
      end
    end
    tags
  end
end
