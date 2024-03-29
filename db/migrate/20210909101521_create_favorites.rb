class CreateFavorites < ActiveRecord::Migration[5.2]
  def change
    create_table :favorites do |t|
      t.integer :user_id
      t.integer :issue_id
    end
    add_index :favorites, [:user_id, :issue_id], :unique => true
  end
end
