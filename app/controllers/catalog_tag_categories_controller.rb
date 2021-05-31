class CatalogTagCategoriesController < ApplicationController
  menu_item :settings
  model_object IssueCategory
  before_action :find_model_object, :except => [:index, :new, :create]
  before_action :find_project_from_association, :except => [:index, :new, :create]
  before_action :find_project_by_project_id, :only => [:index, :new, :create]
  accept_api_auth :index, :show, :create, :update, :destroy

  def index
    respond_to do |format|
      format.html { redirect_to_settings_in_projects }
      format.api { @categories = @project.catalog_tag_categories.to_a }
    end
  end

  def show
    respond_to do |format|
      format.html { redirect_to_settings_in_projects }
      format.api
    end
  end

  def new
    @category = @project.catalog_tag_categories.build
    @category.safe_attributes = params[:catalog_tag_category]

    respond_to do |format|
      format.html
      format.js
    end
  end

  def create
    @category = @project.catalog_tag_categories.build
    @category.safe_attributes = params[:catalog_tag_category]
    @category.project = @project
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

  def edit
  end

  def update
  end

  def destroy
  end

  private

  def redirect_to_settings_in_projects
    redirect_to settings_project_path(@project, :tab => 'issues_catalog')
  end

  def find_model_object
    super
    @category = @object
  end
end