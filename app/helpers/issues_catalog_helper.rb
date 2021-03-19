module IssuesCatalogHelper

  def render_catalog_link_category(category, options = {})
    filters = [[:category_id, '=', category]]
    filters << [:status_id, 'o'] if options[:open_only]

    content = link_to_catalog_filter category.name, filters, project_id: @project

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

end
