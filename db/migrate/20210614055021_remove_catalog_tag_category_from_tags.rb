class RemoveCatalogTagCategoryFromTags < ActiveRecord::Migration[5.2]
  def change
    remove_column :tags, :catalog_tag_category_id, :integer
  end
end
