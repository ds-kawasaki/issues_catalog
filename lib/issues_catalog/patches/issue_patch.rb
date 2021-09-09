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

      end
    end
  end
end

base = Issue
patch = IssuesCatalog::Patches::IssuePatch
base.send(:include, patch) unless base.included_modules.include?(patch)
