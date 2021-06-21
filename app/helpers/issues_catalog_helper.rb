module IssuesCatalogHelper
  include ActsAsTaggableOn::TagsHelper
  include TagsHelper

  # content_tagのネスト用 参考 https://qiita.com/EastResident/items/59856cbc7d8e73138a49
  def content_tag_push(type, *option)
    tags = []
    yield tags
    content_tag(type, tags.reduce(:+), *option)
  end

  CATALOG_COLUMN_NAMES = [:id, :subject, :cf_1, :cf_2, :tags]

  MOVIE_EXTS = ['.avi', '.mp4', '.mov']

  def render_catalog_issues
    catalog_columns = CATALOG_COLUMN_NAMES.collect do |col|
       [col, @query.available_columns.find { |c| c.name == col }]
    end.to_h
  
    html_text = ''
    form_tag({}, :data => {:cm_url => issues_context_menu_path}) do
      html_text << hidden_field_tag('back_url', url_for(:params => request.query_parameters), :id => nil)
      html_text << query_columns_hidden_tags(@query)
      html_text << "\n"
      html_text << content_tag_push(:div, class: 'autoscroll') do |div_autoscroll|
        div_autoscroll << content_tag_push(:table, class: 'list issues odd-even' << @query.css_classes) do |div_table|
          div_table << content_tag(:thead)
          div_table << content_tag_push(:tbody) do |div_tbody|
            grouped_issue_list(@issues, @query) do |issue, level, group_name, group_count, group_totals|
              tr_id = 'issue-' << issue.id.to_s
              tr_class = 'hascontextmenu ' << cycle('odd', 'even') << issue.css_classes
              tr_class << "idnt idnt-#{level}" if level > 0
              div_tbody << content_tag_push(:tr, id: tr_id, class: tr_class) do |div_tr|
                # id
                col_id = catalog_columns[:id]
                unless col_id.nil?
                  div_tr << content_tag_push(:td, class: col_id.css_classes) do |div_td|
                    div_td << content_tag_push(:div, class: 'catalog-issue-top') do |div_issue_top|
                      div_issue_top << check_box_tag("ids[]", issue.id, false, id: nil)
                      div_issue_top << link_to(col_id.value_object(issue), issue_path(issue))
                      div_issue_top << link_to_context_menu
                    end
                  end
                  div_tr << "\n"
                end
                # subject
                col_subject = catalog_columns[:subject]
                unless col_subject.nil?
                  div_tr << content_tag(:td, link_to(col_subject.value_object(issue), issue_path(issue)), class: col_subject.css_classes)
                  div_tr << "\n"
                end
                # cf1
                col_cf1 = catalog_columns[:cf_1]
                col_cf2 = catalog_columns[:cf_2]
                unless col_cf1.nil?
                  val_preview = format_object(col_cf1.value_object(issue))
                  val_okiba = format_object(col_cf2.value_object(issue)) unless col_cf2.nil?
                  preview = ''.html_safe
                  if MOVIE_EXTS.include?(File.extname(val_preview))
                    preview << video_tag(get_visuals_path(val_preview), size: '300x300', controls: true, autoplay: true, loop: true, preload: 'none')
                  else
                    preview << image_tag(get_visuals_path(val_preview), size: '300x300')
                  end
                  unless val_okiba.empty?
                    if File.extname(val_okiba) != ''
                      preview = link_to(preview, get_visuals_path(val_okiba), target: '_blank')
                    else
                      if val_okiba.start_with?('Q:', 'q:')
                        val_okiba.slice!(0, 2)
                        val_okiba = 'dseeds.local/data' << val_okiba
                      end
                      preview = link_to(preview, 'file://' << val_okiba)
                    end
                  end
                  div_tr << content_tag(:td, preview, class: col_cf1.css_classes)
                  div_tr << "\n"
                end
                # tags
                col_tags = catalog_columns[:tags]
                unless col_tags.nil?
                  tags_val = col_tags.value(issue).collect{ |t| render_catalog_link_tag(t) }.join(', ').html_safe
                  div_tr << content_tag(:td, tags_val, class: col_tags.css_classes)
                end
              end
              div_tbody << "\n"
            end
          end
        end
      end
    end
    return raw(html_text)
  end

  def get_visuals_path(path_text)
    'https://wLb8vs.d-seeds.com/visuals?path=' << Base64.urlsafe_encode64(path_text)
  end

  def render_selected_cagalog_tags
    content = ''.html_safe
    unless @select_tags.nil?
      @select_tags.each_with_index do |t, i|
        tag = @catalog_all_tags.find { |tt| tt.name == t }
        unless tag.nil?
          content << content_tag(:span, " and ") if i > 0
          content << render_catalog_link_tag(tag, show_count: true, del_btn_selected: true)
        end
      end
      content << content_tag(:span, " : ")
      content << content_tag(:span, link_to(l(:label_clear_select), controller: 'issues_catalog', action: 'index'))
    end
    content
  end

  def render_catalog_tag_tabs
    catalog_tag_categories = @project.catalog_tag_categories
    if catalog_tag_categories.any?
      # selected_tab = params[:tab]
      # selected_tab ||= catalog_tag_categories.first.name

      content_tag_push(:div) do |div_wrap|
        div_wrap << content_tag_push(:div, class: 'catalog-category-tabs') do |div_tabs|
          tabs_areas = ''.html_safe
          contents_areas = ''.html_safe
          catalog_tag_categories.each_with_index do |tag_category, i|
            is_selected = (i == 0)
            tab_class = 'catalog-category-tab'
            tab_class << ' active-tab' if is_selected
            tabs_areas << content_tag(:div, tag_category.name, class: tab_class)
            content_class = 'catalog-category-content'
            content_class << ' show-content' if is_selected
            contents_areas << content_tag_push(:div, class: content_class) do |div_page|
              div_page << content_tag(:p, tag_category.description)
              div_page << content_tag_push(:ul, class: 'catalog-category-tags') do |div_category|
                @catalog_all_tags.each do |tag|
                  tag.catalog_tag_categories.each do |tc|
                    if tc.id == tag_category.id
                      div_category << content_tag(:li, render_catalog_link_tag(tag, show_count: true), class: 'tags')
                    end
                  end
                end
              end
            end
          end
          div_tabs << content_tag(:div, tabs_areas, class: 'catalog-category-tabs-area')
          div_tabs << content_tag(:div, contents_areas, class: 'catalog-category-contents-area')
        end
        div_wrap << content_tag(:hr, '', class: 'catalog-separator')
        div_wrap << content_tag_push(:div, class: 'catalog-other-tags') do |div_other|
          @catalog_all_tags.each do |tag|
            if tag.catalog_tag_categories.empty?
              div_other << content_tag(:span, render_catalog_link_tag(tag, show_count: true), class: 'tags')
            end
          end
        end
      end
    else
      render_catalog_tags
    end
  end

  def render_catalog_tags
    tags = @catalog_all_tags

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
      tag_bg_color = '#d0d0d0'  # tag_color(tag)
      tag_fg_color = tag_fg_color(tag_bg_color)
      tag_style = "background-color: #{tag_bg_color}; color: #{tag_fg_color}"
    end

    filters = options[:del_btn_selected] ? make_minus_filters(:tags, tag.name) : make_filters(:tags, tag.name)
    filters << [:status_id, 'o'] if options[:open_only]

    if options[:use_search]
      content =  link_to tag, { controller: 'search', action: 'index',
        id: @project, q: tag.name, wiki_pages: true, issues: true,
        style: tag_style }
    else
      tag_name = tag.name
      if options[:del_btn_selected]
        tag_name = content_tag(:span, l(:button_clear), class: 'icon-only catalog-icon-clear-selected')
        tag_name << tag.name
      end
      content = link_to_catalog_filter(tag_name, filters, project_id: @project)
    end
    if options[:show_count]
      if @catalog_selected_tags.empty?
        count = tag.count
      else
        t = @catalog_selected_tags.find { |tt| tt.name == tag.name }
        count = t ? t.count : 0
      end
      content << content_tag('span', "(#{count})", class: 'tag-count')
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
    if @select_filters.nil?
      @select_filters = []
    end
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

  def make_minus_filters(minus_type, minus_value)
    if @select_filters.nil?
      @select_filters = []
    end
    filters = Marshal.load(Marshal.dump(@select_filters))
    filters.each do |f|
      if f[0] == minus_type
        f[2].each do |f2|
          if f2 == minus_value
            f[2].delete(f2)
          end
        end
        if f[2].length < 1
          filters.delete(f)
        end
      end
    end
    filters
  end

end
