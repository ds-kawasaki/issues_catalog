class IssuesCatalogController < ApplicationController
  before_action :find_project

  def index
  end

  private

  def find_project
    @project = Project.find(params[:project_id])
  end
end
