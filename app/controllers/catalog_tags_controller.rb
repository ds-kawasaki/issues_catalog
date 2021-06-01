class CatalogTagsController < ApplicationController
  before_action :find_project_by_project_id, only: [:edit, :update]
  before_action :find_tag, only: [:edit, :update]
  accept_api_auth :update


  def edit
  end

  def update
    if @catalog_tag.update_attributes(catalog_tag_params)
      respond_to do |format|
        format.html {
          flash[:notice] = l(:notice_successful_update)
          redirect_to_settings_in_projects
        }
        format.api { render_api_ok }
      end
    else
      respond_to do |format|
        format.html { render :action => 'edit' }
        format.api { render_validation_errors(@catalog_tag) }
      end
    end
  end

  private

  def catalog_tag_params
    params.require(:catalog_tag).permit(:name, :catalog_tag_category_id)
  end

  def redirect_to_settings_in_projects
    redirect_to settings_project_path(@project, :tab => 'issues_catalog')
  end

  def find_tag
    @catalog_tag = ActsAsTaggableOn::Tag.where(id: params[:id]).first or render_404
  end
end
