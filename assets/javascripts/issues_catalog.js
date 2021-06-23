// jQuery用DOM準備完了時 document ready
$(function () {
  'use strict';

  let localStorageKey = 'catalog-category-tabs-state';
  // true if local storage is available
  const storageAvailable = (type) => {
    let storage;
    try {
      storage = window[type];
      const testValue = '__storage_test__';
      storage.setItem(testValue, testValue);
      storage.removeItem(testValue);
      return true;
    } catch (e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        (storage && storage.length !== 0);
    }
  };


  // メインカテゴリタブ切替クリック時 
  const tags = $('.category-tab');
  $('.category-tab').on('click', function () {
    $('.active-tab').removeClass('active-tab');
    $(this).addClass('active-tab');
    const index = tags.index(this);
    $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
    localStorage.setItem(localStorageKey, $(this).attr('id'));
  });

  // メインカテゴリタブ切替読み込み時
  const setCatalogTabOnLoad = () => {
    if (!storageAvailable('localStorage')) { return; }

    const bodyClass = $('body').attr('class');
    if (bodyClass) {
      try {
        localStorageKey += '-' + bodyClass.split(/\s+/).filter(function (s) {
          return s.match(/project-.*/);
        }).sort().join('-');
      } catch (e) {
        // in case of error (probably IE8), continue with the unmodified key
      }
    }

    const cateTab = localStorage.getItem(localStorageKey);
    if (!cateTab) { return; }
    const activeTab = $('#' + cateTab);
    if (!activeTab) { return; }

    $('.active-tab').removeClass('active-tab');
    activeTab.addClass('active-tab');
    const index = tags.index(activeTab);
    $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
  };

  //  メインカテゴリタブの左右スクロール可否調整
  const resizedCatalogTab = () => {
    const tabsArea = $('.tabs-area');
    const areaWidth = tabsArea.outerWidth();
    const tabsWidth = tabsArea.get(0).scrollWidth;
    const scrollWidth = parseInt(tabsWidth - areaWidth);
    if (scrollWidth > 0) {
      $('.tabs-scrl-btn').show();
      // const scrollPos = tabsArea.get(0).scrollLeft;
      // if (scrollPos > 0) {
      //   $('#tabs-scrl-r-btn').hide();
      // }
      // else {
      //   $('#tabs-scrl-l-btn').hide();
      // }
    } else {
      $('.tabs-scrl-btn').hide();
    }
  };

  const resize = () => {
    let timeoutID = 0;
    const delay = 250;
    window.addEventListener('resize', () => {
      if (timeoutID != 0) {
        clearTimeout(timeoutID);
      }
      timeoutID = setTimeout(resizedCatalogTab, delay);
    });
    setTimeout(resizedCatalogTab, 0); //  初回
  };
  resize();

  $('#tabs-scrl-l-btn').on('click', function() {
    $('.tabs-area').animate({
      scrollLeft: 0
    });
    $(this).hide();
    $('#tabs-scrl-r-btn').show();
  });
  $('#tabs-scrl-r-btn').on('click', function() {
    const tabsArea = $('.tabs-area');
    const areaWidth = tabsArea.outerWidth();
    const tabsWidth = tabsArea.get(0).scrollWidth;
    const scrollWidth = parseInt(tabsWidth - areaWidth);
    tabsArea.animate({
      scrollLeft: scrollWidth
    });
    $(this).hide();
    $('#tabs-scrl-l-btn').show();
  });

  setCatalogTabOnLoad();

});

