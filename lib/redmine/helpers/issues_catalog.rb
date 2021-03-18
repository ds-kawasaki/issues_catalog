module Redmine
  module Helpers
    # Simple class to handle isses catalog data
    class IssuesCatalog
      include ERB::Util
      include Rails.application.routes.url_helpers
      include Redmine::I18n
      include IssuesPanelHelper

      attr_reader :truncated, :issues_limit
      attr_accessor :query, :view

      def initialize(options={})
        options = options.dup
        if options.has_key?(:issues_limit)
          @issues_limit = options[:issues_limit]
        else
          @issues_limit = Setting.gantt_items_limit.blank? ? nil : Setting.gantt_items_limit.to_i
        end
        @truncated = false
      end

      def query=(query)
        @query = query
        query.available_columns.delete_if { |c| c.name == :tracker }
        @truncated = @query.issue_count.to_i > @issues_limit.to_i
      end

      def issues
        @query.issues(:limit => @issues_limit)
      end

      def grouped?
        @query && @query.grouped? && @query.group_by_column.name != :status
      end

    end
  end
end
