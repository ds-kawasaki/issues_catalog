module IssuesCatalogHelper
  include ActsAsTaggableOn::TagsHelper

  def catalog_tags
    unless @catalog_tags
      @catalog_tags = []
      if :none != RedmineTags.settings[:issues_sidebar].to_sym
        @catalog_tags = Issue.available_tags project: @project,
          open_only: (RedmineTags.settings[:issues_open_only].to_i == 1)
      end
    end
    @catalog_tags
  end

  def render_catalog_tags
    render_catalog_tags_list catalog_tags
  end

  def render_catalog_tags_list(tags, options = {})
    unless tags.nil? or tags.empty?
      content, style = '', options.delete(:style)
      # prevent ActsAsTaggableOn::TagsHelper from calling `all`
      # otherwise we will need sort tags after `tag_cloud`
      tags = tags.to_a
      tags = sort_tags_array(tags)
      # if :list == style
      #   list_el, item_el = 'ul', 'li'
      # elsif :simple_cloud == style
      #   list_el, item_el = 'div', 'span'
      # elsif :cloud == style
      #   list_el, item_el = 'div', 'span'
      #   tags = cloudify tags
      # else
      #   raise 'Unknown list style'
      # end
      # content = content.html_safe
      # tag_cloud tags, (1..8).to_a do |tag, weight|
      #   content << ' '.html_safe <<
      #     content_tag(item_el, render_catalog_link_category(tag, options),
      #       class: "tag-nube-#{ weight }",
      #       style: (:simple_cloud == style ? 'font-size: 1em;' : '')) <<
      #     ' '.html_safe
      # end
      # content_tag list_el, content, class: 'tags',
      #   style: (:simple_cloud == style ? 'text-align: left;' : '')
      content = content.html_safe
      tags.each do |tag|
        content << ' '.html_safe << render_catalog_link_tag(tag)
      end
      content_tag 'div', content
    end
  end

  def render_catalog_categories
    content = ''.html_safe
    @project.issue_categories.each do |category|
      content << ' '.html_safe << render_catalog_link_category(category)
    end
    content_tag 'div', content
  end

  # カテゴリのリンク
  def render_catalog_link_category(category, options = {})
    # filters = [[:category_id, '=', category]]
    filters = make_filters(:category_id, category.id)
    filters << [:status_id, 'o'] if options[:open_only]

    content = link_to_catalog_filter category.name, filters, project_id: @project

    content_tag 'span', content
  end

  # タグのリンク
  def render_catalog_link_tag(tag, options = {})
    # filters = [[:tags, '=', tag.name]]
    filters = make_filters(:tags, tag.name)
    filters << [:status_id, 'o'] if options[:open_only]

    content = link_to_catalog_filter tag.name, filters, project_id: @project

    content_tag 'span', content
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

      options[:fields].push(name)
      options[:f].push(name)

      options[:operators][name] = operator
      options[:op][name]        = operator

      options[:values][name] = [value]
      options[:v][name]      = [value]
    end
    options
  end

  def make_filters(add_type, add_value)
    filters = Marshal.load(Marshal.dump(@select_filters))
    is_add = false
    filters.each do |f|
      if f[0] == add_type
        f[2] <<= add_value
        is_add = true
      end
    end
    unless is_add
      filters <<= [add_type, '=', add_value]
    end
    filters
  end

end
