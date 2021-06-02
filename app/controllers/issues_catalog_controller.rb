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
        @select_filters <<= [:category_id, '=', [category_ids[0]]]
      end
    end
    if @query.filters['tags']
      # タグは複数選択できるので配列として取得 
      @select_tags = @query.filters['tags'][:values]
      @select_filters <<= [:tags, '=', @select_tags]
    end

    catalog_all_tags
  end

  private

  def catalog_all_tags
    issues_scope = Issue.visible.select('issues.id').joins(:project)
    issues_scope = issues_scope.on_project(@project) unless @project.nil?
    issues_scope = issues_scope.joins(:status).open if RedmineTags.settings[:issues_open_only].to_i == 1
    # issues_scope = issues_scope.where(category_id: @select_category.id) unless @select_category.nil?
    # issues_scope = issues_scope.tagged_with(@select_tags) unless @select_tags.nil?

    @catalog_all_tags = ActsAsTaggableOn::Tag
      .joins(:taggings)
      .select('tags.id, tags.name, tags.taggings_count, tags.catalog_tag_category_id, COUNT(taggings.id) as count')
      .group('tags.id, tags.name, tags.taggings_count, tags.catalog_tag_category_id')
      .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
      .order('tags.name')
  end


end
