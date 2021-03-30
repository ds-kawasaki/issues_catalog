module IssuesCatalogHelper
  include ActsAsTaggableOn::TagsHelper

  def catalog_tags
    unless @catalog_tags
      issues_scope = Issue.visible.select('issues.id').joins(:project)
      issues_scope = issues_scope.on_project(@project) unless @project.nil?
      issues_scope = issues_scope.joins(:status).open if RedmineTags.settings[:issues_open_only].to_i == 1
      issues_scope = issues_scope.where(category_id: @select_category.id) unless @select_category.nil?
      issues_scope = issues_scope.tagged_with(@select_tags) unless @select_tags.nil?

      @catalog_tags = ActsAsTaggableOn::Tag
        .joins(:taggings)
        .select('tags.id, tags.name, tags.taggings_count, COUNT(taggings.id) as count')
        .group('tags.id, tags.name, tags.taggings_count')
        .where(taggings: { taggable_type: 'Issue', taggable_id: issues_scope})
        .order('tags.name')
    end
    @catalog_tags
  end

  def render_catalog_tags
    tags = catalog_tags

    content = ''.html_safe

    content_h3 = ''.html_safe
    content_h3 << l(:label_tag)
    unless @select_tags.nil?
      content_h3 << " : "
      @select_tags.each_with_index do |t, i|
        content_h3 << " and " if i > 0
        tag = tags.find { |tt| tt.name == t }
        content_h3 << content_tag(:span, render_catalog_link_tag(tag, show_count: true),
                      class: "tag-nube-8", style: 'font-size: 1em;')
      end
    end
    content << content_tag(:h3, content_h3)

    content << render_catalog_tags_list(tags, {
      show_count: true,
      open_only: (RedmineTags.settings[:issues_open_only].to_i == 1),
      style: RedmineTags.settings[:issues_sidebar].to_sym })

    content_tag :div, content, class: "catalog-selector-tags"
  end

  def render_catalog_tags_list(tags, options = {})
    unless tags.nil? or tags.empty?
      content, style = '', options.delete(:style)
      # prevent ActsAsTaggableOn::TagsHelper from calling `all`
      # otherwise we will need sort tags after `tag_cloud`
      tags = tags.to_a
      tags = sort_tags_array(tags)
      if :list == style
        list_el, item_el = 'ul', 'li'
      elsif :simple_cloud == style
        list_el, item_el = 'div', 'span'
      elsif :cloud == style
        list_el, item_el = 'div', 'span'
        tags = cloudify tags
      else
        raise 'Unknown list style'
      end
      content = content.html_safe
      tag_cloud tags, (1..8).to_a do |tag, weight|
        unless !@select_tags.nil? && @select_tags.include?(tag.name)
          content << ' '.html_safe <<
          content_tag(item_el, render_catalog_link_tag(tag, options),
            { class: "tag-nube-#{ weight }",
            style: (:simple_cloud == style ? 'font-size: 1em;' : '') } ) <<
          ' '.html_safe
        end
      end
      content_tag list_el, content, class: 'tags',
        style: (:simple_cloud == style ? 'text-align: left;' : '')
    end
  end


  def catalog_categories
    unless @catalog_categories
      issues_scope = Issue.visible.select('issues.category_id').joins(:project)
      issues_scope = issues_scope.on_project(@project) unless @project.nil?
      issues_scope = issues_scope.joins(:status).open if RedmineTags.settings[:issues_open_only].to_i == 1
      issues_scope = issues_scope.tagged_with(@select_tags) unless @select_tags.nil?

      logger.debug "catalog_categories: #{issues_scope.size}"

      @catalog_categories = IssueCategory.where(id: issues_scope)
        .order('issue_categories.name')
    end
    @catalog_categories
  end

  def render_catalog_categories
    categories = catalog_categories

    content = ''.html_safe

    content_h3 = ''.html_safe
    content_h3 << l(:field_category)
    unless @select_category.nil?
      content_h3 << " : "
      category = categories.find { |c| c.name == @select_category.name }
      content_h3 << render_catalog_link_category(category)
    end
    content << content_tag(:h3, content_h3)

    if @select_category.nil?
      content << render_catalog_categories_list(categories, {
        show_count: true,
        style: RedmineTags.settings[:issues_sidebar].to_sym })
    end

    content_tag :div, content, class: "catalog-selector-categories"
  end

  def render_catalog_categories_list(categories, options = {})
    unless categories.nil? or categories.empty?
      content = ''.html_safe
      categories.each do |category|
        content << ' '.html_safe << render_catalog_link_category(category, options)
      end
      content_tag 'div', content, class: 'categories', style: 'text-align: left;'
    end
  end

  # カテゴリのリンク
  def render_catalog_link_category(category, options = {})
    use_colors = RedmineTags.settings[:issues_use_colors].to_i > 0
    if use_colors
      tag_bg_color = tag_color(category)
      tag_fg_color = tag_fg_color(tag_bg_color)
      tag_style = "background-color: #{tag_bg_color}; color: #{tag_fg_color}"
    end

    filters = make_filters(:category_id, category.id)
    filters << [:status_id, 'o'] if options[:open_only]

    content = link_to_catalog_filter category.name, filters, project_id: @project
    if options[:show_count] && category.respond_to?(:count)
      content << content_tag('span', "(#{ category.count })", class: 'category-count')
    end

    style = if use_colors
      { class: 'category-label-color', style: tag_style }
    else
      { class: 'category-label' }
    end
    content_tag 'span', content, style
  end

  # タグのリンク
  def render_catalog_link_tag(tag, options = {})
    use_colors = RedmineTags.settings[:issues_use_colors].to_i > 0
    if use_colors
      tag_bg_color = tag_color(tag)
      tag_fg_color = tag_fg_color(tag_bg_color)
      tag_style = "background-color: #{tag_bg_color}; color: #{tag_fg_color}"
    end

    filters = make_filters(:tags, tag.name)
    filters << [:status_id, 'o'] if options[:open_only]

    if options[:use_search]
      content =  link_to tag, { controller: 'search', action: 'index',
        id: @project, q: tag.name, wiki_pages: true, issues: true,
        style: tag_style }
    else
      content = link_to_catalog_filter tag.name, filters, project_id: @project
    end
    if options[:show_count]
      content << content_tag('span', "(#{ tag.count })", class: 'tag-count')
    end

    style = if use_colors
        { class: 'tag-label-color',
          style: tag_style }
      else
        { class: 'tag-label' }
      end
    content_tag 'span', content, style
  end

  # link_to_filterのコントローラー違い 
  def link_to_catalog_filter(title, filters, options = {})
    options.merge! link_to_catalog_filter_options(filters)
    link_to title, options
  end

  # link_to_filter_optionsのコントローラー違い 
  def link_to_catalog_filter_options(filters)
    options = { controller: 'issues_catalog', action: 'index', set_filter: 1,
      fields: [], values: {}, operators: {}, f:[], v: {}, op: {} }

    filters.each do |f|
      name, operator, value = f

      options[:f].push(name)
      options[:op][name] = operator
      options[:v][name] = value.instance_of?(Array) ? value : [value]
    end
    options
  end

  def make_filters(add_type, add_value)
    filters = Marshal.load(Marshal.dump(@select_filters))
    is_add = false
    filters.each do |f|
      if f[0] == add_type
        unless f[2].include?(add_value)
          f[2] <<= add_value
          # タグの複数選択時はアンド検索 
          if add_type == :tags
            f[1] = 'and'
          end
        end
        is_add = true
      end
    end
    unless is_add
      filters <<= [add_type, '=', add_value]
    end
    filters
  end

end
