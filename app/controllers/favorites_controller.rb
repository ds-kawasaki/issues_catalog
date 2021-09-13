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
  end

end
