class IssuesCatalogController < ApplicationController
  before_action :find_optional_project

  rescue_from Query::StatementInvalid, :with => :query_statement_invalid

  helper :projects
  helper :issues
  helper :queries
  helper :watchers
  helper :custom_fields
  include QueriesHelper

  def index
    retrieve_query IssueQuery, false
    @issue_count = @query.issue_count
    @issue_pages = Paginator.new @issue_count, per_page_option, params['page']
    @issues = @query.issues(:offset => @issue_pages.offset, :limit => @issue_pages.per_page)

    @select_filters = []
    if @query.filters['category_id']
      category_ids = @query.filters['category_id'][:values]
      unless category_ids.nil?
        # カテゴリは複数選択しない想定
        @select_category = @project.issue_categories.find(category_ids[0])
        @select_filters <<= [:category_id, '=', category_ids[0]]
      end
    end
    if @query.filters['tags']
      # タグは複数選択できるので配列として取得 
      @select_tags = @query.filters['tags'][:values]
      @select_filters <<= [:tags, '=', @select_tags]
    end
  end

end
