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
    retrieve_issues_catalog(params)
    @issue_count = @query.issue_count
    @issue_pages = Paginator.new @issue_count, per_page_option, params['page']
    @issues = @query.issues(:offset => @issue_pages.offset, :limit => @issue_pages.per_page)

    @select_filters = []
    if params.dig('v', 'category_id')
      c_id = params['v']['category_id']
      @select_category = @project.issue_categories.find(c_id[0])
      @select_filters <<= [:category_id, '=', @select_category.id]
    end
    if params.dig('v', 'tags')
      # 複数選択できるので配列として取得 
      @select_tags = params['v']['tags']
      @select_filters <<= [:tags, '=', @select_tags]
    end
  end

  private

    def retrieve_issues_catalog(params={})
      @issues_catalog = Redmine::Helpers::IssuesCatalog.new(params)
      retrieve_query IssueQuery, false
    end

end
