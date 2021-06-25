// jQuery用DOM準備完了時 document ready
$(function () {
  'use strict';

  const MAX_HISTORY = 20;

  let localStorageKeyCategoryTab = 'catalog-category-tabs-state';
  let localStorageKeyHistory = 'catalog-history';
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
  tags.on('click', function () {
    $('.active-tab').removeClass('active-tab');
    $(this).addClass('active-tab');
    const index = tags.index(this);
    $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
    localStorage.setItem(localStorageKeyCategoryTab, $(this).attr('id'));
  });

  // メインカテゴリタブ切替読み込み時
  const setCatalogTabOnLoad = () => {
    const cateTab = localStorage.getItem(localStorageKeyCategoryTab);
    if (!cateTab) { return; }
    const activeTab = $('#' + cateTab);
    if (!activeTab) { return; }

    $('.active-tab').removeClass('active-tab');
    activeTab.addClass('active-tab');
    const index = tags.index(activeTab);
    $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
  };


  const scrollHorizontal = (area, direction) => {
    const element = $(area);
    const areaWidth = element.outerWidth();
    const scrollWidth = element.get(0).scrollWidth;
    const movableWidth = scrollWidth - areaWidth;
    const oneScrollValue = Math.min(movableWidth, areaWidth / 2);
    const current = element.get(0).scrollLeft;
    let newValue, isLimit;
    if (direction < 0) {
      newValue = Math.max(current - oneScrollValue, 0);
      isLimit = newValue === 0;
    } else {
      newValue = Math.min(current + oneScrollValue, movableWidth);
      isLimit = newValue === movableWidth;
    }
    element.animate({
      scrollLeft: newValue
    });
    return isLimit;
  };
  //  メインカテゴリタブの左右スクロールボタンクリック時
  $('#tabs-scrl-l-btn').on('click', function () {
    if (scrollHorizontal('.tabs-area', -1)) {
      $(this).hide();
    }
    $('#tabs-scrl-r-btn').show();
  });
  $('#tabs-scrl-r-btn').on('click', function () {
    if (scrollHorizontal('.tabs-area', 1)) {
      $(this).hide();
    }
    $('#tabs-scrl-l-btn').show();
  });

  //  メインカテゴリタブの左右スクロール可否調整
  const resizedCatalogTab = () => {
    const tabsArea = $('.tabs-area');
    const areaWidth = tabsArea.outerWidth();
    const scrollWidth = tabsArea.get(0).scrollWidth;
    const movableWidth = scrollWidth - areaWidth;
    if (movableWidth > 0) {
      $('.tabs-scrl-btn').show();
    } else {
      $('.tabs-scrl-btn').hide();
    }
  };

  //  読み込み時とウィンドウリサイズ時のコールバック登録
  const setReseizeCallback = () => {
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


  //  タグのリンククリック時
  $('.catalog-tag-label a').on('click', function() {
    const tagLabel = $(this).text();
    // console.log(tagLabel);
    const rawValue = localStorage.getItem(localStorageKeyHistory);
    const history = rawValue ? JSON.parse(rawValue) : [];
    const idx = history.indexOf(tagLabel);
    if (idx >= 0) {
      history.splice(idx, 1);
    }
    history.unshift(tagLabel);
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    localStorage.setItem(localStorageKeyHistory, JSON.stringify(history));
  });
  // ヒストリータブ内容セット
  const setHistoryOnLoad = () => {
    const divHistory = $('#catalog-category-history');
    if (!divHistory) { return; }
    const rawValue = localStorage.getItem(localStorageKeyHistory);
    const history = rawValue ? JSON.parse(rawValue) : [];
    let text = '';
    history.forEach(i => text += i + '<br>');
    divHistory.html(text);
  };


  const setupFromStorageOnLoad = () => {
    if (!storageAvailable('localStorage')) { return; }

    const bodyClass = $('body').attr('class');
    if (bodyClass) {
      try {
        const postfixProject = '-' + bodyClass.split(/\s+/).filter(function (s) {
          return s.match(/project-.*/);
        }).sort().join('-');
        localStorageKeyCategoryTab += postfixProject;
        localStorageKeyHistory += postfixProject;
      } catch (e) {
        // in case of error (probably IE8), continue with the unmodified key
      }
    }

    setCatalogTabOnLoad();
    setHistoryOnLoad();
  };

  setupFromStorageOnLoad();
  setReseizeCallback();

});

