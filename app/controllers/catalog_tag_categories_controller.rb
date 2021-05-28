class CatalogTagCategoriesController < ApplicationController
  def new
    @category = CatalogTagCategory.new
  end

  def create
    @category = @project.catalog_tag_categories.build
    @category.safe_attributes = params[:catalog_tag_category]
    if @category.save
      respond_to do |format|
        format.html do
          flash[:notice] = l(:notice_successful_create)
          redirect_to_settings_in_projects
        end
        format.js
        format.api { render :action => 'show', :status => :created, :location => catalog_tag_category_path(@category) }
      end
    else
      respond_to do |format|
        format.html { render :action => 'new'}
        format.js   { render :action => 'new'}
        format.api { render_validation_errors(@category) }
      end
    end
  end

  def destroy
  end

  private

  def redirect_to_settings_in_projects
    redirect_to settings_project_path(@project, :tab => 'issues_catalog')
  end
end