// jQuery用DOM準備完了時 document ready
$(function () {
  'use strict';

  const MAX_HISTORY = 20;

  let localStorageKeyCategoryTab = 'catalog-category-tabs-state';
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
    if (!activeTab.length) { return; }

    $('.active-tab').removeClass('active-tab');
    activeTab.addClass('active-tab');
    const index = tags.index(activeTab);
    $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
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
      } catch (e) {
        // in case of error (probably IE8), continue with the unmodified key
      }
    }

    setCatalogTabOnLoad();
  };

  // サムネイルオンリーボタン 
  $('#catalog-btn-thumbnails').on('click', function () {
    $(this).toggleClass('only-thumbnails');
    // isOnlyThumbnails = $(this).hasClass('only-thumbnails');
    $('table.catalog-issues td.id').toggle();
    $('table.catalog-issues td.subject').toggle();
    $('table.catalog-issues td.tags').toggle();
    $('.pagination.top').toggle();
  });

  // タグ検索関連
  const setupSearchTag = () => {
    var projectName = '';
    const tmpProjectName = $('body').attr('class').match(/project-([\w-]+)/);
    if (tmpProjectName) {
      projectName = tmpProjectName[1];
    }
    const searthTag = $('#catalog-input-search-tag');
    searthTag.blur(); // 検索テキストボックスから初期フォーカスを外す
    searthTag.autocomplete({
      source: function (request, response) {
        $.ajax({
          url: '/issue_tags/auto_complete/' + projectName,
          type: 'GET',
          dataType: 'json',
          data: { q: request.term },
          success: function (choices) {
            response(choices);
          },
          error: function (xhr, ts, err) {
            response(['']);
          }
        });
      },
      select: function (event, ui) {
        if (ui.item && ui.item.value) {
          // console.log(ui.item.value);
          const form = $('#form-search-tag');
          const hiddenValue = form.find('input:hidden[name=v\\[tags\\]\\[\\]]');
          const selectMode = form.find('input:hidden[name=sm]').val();
          if (hiddenValue.length === 0) {
            $('<input>').attr({ 'type': 'hidden', 'name': 'f[]' }).val('tags').appendTo(form);
            $('<input>').attr({ 'type': 'hidden', 'name': 'op[tags]' }).val('=').appendTo(form);
          }
          if (selectMode === 'one' && hiddenValue) {
            hiddenValue.remove();
          }
          $('<input>').attr({ 'type': 'hidden', 'name': 'v[tags][]' }).val(ui.item.value).appendTo(form);
          $('<input>').attr({ 'type': 'hidden', 'name': 'catalog_history' }).val(ui.item.value).appendTo(form);
          form.submit();
        }
      },
      minLength: 1,
    });
  };

  //  ページの最上部にスクロールするボタン 
  const setupBtnScrollToTop = () => {
    const btn = document.querySelector('#btn-scroll-to-top');
    if (btn) {
      btn.addEventListener('click', function () {
        window.scroll({ top: 0, behavior: 'smooth' });
      });
      window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
          btn.style.opacity = '1';
        } else if (window.pageYOffset < 300) {
          btn.style.opacity = '0';
        }
      });
    }
  };


  setupFromStorageOnLoad();
  setupSearchTag();
  setupBtnScrollToTop();

});

