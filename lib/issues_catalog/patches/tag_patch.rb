module IssuesCatalog
  module Patches
    module TagPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.class_eval do
          has_many :catalog_relation_tag_categories
          has_many :catalog_tag_categories, :through => :catalog_relation_tag_categories
          accepts_nested_attributes_for :catalog_relation_tag_categories, allow_destroy: true

          has_many :catalog_relation_tag_groups
          has_many :catalog_tag_groups, :through => :catalog_relation_tag_groups
          accepts_nested_attributes_for :catalog_relation_tag_groups, allow_destroy: true
        end
      end

      module InstanceMethods
        def catalog_tag_category_names(project_id)
          if self.catalog_tag_categories.any?
            always = CatalogTagCategory.always
            self.catalog_tag_categories.map do |i|
              i.name if i.is_active? && (i.project_id == project_id || i.id == always.id)
            end.join(', ')
          else
            ""
          end
        end

        def catalog_tag_group_names(project_id)
          if self.catalog_tag_groups.any?
            self.catalog_tag_groups.map do |i|
              i.name if i.project_id == project_id
            end.join(', ')
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
