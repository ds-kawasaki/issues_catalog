class CatalogTagGroupsController < ApplicationController
  menu_item :settings
  model_object CatalogTagGroup
  before_action :find_model_object, :except => [:index, :new, :create]
  before_action :find_project_from_association, :except => [:index, :new, :create, :field_update]
  before_action :find_project_by_project_id, :only => [:index, :new, :create]
  accept_api_auth :index, :show, :create, :update, :destroy

  def index
    respond_to do |format|
      format.html { redirect_to_settings_in_projects }
      format.api { @catalog_tag_group = @project.catalog_tag_groups.to_a }
    end
  end

  def show
    respond_to do |format|
      format.html { redirect_to_settings_in_projects }
      format.api
    end
  end

  def new
    @catalog_tag_group = @project.catalog_tag_groups.build
    @catalog_tag_group.safe_attributes = params[:catalog_tag_group]

    respond_to do |format|
      format.html
      format.js
    end
  end

  def create
    @catalog_tag_group = @project.catalog_tag_groups.build
    @catalog_tag_group.safe_attributes = catalog_tag_group_params
    @catalog_tag_group.project = @project
    if @catalog_tag_group.save
      respond_to do |format|
        format.html do
          flash[:notice] = l(:notice_successful_create)
          redirect_to_settings_in_projects
        end
        format.js
        format.api { render :action => 'show', :status => :created, :location => catalog_tag_group_path(@catalog_tag_group) }
      end
    else
      respond_to do |format|
        format.html { render :action => 'new'}
        format.js   { render :action => 'new'}
        format.api { render_validation_errors(@catalog_tag_group) }
      end
    end
  end

  def edit
  end

  def update
    @catalog_tag_group.safe_attributes = catalog_tag_group_params
    if @catalog_tag_group.save
      respond_to do |format|
        format.html do
          flash[:notice] = l(:notice_successful_update)
          redirect_to_settings_in_projects
        end
        format.api { render_api_ok }
      end
    else
      respond_to do |format|
        format.html { render :action => 'edit' }
        format.api { render_validation_errors(@catalog_tag_group) }
      end
    end
  end

  def destroy
    @catalog_tag_group.destroy
    respond_to do |format|
      format.html do
        flash[:notice] = l(:notice_successful_delete)
        redirect_to_settings_in_projects
      end
      format.api { render_api_ok }
    end
  end

  def field_update
    @catalog_tag_group.safe_attributes = catalog_tag_group_params
    if @catalog_tag_group.save
      render json: { status: 'SUCCESS', data: @catalog_tag_group }
    else
      messages = Array.wrap(@catalog_tag_group).map {|object| object.errors.full_messages}.flatten.join('\n')
      render json: { status: 'ERROR', message: messages, data: @catalog_tag_group }
    end
  end

  private

  def catalog_tag_group_params
    params.require(:catalog_tag_group).permit(:name, :description)
  end

  def redirect_to_settings_in_projects
    redirect_to settings_project_path(@project, :tab => 'issues_catalog')
  end

  def find_model_object
    super
    @catalog_tag_group = @object
  end
end
