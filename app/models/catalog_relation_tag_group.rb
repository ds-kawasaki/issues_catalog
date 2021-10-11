class CatalogRelationTagGroup < ActiveRecord::Base
  include Redmine::SafeAttributes
  belongs_to :tag, :class_name => 'ActsAsTaggableOn::Tag', :foreign_key => 'tag_id'
  belongs_to :catalog_tag_group, :class_name => 'CatalogTagGroup', :foreign_key => 'catalog_tag_group_id'

  validates_uniqueness_of :tag_id, scope: :catalog_tag_group_id
end
