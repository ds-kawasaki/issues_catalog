module IssuesCatalog
  module Patches
    module IssueQueryPatch
      def self.included(base)
        base.send :include, InstanceMethods
        base.class_eval do
          alias_method :available_filters_without_favorites, :available_filters
          alias_method :available_filters, :available_filters_with_favorites

          alias_method :available_columns_without_favorites, :available_columns
          alias_method :available_columns, :available_columns_with_favorites
        end
      end

      module InstanceMethods
        def sql_for_favorites_field(field, operator, value)
          db_table = Favorite.table_name
          me, others = value.partition {|id| id == 'me'}
          me = [User.current.id.to_s] if me.present?

          sql =
            if others.any?
              "SELECT #{Issue.table_name}.id FROM #{Issue.table_name} " <<
              "INNER JOIN #{db_table} ON #{Issue.table_name}.id = #{db_table}.issue_id " <<
              "LEFT OUTER JOIN #{Project.table_name} ON #{Project.table_name}.id = #{Issue.table_name}.project_id " <<
              "WHERE (" <<
                sql_for_field(field, '=', me, db_table, 'user_id') <<
              ') OR (' <<
                sql_for_field(field, '=', others, db_table, 'user_id') <<
              ')'
            else
              "SELECT #{db_table}.issue_id FROM #{db_table} WHERE " <<
              sql_for_field(field, '=', me, db_table, 'user_id')
            end

          "#{Issue.table_name}.id #{operator == '=' ? 'IN' : 'NOT IN'} (#{sql})"
        end

        def available_filters_with_favorites
          if @available_filters.blank?
            unless available_filters_without_favorites.key?('favorites')
              add_available_filter('favorites', :type => :list_optional, :name => l(:label_favorite),
                                   :values => lambda {favorite_values})
            end
          else
            available_filters_without_favorites
          end
          @available_filters
        end

        def favorite_values
          favorite_values = [["<< #{l(:lavel_me)} >>", "me"]]
          favorite_values += User.where.not(id: User.current.id).status(User::STATUS_ACTIVE).order(:login)
                                 .collect {|s| [s.name, s.id.to_s]}
          favorite_values
        end

        def available_columns_with_favorites
          if @available_columns.blank?
            @available_columns = available_columns_without_favorites
            @available_columns << QueryColumn.new(:favorites)
          else
            @available_columns_without_favorites
          end
          @available_columns
        end
      end
    end
  end
end

base = IssueQuery
patch = IssuesCatalog::Patches::IssueQueryPatch
base.send(:include, patch) unless base.included_modules.include?(patch)
