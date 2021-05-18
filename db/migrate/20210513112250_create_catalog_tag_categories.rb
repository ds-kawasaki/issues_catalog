class CreateCatalogTagCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :catalog_tag_categories do |t|
      t.string :name
      t.text :description
      t.integer :status, default: 0
    end
  end
end
