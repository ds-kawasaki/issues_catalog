class InsertAlwaysCatalogTagCategories < ActiveRecord::Migration[5.2]
  def change
    CatalogTagCategory.create(id: 0,
        name: '常時表示',
        description: '常に表示するカテゴリ',
        project_id: 0,
        created_at: '2021-8-16',
        updated_at: '2021-8-16')
  end
end
