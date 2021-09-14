class FavoritesController < ApplicationController
  before_action :require_login, :find_favoriteables, :only => [:favorite, :unfavorite]

  def favorite
    set_favorite(@favoriteables, User.current, true)
  end

  def unfavorite
    set_favorite(@favoriteables, User.current, false)
  end

  private

  def find_favoriteables
    scope = Issue.where(:id => Array.wrap(params[:issue_id]))
    @favoriteables = scope.to_a
  end

  def set_favorite(favoriteables, user, is_favorite)
    favoriteables.each do |favoriteable|
      favoriteable.set_favorite(user, is_favorite)
    end
    respond_to do |format|
      format.html do
        text = is_favorite ? 'Add Favorite.' : 'Remove Favorite.'
        redirect_to_referer_or do
          render(:html => text, :status => 200, :layout => true)
        end
      end
      format.js do
        render(:partial => 'issues_catalog/set_favorite',
               :locals => {:issues => favoriteables, :is_favorite => is_favorite})
      end
    end
  end

end
