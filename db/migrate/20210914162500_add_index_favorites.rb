class AddIndexFavorites < ActiveRecord::Migration[5.2]
  def change
    add_index :favorites, :user_id
    add_index :favorites, :issue_id
  end
end
