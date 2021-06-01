module IssuesCatalog
  module Patches
    module TagPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.class_eval do
          belongs_to :catalog_tag_category
        end
      end

      module InstanceMethods
        def catalog_tag_category_name
          self.catalog_tag_category ? self.catalog_tag_category.name : ""
        end
      end
    end
  end
end

base = ActsAsTaggableOn::Tag
patch = IssuesCatalog::Patches::TagPatch
base.send(:include, patch) unless base.included_modules.include?(patch)
