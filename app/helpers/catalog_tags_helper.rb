module CatalogTagsHelper
  def select_items_catalog_tag_categories
    categories = @project.catalog_tag_categories.to_a
    categories << CatalogTagCategory.always
    categories.collect { |c| [c.name, c.id] }
  end
end
