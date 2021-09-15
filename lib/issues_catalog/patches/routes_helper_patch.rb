require 'routes_helper'

module IssuesCatalog
  module Patches
    module RoutesHelperPatch
      def _project_issues_path(project, *args)
        # カタログ画面のコンテキストメニューの「フィルタ」のURLを差し替える
        if request.path.present? && request.path.include?('context_menu') && @back.present? && @back.include?('issues_catalog')
          if project
            project_issues_catalog_path(project, *args)
          else
            project_issues_catalog_path(1, *args)
          end
        else
          super
        end
      end
    end
  end
end


# prependだと本番環境で動かない 暫定対応
# RoutesHelper.prepend(IssuesCatalog::Patches::RoutesHelperPatch)
ContextMenusController.send :helper, IssuesCatalog::Patches::RoutesHelperPatch