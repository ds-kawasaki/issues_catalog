class AddCatalogTagCategoryToTags < ActiveRecord::Migration[5.2]
  def change
    add_column :tags, :catalog_tag_category_id, :integer
  end
end
