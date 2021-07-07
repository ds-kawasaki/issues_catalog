module IssuesCatalog
  module Patches
    module AddHelpersForCatalogPatch
      def self.included(base)
        base.class_eval do
          helper IssuesCatalogHelper
          helper IssuesCatalogSettingsHelper
        end
      end
    end
  end
end

bases = [
  ProjectsController,
]
patch = IssuesCatalog::Patches::AddHelpersForCatalogPatch
bases.each do |base|
  base.send(:include, patch) unless base.included_modules.include?(patch)
end
