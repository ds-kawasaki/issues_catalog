get '/projects/:project_id/issues_catalog', to: 'issues_catalog#index'

resources :projects do
  shallow do
    resources :catalog_tag_categories
  end
end

resources :catalog_tags, only: [:edit, :update]
