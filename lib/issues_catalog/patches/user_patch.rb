module IssuesCatalog
  module Patches
    module UserPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.class_eval do
          has_many :favorites
          has_many :favorite_issues, :through => :favorites, :source => :issue
          accepts_nested_attributes_for :favorites, allow_destroy: true
        end
      end

      module InstanceMethods

      end
    end
  end
end

base = User
patch = IssuesCatalog::Patches::UserPatch
base.send(:include, patch) unless base.included_modules.include?(patch)
