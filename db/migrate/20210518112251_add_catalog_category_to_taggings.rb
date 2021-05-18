class AddCatalogCategoryToTaggings < ActiveRecord::Migration[5.2]
  def change
    add_column :taggings, :catalog_category_id, :integer
  end
end
