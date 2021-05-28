# get 'issues_catalog', to: 'issues_catalog#index'
get '/projects/:project_id/issues_catalog', to: 'issues_catalog#index'

get '/projects/:project_id/catalog_tag_categories/new', to: 'catalog_tag_categories#new'
post '/projects/:project_id/catalog_tag_categories/new', to: 'catalog_tag_categories#create'

get '/catalog_tag_categories/:id/edit', to: 'catalog_tag_categories#edit'
delete '/catalog_tag_categories/:id', to: 'catalog_tag_categories#destroy'
