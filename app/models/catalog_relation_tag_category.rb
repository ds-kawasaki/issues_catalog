class CatalogRelationTagCategory < ActiveRecord::Base
  belongs_to :tag, :class_name => 'ActsAsTaggableOn::Tag', :foreign_key => 'tag_id'
  belongs_to :catalog_tag_category, :class_name => 'CatalogTagCategory', :foreign_key => 'catalog_tag_category_id'
end
