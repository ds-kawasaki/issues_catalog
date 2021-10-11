class CreateCatalogTagGroups < ActiveRecord::Migration[5.2]
  def change
    create_table :catalog_tag_groups do |t|
      t.string :name
      t.text :description
      t.integer :project_id
      t.timestamps

      t.index :project_id
    end
  end
end
