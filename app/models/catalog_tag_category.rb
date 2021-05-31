class CatalogTagCategory < ActiveRecord::Base
  include Redmine::SafeAttributes
  belongs_to :project
  validates :project_id, presence: true
  has_many :taggings, :foreign_key => 'catalog_category_id', :dependent => :nullify

  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [:project_id], conditions: -> { where(status: 0) }
  validates_length_of :name, :maximum => 60

  safe_attributes 'name', 'description'

  def self.search_by_project(project_id)
    CatalogTagCategory.where(project_id: project_id, status: 0)
                      .order('name')
  end

  def set_status_alive
    self.status = 0
  end

  def set_status_deleted
    self.status = 1
  end

  def <=>(tag_category)
    name <=> tag_category.name
  end

  def to_s; name end
end
