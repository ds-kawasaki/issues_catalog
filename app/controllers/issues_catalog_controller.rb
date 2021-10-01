# frozen_string_literal: true

class IssuesCatalogController < ApplicationController
  before_action :find_optional_project, only: [:index]
  before_action :find_project_by_project_id, only: [:add_tag, :delete_tag]

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
    retrieve_query IssueQuery, false
    @issue_count = @query.issue_count
    @issue_pages = Paginator.new @issue_count, per_page_option, params['page']
    @issues = @query.issues(:offset => @issue_pages.offset, :limit => @issue_pages.per_page)

    @select_mode = params['sm'] || 'one'
    @issues_open_only = RedmineTags.settings[:issues_open_only].to_i == 1

    make_select_filters
    make_catalog_all_tags
    make_catalog_selected_tags

    # javascriptに渡すもの
    @to_js_param = {'select_mode' => @select_mode,
                    'issues_open_only' => @issues_open_only,
                    'label_clear' => l(:button_clear),
                    'select_filters' => @select_filters }
  end

  def add_tag
    @issue_ids = params[:issue_ids]
    @back_url = params[:back_url]
  end

  def delete_tag
    @issue_ids = params[:issue_ids]
    @back_url = params[:back_url]

    issues = Issue.where(:id => @issue_ids)
    @candidate_tags = ActsAsTaggableOn::Tag
      .joins(:taggings)
      .where(taggings: { taggable_type: 'Issue', taggable_id: issues})
      .distinct
      .order('tags.name')
  end

  def update_tag
    operate = params[:operate]
    return if operate.blank?
    sabun = params[:tag_list]
    return if sabun.blank?
    sabun = sabun.split(ActsAsTaggableOn.delimiter) unless sabun.is_a?(Array)

    Issue.where(:id => params[:issue_ids]).each do |issue|
      old_tags = issue.tag_list.to_s

      case operate
      when 'add'
        issue.tag_list |= sabun
      when 'delete'
        issue.tag_list -= sabun
      end

      new_tags = issue.tag_list.to_s
      unless old_tags == new_tags
        issue.save_tags
        unless issue.current_journal.blank?
          issue.current_journal.details << JournalDetail.new(
            property: 'attr', prop_key: 'tag_list', old_value: old_tags, value: new_tags)
        end
      end
    end
    Issue.remove_unused_tags!
    # redirect_to params[:back_url] if params[:back_url]
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

  def make_catalog_all_tags
    issues_scope = Issue.visible.select('issues.id').joins(:project)
    issues_scope = issues_scope.on_project(@project) unless @project.nil?
    issues_scope = issues_scope.joins(:status).open if @issues_open_only

    @catalog_all_tags = ActsAsTaggableOn::Tag
      .joins(:taggings)
      .select('tags.id, tags.name, tags.taggings_count, COUNT(taggings.id) as count')
      .group('tags.id, tags.name, tags.taggings_count')
      .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
      .map { |tag| [tag.name, { id: tag.id, count: tag.count }] }
      .to_h
  end

  def make_catalog_selected_tags
    @catalog_selected_tags = {}
    unless @select_filters.empty?
      issues_scope = Issue.visible.select('issues.id').joins(:project)
      issues_scope = issues_scope.on_project(@project) unless @project.nil?
      issues_scope = issues_scope.joins(:status).open if @issues_open_only
      issues_scope = issues_scope.where(category_id: @select_category.id) unless @select_category.nil?
      issues_scope = issues_scope.tagged_with(@select_tags) unless @select_tags.nil?

      @catalog_selected_tags = ActsAsTaggableOn::Tag
        .joins(:taggings)
        .select('tags.id, tags.name, tags.taggings_count, COUNT(taggings.id) as count')
        .group('tags.id, tags.name, tags.taggings_count')
        .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
        .map { |tag| [tag.name, { id: tag.id, count: tag.count }] }
        .to_h
    end
  end

end
