class CatalogTagGroup < ActiveRecord::Base
  include Redmine::SafeAttributes
  belongs_to :project
  validates :project_id, presence: true
  has_many :catalog_relation_tag_groups
  has_many :tags, :through => :catalog_relation_tag_groups

  accepts_nested_attributes_for :catalog_relation_tag_groups, allow_destroy: true

  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [:project_id]
  validates_length_of :name, :maximum => 60

  safe_attributes 'name', 'description'

  scope :search_by_project, ->(project_id) { where(project_id: project_id).order('name') }
  scope :find_by_tag, ->(tag_id) { find(tag_id) }

  def <=>(tag_group)
    name <=> tag_group.name
  end

  def to_s; name end
end
