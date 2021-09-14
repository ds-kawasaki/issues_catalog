class AddIndexCatalogRelationTagCategories < ActiveRecord::Migration[5.2]
  def change
    add_index :catalog_relation_tag_categories, :tag_id
    add_index :catalog_relation_tag_categories, :catalog_tag_category_id, :name => 'index_catalog_tag_category_id'
    add_index :catalog_relation_tag_categories, [:tag_id, :catalog_tag_category_id], :unique => true, :name => 'index_tag_and_catalog_tag_category_id'
  end
end
