class Favorite < ActiveRecord::Base
  belongs_to :user, :class_name => 'User', :foreign_key => 'user_id'
  belongs_to :issue, :class_name => 'Issue', :foreign_key => 'issue_id'

  validates_presence_of :user
  validates_uniqueness_of :issue_id, scope: :user_id

  # Returns true if at least one issue among issues is favorited by user
  def self.any_favorited?(issues, user)
    issues = issues.reject(&:new_record?)
    Favorite.where(:issue_id => issues.map(&:id), :user_id => user.id).exists?
  end

end
