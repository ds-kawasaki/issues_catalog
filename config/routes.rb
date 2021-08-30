get '/projects/:project_id/issues_catalog', to: 'issues_catalog#index', as: 'project_issues_catalog'

get 'issues_catalog/add_tag', :to => 'issues_catalog#add_tag', :as => 'catalog_add_tag'
get 'issues_catalog/delete_tag', :to => 'issues_catalog#delete_tag', :as => 'catalog_delete_tag'
patch 'issues_catalog/update_tag', :to => 'issues_catalog#update_tag'
patch 'catalog_tags/bulk_update', to: 'catalog_tags#bulk_update', as: 'catalog_tags_bulk_update'

resources :projects do
  shallow do
    resources :catalog_tag_categories
  end
end

resources :catalog_tags, only: [:update, :bulk_update]
get '/projects/:project_id/catalog_tags/:id/edit', to: 'catalog_tags#edit'
