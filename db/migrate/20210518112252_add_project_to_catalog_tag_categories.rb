class AddProjectToCatalogTagCategories < ActiveRecord::Migration[5.2]
  def change
    add_column :catalog_tag_categories, :project_id, :integer
  end
end
