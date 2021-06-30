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
  include QueriesHelper

  MAX_HISTORIES = 20

  def index
    retrieve_query IssueQuery, false
    @issue_count = @query.issue_count
    @issue_pages = Paginator.new @issue_count, per_page_option, params['page']
    @issues = @query.issues(:offset => @issue_pages.offset, :limit => @issue_pages.per_page)

    make_select_filters
    make_catalog_all_tags
    make_catalog_selected_tags
    update_tag_history
  end

  def add_tag
    @issue_ids = params[:issue_ids]
    @back_url = params[:back_url]
  end

  def delete_tag
    @issue_ids = params[:issue_ids]
    @back_url = params[:back_url]
  end

  def update_tag
    add_tags = params[:tag_list].split(ActsAsTaggableOn.delimiter)
    return if add_tags.empty?

    issues = Issue.where(:id => params[:issue_ids])
    issues.each do |issue|
      old_tags = issue.tag_list.to_s
      issue.tag_list |= add_tags
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
  end

  def make_catalog_all_tags
    issues_scope = Issue.visible.select('issues.id').joins(:project)
    issues_scope = issues_scope.on_project(@project) unless @project.nil?
    issues_scope = issues_scope.joins(:status).open if RedmineTags.settings[:issues_open_only].to_i == 1

    @catalog_all_tags = ActsAsTaggableOn::Tag
      .joins(:taggings)
      .select('tags.id, tags.name, tags.taggings_count, COUNT(taggings.id) as count')
      .group('tags.id, tags.name, tags.taggings_count')
      .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
      .order('tags.name')
  end

  def make_catalog_selected_tags
    @catalog_selected_tags = []
    unless @select_filters.empty?
      issues_scope = Issue.visible.select('issues.id').joins(:project)
      issues_scope = issues_scope.on_project(@project) unless @project.nil?
      issues_scope = issues_scope.joins(:status).open if RedmineTags.settings[:issues_open_only].to_i == 1
      issues_scope = issues_scope.where(category_id: @select_category.id) unless @select_category.nil?
      issues_scope = issues_scope.tagged_with(@select_tags) unless @select_tags.nil?

      @catalog_selected_tags = ActsAsTaggableOn::Tag
        .joins(:taggings)
        .select('tags.id, tags.name, tags.taggings_count, COUNT(taggings.id) as count')
        .group('tags.id, tags.name, tags.taggings_count')
        .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
        .order('tags.name')
    end
  end

  def update_tag_history
    user = User.current
    if user.nil? || !user.logged?
      @tag_history = []
    else
      old_value = user.pref[:catalog_histories]
      histories = (old_value || '').split(',').map(&:to_i)
  
      current_tag_name = params['catalog_history']
      unless current_tag_name.nil?
        current_tag = @catalog_all_tags.find { |at| at.name == current_tag_name }
        unless current_tag.nil?
          histories.delete(current_tag.id)
          histories.unshift(current_tag.id)
          histories.pop if histories.length >= MAX_HISTORIES
        end
      end
  
      @tag_history = histories.map do |i|
        @catalog_all_tags.find { |at| at.id == i }
      end
  
      new_value = histories.join(',')
      if old_value != new_value
        user.pref[:catalog_histories] = new_value
        user.pref.save
      end
    end
  end

end
