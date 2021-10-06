class CreateCatalogRelationTagGroups < ActiveRecord::Migration[5.2]
  def change
    create_table :catalog_relation_tag_groups do |t|
      t.integer :tag_id
      t.integer :catalog_tag_group_id

      t.index :tag_id
      t.index :catalog_tag_group_id, :name => 'index_catalog_tag_group_id'
      t.index [:tag_id, :catalog_tag_group_id], :unique => true, :name => 'index_tag_and_catalog_tag_group_id'
    end
  end
end
