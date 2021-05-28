class CatalogTagCategory < ActiveRecord::Base
  belongs_to :project
  validates :project_id, presence: true
  has_many :taggings, :foreign_key => 'catalog_category_id', :dependent => :nullify

  scope :search_by_project, lambda { |prolect_id|
    where(project_id: prolect_id)
  }

end
