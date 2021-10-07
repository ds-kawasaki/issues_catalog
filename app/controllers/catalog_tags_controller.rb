class CatalogTagsController < ApplicationController
  before_action :find_project_by_project_id, only: [:edit, :update, :bulk_update]
  before_action :find_tag, only: [:edit, :update, :field_update]
  accept_api_auth :update, :bulk_update, :field_update


  def edit
  end

  def update
    @catalog_tag.update_attributes(catalog_tag_params)
    if @catalog_tag.save
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

  def bulk_update
    operate = params[:operate]
    return if operate.blank? || operate == 'none'

    sabun = params[:catalog_tag_category_ids].reject(&:blank?).map(&:to_i)

    ActsAsTaggableOn::Tag.where(id: params[:ids]).each do |tag|
      old_list = tag.catalog_tag_category_ids.to_s

      case operate
      when 'op_add'
        tag.catalog_tag_category_ids |= sabun
      when 'op_del'
        tag.catalog_tag_category_ids -= sabun
      end

      new_list = tag.catalog_tag_category_ids.to_s
      unless old_list == new_list
        tag.save
      end
    end

    redirect_to_settings_in_projects
  end

  def field_update
    # @catalog_tag.safe_attributes = catalog_tag_params
    @catalog_tag.update_attributes(catalog_tag_params)
    if @catalog_tag.save
      render json: @catalog_tag
    else
      head :bad_request
    end
  end

  private

  def catalog_tag_params
    params.require(:catalog_tag).permit(:name, :description, catalog_tag_category_ids: [], catalog_tag_group_ids: [])
  end

  def redirect_to_settings_in_projects
    redirect_to settings_project_path(@project, :tab => 'issues_catalog')
  end

  def find_tag
    @catalog_tag = ActsAsTaggableOn::Tag.where(id: params[:id]).first or render_404
  end
end
