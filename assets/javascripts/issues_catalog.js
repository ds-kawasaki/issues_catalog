(function () {
  'use strict';

  console.log('test issues_catalog js');

  const tags = $('.catalog-category-tab');
  $('.catalog-category-tab').on('click', function () {
    $('.active-tab').removeClass('active-tab');
    $(this).addClass('active-tab');
    const index = tags.index(this);
    $('.catalog-category-content').removeClass('show-content').eq(index).addClass('show-content');
  });

})();