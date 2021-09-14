class AddIndexCatalogTagCategories < ActiveRecord::Migration[5.2]
  def change
    add_index :catalog_tag_categories, :project_id
  end
end
