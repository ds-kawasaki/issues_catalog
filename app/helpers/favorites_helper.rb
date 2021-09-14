module FavoritesHelper

  def favorite_link(issues, user)
    return '' unless user && user.logged?

    issues = Array.wrap(issues)
    return '' unless issues.any?

    favorited = Favorite.any_favorited?(issues, user)
    id = (issues.size == 1 ? issues.first.id : 'bulk')
    css = ["favorite-#{id}", favorited ? 'icon icon-fav' : 'icon icon-fav-off'].join(' ')
    text = favorited ? l(:button_unfavorite) : l(:button_favorite)
    url = favorite_path(
      :issue_id => (issues.size == 1 ? issues.first.id : issues.map(&:id).sort)
    )
    method = favorited ? 'delete' : 'post'

    link_to text, url, :remote => true, :method => method, :class => css
  end

end
