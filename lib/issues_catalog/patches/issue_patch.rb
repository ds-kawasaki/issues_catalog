module IssuesCatalog
  module Patches
    module IssuePatch
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.class_eval do
          has_many :favorites
          has_many :favorite_users, :through => :favorites, :source => :user
          accepts_nested_attributes_for :favorites, allow_destroy: true
        end
      end

      module InstanceMethods
        def add_favorite(user)
          return nil unless user && user.is_a?(User)

          # Rails does not reset the has_many :through association
          favorite_users.reset
          self.favorites << Favorite.new(:user => user)
          # self.favorites << Favorite.new(:user_id => user.id, :issue_id => self.id)
        end

        def remove_favorite(user)
          return nil unless user && user.is_a?(User)

          # Rails does not reset the has_many :through association
          favorite_users.reset
          favorites.where(:user_id => user.id).delete_all
        end

        # Adds/removes favorite
        def set_favorite(user, is_favorite=true)
          is_favorite ? add_favorite(user) : remove_favorite(user)
        end

        def favorited?
          Favorite.favorited?(id, User.current.id)
        end

      end
    end
  end
end

base = Issue
patch = IssuesCatalog::Patches::IssuePatch
base.send(:include, patch) unless base.included_modules.include?(patch)
