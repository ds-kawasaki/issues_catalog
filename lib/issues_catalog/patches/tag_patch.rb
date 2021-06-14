module IssuesCatalog
  module Patches
    module TagPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.class_eval do
          has_many :catalog_relation_tag_categories
          has_many :catalog_tag_categories, :through => :catalog_relation_tag_categories
        end
      end

      module InstanceMethods
        def catalog_tag_category_name
          if self.catalog_tag_categories.any?
            self.catalog_tag_categories.map { |i| i.name }.join(', ')
          else
            ""
          end
        end
      end
    end
  end
end

base = ActsAsTaggableOn::Tag
patch = IssuesCatalog::Patches::TagPatch
base.send(:include, patch) unless base.included_modules.include?(patch)
