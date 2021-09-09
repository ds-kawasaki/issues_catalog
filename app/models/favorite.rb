class Favorite < ActiveRecord::Base
  belongs_to :user, :class_name => 'User', :foreign_key => 'user_id'
  belongs_to :issue, :class_name => 'Issue', :foreign_key => 'issue_id'

  validates_presence_of :user
  validates_uniqueness_of :issue_id, scope: :user_id
end
