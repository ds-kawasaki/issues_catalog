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

    if params.dig('values', 'category_id')
      category = @project.issue_categories.find(params['values']['category_id'])
      @select_category = category[0].name
    end
  end


  private

    def retrieve_issues_catalog(params={})
      @issues_catalog = Redmine::Helpers::IssuesCatalog.new(params)
      retrieve_query
    end

end
