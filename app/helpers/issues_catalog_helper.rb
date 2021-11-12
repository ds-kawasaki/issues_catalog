module IssuesCatalogHelper
  include ActsAsTaggableOn::TagsHelper
  include TagsHelper

  # content_tagのネスト用 参考 https://qiita.com/EastResident/items/59856cbc7d8e73138a49
  def content_tag_push(type, *option)
    tags = []
    yield tags
    content_tag(type, tags.reduce(:+), *option)
  end

  def catalog_select_any?
    @select_tags.present? || @select_category.present? || @favorites.present? || @issues_filters.present?
  end

  MOVIE_EXTS = ['.avi', '.mp4', '.mov']

  def render_catalog_issues
    cfid_thumbnails = Setting.plugin_issues_catalog[:catalog_cf_thumbnails].to_i
    cfid_place = Setting.plugin_issues_catalog[:catalog_cf_place].to_i
    cfid_image = Setting.plugin_issues_catalog[:catalog_cf_image].to_i
    thumbnail_base_url = Setting.plugin_issues_catalog[:catalog_url_thumbnails].freeze

    html_text = hidden_field_tag('back_url', url_for(:params => request.query_parameters), :id => nil)
    html_text << query_columns_hidden_tags(@query)
    html_text << "\n"
    html_text << content_tag_push(:div, class: 'autoscroll') do |div_autoscroll|
      div_autoscroll << content_tag_push(:table, class: 'list catalog-issues odd-even' << @query.css_classes) do |div_table|
        div_table << content_tag(:thead)
        div_table << content_tag_push(:tbody) do |div_tbody|
          Issue.where(id: @issue_ids)
               .preload(:project, :tracker, :status, :priority, :custom_values, :attachments, :favorites)
               .sort_by { |o| @issue_ids.index(o.id) }
               .each do |issue|
            tr_id = "issue-#{issue.id}"
            tr_class = "hascontextmenu #{cycle('odd', 'even')} #{issue.css_classes}"
            div_tbody << content_tag_push(:tr, id: tr_id, class: tr_class) do |div_tr|
              # id
              div_tr << content_tag_push(:td, class: 'id') do |div_td|
                div_td << content_tag_push(:div, class: 'catalog-issue-top') do |div_issue_top|
                  id_class = "favorite-#{issue.id}"
                  id_class << ' icon icon-fav' if issue.favorites.find { |f| f.user_id == User.current.id }
                  div_issue_top << check_box_tag("ids[]", issue.id.to_s, false, id: nil)
                  div_issue_top << content_tag(:span, link_to(issue.id.to_s, issue_path(issue)), class: id_class)
                  div_issue_top << content_tag(:span, issue.priority.to_s, class: 'catalog-issue-priority')
                  div_issue_top << link_to_context_menu
                end
              end
              div_tr << "\n"
              cv_thumbnail = issue.custom_field_values.detect { |v| v.custom_field.id == cfid_thumbnails }
              cv_okiva = issue.custom_field_values.detect { |v| v.custom_field.id == cfid_place }
              cv_image = issue.custom_field_values.detect { |v| v.custom_field.id == cfid_image }
              if cv_thumbnail.present?
                val_thumbnail = cv_thumbnail.value
                if val_thumbnail.present?
                  val_thumbnail[0] = '' if val_thumbnail[0] == '"'
                  val_thumbnail[-1] = '' if val_thumbnail[-1] == '"'
                  url_thumbnail = thumbnail_base_url + Base64.urlsafe_encode64(val_thumbnail)
                end
              end
              if cv_okiva.present?
                val_okiba = cv_okiva.value
                if val_okiba.present?
                  val_okiba[0] = '' if val_okiba[0] == '"'
                  val_okiba[-1] = '' if val_okiba[-1] == '"'
                end
              end
              if cv_image.present?
                val_image = cv_image.value
                if val_image.present?
                  val_image[0] = '' if val_image[0] == '"'
                  val_image[-1] = '' if val_image[-1] == '"'
                end
              end
              # データ調整前の暫定処理 
              if val_okiba.blank? && is_foler(val_image)
                val_okiba = val_image
              end
              # subject
              if val_okiba.present?
                class_subject = 'subject'
                class_subject << ' icon catalog-icon-folder' if is_foler(val_okiba)
                div_tr << content_tag(:td, link_to(issue.subject.to_s, 'file://' << val_okiba), class: class_subject)
              else
                div_tr << content_tag(:td, issue.subject.to_s, class: 'subject')
              end
              div_tr << "\n"
              # thumbnail
              if url_thumbnail.present?
                thumbnail = ''.html_safe
                if MOVIE_EXTS.include?(File.extname(val_thumbnail))
                  thumbnail << video_tag('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                                         'data-src': url_thumbnail, size: '300x300',
                                         autoplay: true, playsinline: true, muted: true, loop: true, preload: 'none', class: 'lozad')
                else
                  thumbnail << image_tag('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                                         'data-src': url_thumbnail, size: '300x300',
                                         class: 'lozad')
                end
                if val_image.present?
                  thumbnail = link_to(thumbnail, 'file://' << val_image)
                end
                if issue.description?
                  tooltip = content_tag(:div, textilizable(issue, :description, :attachments => issue.attachments), class: 'wiki')
                  thumbnail << content_tag(:div, tooltip, class: 'thumbnail-description')
                end
                div_tr << content_tag(:td, thumbnail, class: 'thumbnail')
                div_tr << "\n"
              end
              # tags
              tags_val = ActsAsTaggableOn::Tag
                .select('tags.name')
                .joins(:taggings)
                .where(taggings: { taggable_type: 'Issue', taggable_id: issue.id})
                .pluck('tags.name')
                .collect { |t| content_tag('span', link_to(t, '#'), class: 'catalog-tag-label') }.join(', ').html_safe
              div_tr << content_tag(:td, tags_val, class: 'tags')
            end
            div_tbody << "\n"
          end
        end
      end
    end
    return raw(html_text)
  end

  def is_sozai(path_text)
    return false if path_text.blank? || path_text.length < 5

    # フォルダ名に'.'入っている場合 File.extname だけだと誤判定する。末尾が '.'+3文字 or .jpeg で判定する
    path_text[-4] == '.' || path_text.slice(-5, 5).casecmp?('.jpeg')
  end

  def is_foler(path_text)
    return false if path_text.blank?

    !is_sozai(path_text)
  end

  def render_catalog_tag_tabs
    catalog_tag_categories = @project.catalog_tag_categories
    content_tag_push(:div, class: 'category-tab-contents') do |div_tabs|
      tabs_areas = ''.html_safe
      contents_areas = ''.html_safe

      tabs_areas << content_tag(:li, l(:label_favorite_tab), class: 'category-tab', id: 'category-tab-favorite')
      contents_areas << content_tag(:div, render_favorite_tab, class: 'category-content')

      tabs_areas << content_tag(:li, l(:label_history_tab), class: 'category-tab', id: 'category-tab-history')
      contents_areas << content_tag(:div, render_history_tab, class: 'category-content')

      div_tabs << content_tag_push(:div, class: 'tabs-wrap') do |div_tab_wrap|
        div_tab_wrap << content_tag(:ul, tabs_areas, class: 'tabs-area')
      end
      div_tabs << content_tag(:div, contents_areas, class: 'contents-area')
    end
  end

  def render_favorite_tab
    ret_content = content_tag(:p, l(:favorite_description))
    ret_content << content_tag_push(:ul, class: 'favorite-tags', id: 'catalog-category-favorite') do |div_favorite|
      div_favorite << content_tag(:li, content_tag(:span,
                                                   link_to_catalog_filter(l(:label_my_favorites),
                                                                          make_favorite_filter(User.current.id),
                                                                          {project_id: @project, sort: 'priority:desc', sm: @select_mode}),
                                                   class: 'catalog-my-favorite'))

      favorited_users = Favorite.select(:user_id).group(:user_id)
      users = User.where(id: favorited_users).where.not(id: User.current.id).status(User::STATUS_ACTIVE).order(:login)
      users.each do |user|
        div_favorite << content_tag(:li, content_tag(:span,
                                                     link_to_catalog_filter(user.name << l(:label_user_favorites),
                                                                            make_favorite_filter(user.id),
                                                                            {project_id: @project, sort: 'priority:desc', sm: @select_mode}),
                                                     class: 'catalog-user-favorite'))
      end
    end
    ret_content
  end

  def render_history_tab
    ret_content = content_tag(:p, l(:history_description))
    ret_content << content_tag(:ul, '', class: 'history-tags', id: 'catalog-category-history')
    ret_content
  end

  # link_to_filterのコントローラー違い
  def link_to_catalog_filter(title, filters, options = {})
    options.merge! link_to_catalog_filter_options(filters)
    link_to title, options
  end

  # link_to_filter_optionsのコントローラー違い
  def link_to_catalog_filter_options(filters)
    options = { controller: 'issues_catalog', action: 'index', set_filter: 1, f: [], v: {}, op: {} }

    filters.each do |f|
      name, operator, value = f

      options[:f].push(name)
      options[:op][name] = operator
      options[:v][name] = value.instance_of?(Array) ? value : [value]
    end
    options
  end

  def make_favorite_filter(user_id)
    filters = [[:favorites, '=', Array.wrap(user_id)]]
    filters << [:status_id, 'o'] if @issues_open_only
    filters
  end
end
