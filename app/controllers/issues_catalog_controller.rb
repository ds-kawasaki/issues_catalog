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
    make_catalog_selected_groups

    # javascriptに渡すもの
    @to_js_param = {'select_mode' => @select_mode,
                    'issues_open_only' => @issues_open_only,
                    'label_clear' => l(:button_clear),
                    'select_filters' => @select_filters,
                    'tags' => get_catalog_all_tags,
                    'tag_categories' => get_catalog_tag_categories,
                    'tag_groups' => get_catalog_tag_groups}
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
      .select('tags.id, tags.name, tags.description, tags.taggings_count, COUNT(taggings.id) as count')
      .group('tags.id, tags.name, tags.description, tags.taggings_count')
      .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
      .preload(:catalog_tag_categories, :catalog_tag_groups)
      .map { |tag| [tag.name, { id: tag.id, count: tag.count, select_count: 0, description: tag.description, categories: tag.catalog_tag_category_ids, groups: tag.catalog_tag_group_ids }] }
      .to_h

    if @select_filters.present?
      issues_scope = issues_scope.where(category_id: @select_category.id) unless @select_category.nil?
      issues_scope = issues_scope.tagged_with(@select_tags) unless @select_tags.nil?
      selected_tags = ActsAsTaggableOn::Tag
        .joins(:taggings)
        .select('tags.id, tags.name, tags.taggings_count, COUNT(taggings.id) as count')
        .group('tags.id, tags.name, tags.taggings_count')
        .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
      selected_tags.each do |tag|
        if @catalog_all_tags[tag.name]
          @catalog_all_tags[tag.name][:select_count] = tag.count
        end
      end
    end
  end

  def get_catalog_all_tags
    tmp_tags = @catalog_all_tags.map do |key, val|
      { name: key, id: val[:id], count: val[:count], select_count: val[:select_count], description: val[:description], categories: val[:categories], groups: val[:groups] }
    end
    tmp_tags.sort_by! {|v| v[:name]}
  end

  def get_catalog_tag_categories
    tmp_categories = CatalogTagCategory.search_by_project(@project.id).map do |cate|
      { name: cate.name, id: cate.id, description: cate.description }
    end
    tmp_categories.sort_by! {|v| v[:name]}

    always = CatalogTagCategory.always
    tmp_categories.unshift({ name: always.name, id: always.id, description: always.description })
  end

  def get_catalog_tag_groups
    tmp_groups = CatalogTagGroup.search_by_project(@project.id).map do |grp|
      { name: grp.name, id: grp.id, description: grp.description }
    end
    tmp_groups.sort_by! {|v| v[:name]}
  end

  def make_catalog_selected_groups
    @catalog_selected_tag_groups = []
    if @select_tags.present?
      tags_scope = @select_tags.map {|t| @catalog_all_tags[t][:id]}
      @catalog_selected_tag_groups = CatalogTagGroup
        .joins(:catalog_relation_tag_groups)
        .where(catalog_relation_tag_groups: {tag_id: tags_scope})
        .distinct
        .order('catalog_tag_groups.name')
        .to_a
    end
  end
end
