get '/projects/:project_id/issues_catalog', to: 'issues_catalog#index'

get 'issues_catalog/add_tag', :to => 'issues_catalog#add_tag', :as => 'catalog_add_tag'
get 'issues_catalog/delete_tag', :to => 'issues_catalog#delete_tag', :as => 'catalog_delete_tag'
patch 'issues_catalog/update_add_tag', :to => 'issues_catalog#update_add_tag'
patch 'issues_catalog/update_delete_tag', :to => 'issues_catalog#update_delete_tag'

resources :projects do
  shallow do
    resources :catalog_tag_categories
  end
end

resources :catalog_tags, only: [:update]
get '/projects/:project_id/catalog_tags/:id/edit', to: 'catalog_tags#edit'
