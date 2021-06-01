class CreateCatalogTagCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :catalog_tag_categories do |t|
      t.string :name
      t.text :description
      t.integer :project_id
      t.integer :status, default: 0
      t.timestamps
    end
  end
end
