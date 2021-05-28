module IssuesCatalog
  module Patches
    module ProjectPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
      end

      module InstanceMethods
        def catalog_tag_categories
          CatalogTagCategory.search_by_project(project_id: self)
        end
      end
    end
  end
end

base = Project
patch = IssuesCatalog::Patches::ProjectPatch
base.send(:include, patch) unless base.included_modules.include?(patch)
