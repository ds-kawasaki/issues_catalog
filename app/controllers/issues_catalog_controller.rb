# frozen_string_literal: true

class IssuesCatalogController < ApplicationController
  before_action :find_optional_project, only: [:index]

  rescue_from Query::StatementInvalid, :with => :query_statement_invalid

  helper :projects
  helper :issues
  helper :queries
  helper :watchers
  helper :custom_fields
  helper :favorites
  include QueriesHelper

  MAX_HISTORIES = 20

  def index
    retrieve_query(IssueQuery, false)
    @issue_count = @query.issue_count
    @issue_pages = Paginator.new @issue_count, per_page_option, params['page']
    @issue_ids = @query.issue_ids(:offset => @issue_pages.offset, :limit => @issue_pages.per_page)

    @select_mode = params['sm'] || 'one'
    @issues_open_only = RedmineTags.settings[:issues_open_only].to_i == 1

    make_select_filters

    # javascriptに渡すもの
    @to_js_param = {'select_mode' => @select_mode,
                    'issues_open_only' => @issues_open_only,
                    'label_clear' => l(:button_clear),
                    'label_clear_select' => l(:label_clear_select),
                    'label_operator_one' => l(:label_operator_one),
                    'label_operator_and' => l(:label_operator_and),
                    'label_operator_or' => l(:label_operator_or),
                    'label_selected_tag_group' => l(:label_selected_tag_group),
                    'label_tag_category_none' => l(:label_catalog_tag_category_none),
                    'label_all_display' => l(:label_all_display),
                    'label_title_thumbnails' => l(:label_title_thumbnails),
                    'label_only_thumbnails' => l(:label_only_thumbnails),
                    'select_filters' => @select_filters,
                    'tags' => get_catalog_all_tags,
                    'selected_tags' => get_catalog_selected_tags,
                    'tag_categories' => get_catalog_tag_categories,
                    'tag_groups' => get_catalog_tag_groups}
  end

  private

  def make_select_filters
    @select_filters = []
    @tags_operator = '='

    catalog_query = @query.filters['category_id']
    if catalog_query.present?
      category_ids = catalog_query[:values]
      unless category_ids.nil?
        # カテゴリは複数選択しない想定
        @select_category = @project.issue_categories.find(category_ids[0])
        @select_filters <<= [:category_id, '=', [category_ids[0]]]
      end
    end

    tags_query = @query.filters['tags']
    if tags_query.present?
      # タグは複数選択できるので配列として取得
      @select_tags = tags_query[:values]
      @tags_operator = tags_query[:operator] if tags_query[:operator]
      @select_filters <<= [:tags, @tags_operator, @select_tags]
    end

    favorites_query = @query.filters['favorites']
    if favorites_query.present?
      @favorites = favorites_query[:values]
    end

    issues_filter_query = @query.filters['issue_id']
    if issues_filter_query.present?
      @issues_filters = issues_filter_query[:values]
    end
  end

  def get_catalog_all_tags
    issues_scope = Issue.visible.select('issues.id').joins(:project)
    issues_scope = issues_scope.on_project(@project) unless @project.nil?
    issues_scope = issues_scope.joins(:status).open if @issues_open_only
    ActsAsTaggableOn::Tag
      .joins(:taggings)
      .select('tags.id, tags.name, tags.description, COUNT(taggings.id) as count')
      .group('tags.id, tags.name, tags.description')
      .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
      .order('tags.name')
      .preload(:catalog_tag_categories, :catalog_tag_groups)
      .collect do |tag|
        { name: tag.name,
          id: tag.id,
          count: tag.count,
          select_count: 0,
          description: tag.description,
          categories: tag.catalog_tag_category_ids,
          groups: tag.catalog_tag_group_ids }
      end
  end

  def get_catalog_selected_tags
    if @select_filters.present?
      select_issues_scope = Issue.visible.select('issues.id').joins(:project)
      select_issues_scope = select_issues_scope.on_project(@project) unless @project.nil?
      select_issues_scope = select_issues_scope.joins(:status).open if @issues_open_only
      select_issues_scope = select_issues_scope.where(category_id: @select_category.id) unless @select_category.nil?
      select_issues_scope = select_issues_scope.tagged_with(@select_tags) unless @select_tags.nil?
      ActsAsTaggableOn::Tag
        .joins(:taggings)
        .select('tags.id, COUNT(taggings.id) as count')
        .group('tags.id')
        .where(taggings: { taggable_type: 'Issue', taggable_id: select_issues_scope})
        .collect do |tag|
          { id: tag.id, select_count: tag.count }
        end
    else
      {}
    end
  end

  def get_catalog_tag_categories
    tmp_categories = CatalogTagCategory.search_by_project(@project.id).map do |cate|
      { name: cate.name, id: cate.id, description: cate.description }
    end

    always = CatalogTagCategory.always
    tmp_categories.unshift({ name: always.name, id: always.id, description: always.description })
  end

  def get_catalog_tag_groups
    CatalogTagGroup.search_by_project(@project.id).map do |grp|
      { name: grp.name, id: grp.id, description: grp.description }
    end
  end
end
