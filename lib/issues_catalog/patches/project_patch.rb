module IssuesCatalog
  module Patches
    module ProjectPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
      end

      module InstanceMethods
        def catalog_tag_categories
          CatalogTagCategory.search_by_project(self.id)
        end

        def catalog_tags(options = {})
          available_catalog_tags options.merge(project: self)
        end

        def available_catalog_tags(options = {})
          issues_scope = Issue.visible.select('issues.id').joins(:project)
          issues_scope = issues_scope.on_project(options[:project]) if options[:project]
          issues_scope = issues_scope.joins(:status).open if options[:open_only]

          result_scope = ActsAsTaggableOn::Tag
            .joins(:taggings)
            .select('tags.id, tags.name, tags.taggings_count, tags.catalog_tag_category_id, COUNT(taggings.id) as count')
            .group('tags.id, tags.name, tags.taggings_count, tags.catalog_tag_category_id')
            .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
            .order('tags.name')

          if options[:name_like]
            pattern = "%#{options[:name_like].to_s.strip}%"
            result_scope = result_scope.where('LOWER(tags.name) LIKE LOWER(:p)', :p => pattern)
          end

          result_scope
        end

      end
    end
  end
end

base = Project
patch = IssuesCatalog::Patches::ProjectPatch
base.send(:include, patch) unless base.included_modules.include?(patch)
