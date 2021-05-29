class CatalogTagCategory < ActiveRecord::Base
  include Redmine::SafeAttributes
  belongs_to :project
  validates :project_id, presence: true
  has_many :taggings, :foreign_key => 'catalog_category_id', :dependent => :nullify

  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [:project_id]
  validates_length_of :name, :maximum => 60

  safe_attributes 'name', 'description'

  scope :search_by_project, lambda { |prolect_id|
    where(project_id: prolect_id)
  }

  # alias :destroy_without_reassign :destroy

  # def destroy(reassign_to = nil)
  #   if reassign_to && reassign_to.is_a?(CatalogTagCategory) && reassign_to.project == self.project
  #     ActsAsTaggableOn::Taggins.where({:catalog_category_id => id}).update_all({:catalog_category_id => reassign_to.id})
  #   end
  #   destroy_without_reassign
  # end

  def <=>(tag_category)
    name <=> tag_category.name
  end

  def to_s; name end
end
