get '/projects/:project_id/issues_catalog', to: 'issues_catalog#index'

resources :projects do
  shallow do
    resources :catalog_tag_categories
  end
end

resources :catalog_tags, only: [:update]
get '/projects/:project_id/catalog_tags/:id/edit', to: 'catalog_tags#edit'
