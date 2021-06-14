class CreateCatalogRelationTagCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :catalog_relation_tag_categories do |t|
      t.integer :tag_id
      t.integer :catalog_tag_category_id
    end
  end
end
