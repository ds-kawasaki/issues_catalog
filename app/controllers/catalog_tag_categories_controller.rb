class CatalogTagCategoriesController < ApplicationController
  menu_item :settings
  model_object CatalogTagCategory
  before_action :find_model_object, :except => [:index, :new, :create]
  before_action :find_project_from_association, :except => [:index, :new, :create, :field_update]
  before_action :find_project_by_project_id, :only => [:index, :new, :create]
  accept_api_auth :index, :show, :create, :update, :destroy

  def index
    respond_to do |format|
      format.html { redirect_to_settings_in_projects }
      format.api { @catalog_tag_category = @project.catalog_tag_categories.to_a }
    end
  end

  def show
    respond_to do |format|
      format.html { redirect_to_settings_in_projects }
      format.api
    end
  end

  def new
    @catalog_tag_category = @project.catalog_tag_categories.build
    @catalog_tag_category.safe_attributes = params[:catalog_tag_category]

    respond_to do |format|
      format.html
      format.js
    end
  end

  def create
    @catalog_tag_category = @project.catalog_tag_categories.build
    @catalog_tag_category.safe_attributes = catalog_tag_category_params
    @catalog_tag_category.project = @project
    if @catalog_tag_category.save
      respond_to do |format|
        format.html do
          flash[:notice] = l(:notice_successful_create)
          redirect_to_settings_in_projects
        end
        format.js
        format.api { render :action => 'show', :status => :created, :location => catalog_tag_category_path(@catalog_tag_category) }
        format.json { render json: { status: 'SUCCESS', data: @catalog_tag_category } }
      end
    else
      messages = Array.wrap(@catalog_tag_category).map {|object| object.errors.full_messages}.flatten.join('\n')
      respond_to do |format|
        format.html { render :action => 'new'}
        format.js   { render :action => 'new'}
        format.api { render_validation_errors(@catalog_tag_category) }
        format.json { render json: { status: 'ERROR', message: messages, data: @catalog_tag_category } }
      end
    end
  end

  def edit
  end

  def update
    @catalog_tag_category.safe_attributes = catalog_tag_category_params
    if @catalog_tag_category.save
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
        format.api { render_validation_errors(@catalog_tag_category) }
      end
    end
  end

  def destroy
    # ここでカテゴリ割り当ててるタグを開放する 
    @catalog_tag_category.catalog_relation_tag_categories.destroy_all
    @catalog_tag_category.set_status_deleted
    if @catalog_tag_category.save
      respond_to do |format|
        format.html { redirect_to_settings_in_projects }
        format.api { render_api_ok }
      end
    else
      respond_to do |format|
        format.html { redirect_to_settings_in_projects }
        format.api { render_validation_errors(@catalog_tag_category) }
      end
    end
  end

  def field_update
    @catalog_tag_category.safe_attributes = catalog_tag_category_params
    if @catalog_tag_category.save
      render json: { status: 'SUCCESS', data: @catalog_tag_category }
    else
      messages = Array.wrap(@catalog_tag_category).map {|object| object.errors.full_messages}.flatten.join('\n')
      render json: { status: 'ERROR', message: messages, data: @catalog_tag_category }
    end
  end

  private

  def catalog_tag_category_params
    params.require(:catalog_tag_category).permit(:name, :description)
  end

  def redirect_to_settings_in_projects
    redirect_to settings_project_path(@project, :tab => 'issues_catalog')
  end

  def find_model_object
    super
    @catalog_tag_category = @object
  end
end