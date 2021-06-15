# frozen_string_literal: true

class CatalogTagCategory < ActiveRecord::Base
  include Redmine::SafeAttributes
  belongs_to :project
  validates :project_id, presence: true
  has_many :catalog_relation_tag_categories
  has_many :tags, :through => :catalog_relation_tag_categories

  accepts_nested_attributes_for :catalog_relation_tag_categories, allow_destroy: true

  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [:project_id], :conditions => -> { active }
  validates_length_of :name, :maximum => 60

  safe_attributes 'name', 'description'

  scope :active, -> { where(status: -Float::INFINITY...100) }
  scope :search_by_project, ->(project_id) { active.where(project_id: project_id).order('name') }
  scope :find_by_tag, ->(tag_id) { active.find(tag_id) }

  def set_status_alive
    self.status = 0
  end

  def set_status_deleted
    self.status = 100
  end

  def is_active?
    self.status < 100
  end

  def <=>(tag_category)
    name <=> tag_category.name
  end

  def to_s; name end
end
