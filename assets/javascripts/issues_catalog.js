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

  // railsから受け取るもの
  const issuesCatalogParam = $('#issues-catalog-param').data('issues-catalog');
  console.log(`select_mode: ${issuesCatalogParam.select_mode}`);

  // railsから受け取った選択しているタグ配列
  const getFilterTags = () => {
    const tags = issuesCatalogParam.select_filters.find(x => x[0] == 'tags');
    return (tags && tags.length >= 2) ? tags[2] : [];
  };
  // タグ選択モードラジオボタンの現状 
  const getNowSelectMode = () => {
    for (const radio of document.querySelectorAll('.radio-select-mode')) {
      if (radio.checked) { return radio.value; }
    }
    return issuesCatalogParam.select_mode;
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
          const tagText = ui.item.value;
          const nowMode = getNowSelectMode();
          const selectTags = getFilterTags();
          if (!selectTags.includes(tagText)) { selectTags.push(tagText); }
          const form = $('#form-search-tag');
          $('<input>').attr({ 'type': 'hidden', 'name': 'sm' }).val(nowMode).appendTo(form);
          $('<input>').attr({ 'type': 'hidden', 'name': 'catalog_history' }).val(tagText).appendTo(form);
          $('<input>').attr({ 'type': 'hidden', 'name': 'f[]' }).val('tags').appendTo(form);
          switch (nowMode) {
            default:
            case 'one':
              $('<input>').attr({ 'type': 'hidden', 'name': 'op[tags]' }).val('=').appendTo(form);
              $('<input>').attr({ 'type': 'hidden', 'name': 'v[tags][]' }).val(tagText).appendTo(form);
              break;
            case 'and':
              $('<input>').attr({ 'type': 'hidden', 'name': 'op[tags]' }).val('and').appendTo(form);
              selectTags.forEach(t => $('<input>').attr({ 'type': 'hidden', 'name': 'v[tags][]' }).val(t).appendTo(form));
              break;
            case 'or':
              $('<input>').attr({ 'type': 'hidden', 'name': 'op[tags]' }).val('=').appendTo(form);
              selectTags.forEach(t => $('<input>').attr({ 'type': 'hidden', 'name': 'v[tags][]' }).val(t).appendTo(form));
              break;
          }
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


  //  選択モード切替関連
  const setupModeSelect = () => {
    const makeBaseParams = (nowMode) => {
      const params = [
        ['set_filter', '1'],
        ['sort', 'priority:desc'],
        ['sm', nowMode],
      ];
      if (issuesCatalogParam.issues_open_only) {
        params.push(['f[]', 'status_id']);
        params.push(['op[status_id]', 'o']);
        params.push(['v[status_id][]', '']);
      }
      return params;
    };
    for (const radio of document.querySelectorAll('.radio-select-mode')) {
      radio.addEventListener('click', function (event) {
        const selectMode = this.value;
        for (const tagCount of document.querySelectorAll('.catalog-tag-label .tag-count')) {
          const count = (selectMode === 'and') ? tagCount.dataset.selectedcount : tagCount.dataset.allcount;
          tagCount.innerText = `(${count})`;
          if (count === '0') {
            tagCount.parentElement.classList.add('catalog-count-zero');
          } else {
            tagCount.parentElement.classList.remove('catalog-count-zero');
          }
        }
      });
    }
    for (const tag of document.querySelectorAll('.tags a')) {
      tag.addEventListener('click', function (event) {
        const nowMode = getNowSelectMode();
        const tagText = this.innerText;
        const params = makeBaseParams(nowMode);
        const selectTags = getFilterTags();
        if (!selectTags.includes(tagText)) { selectTags.push(tagText); }
        params.push(['catalog_history', tagText]);
        params.push(['f[]', 'tags']);
        switch (nowMode) {
          default:
          case 'one':
            params.push(['op[tags]', '=']);
            params.push(['v[tags][]', tagText]);
            break;
          case 'and':
            params.push(['op[tags]', 'and']);
            selectTags.forEach(t => params.push(['v[tags][]', t]));
            break;
          case 'or':
            params.push(['op[tags]', '=']);
            selectTags.forEach(t => params.push(['v[tags][]', t]));
            break;
        }
        // console.log(`tag: ${params}`);
        this.search = '?' + params.map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
      });
    }
    for (const selectTag of document.querySelectorAll('.selected-tags .catalog-tag-label a')) {
      selectTag.addEventListener('click', function (event) {
        const nowMode = getNowSelectMode();
        let tagText = this.innerText;
        if (tagText.startsWith(issuesCatalogParam.label_clear)) {
          tagText = tagText.slice(issuesCatalogParam.label_clear.length);
        }
        // console.log(`selected-tag: ${tagText}`);
        const selectTags = getFilterTags().filter(x => x !== tagText);
        if (selectTags.length === 0) {
          this.search = '';
          if (this.href.endsWith('#')) {
            this.href = this.href.slice(0, -1);
          }
        } else {
          const params = makeBaseParams(nowMode);
          params.push(['f[]', 'tags']);
          switch (nowMode) {
            default:
            case 'one':
              params.push(['op[tags]', '=']);
              break;
            case 'and':
              params.push(['op[tags]', 'and']);
              break;
            case 'or':
              params.push(['op[tags]', '=']);
              break;
          }
          selectTags.forEach(t => params.push(['v[tags][]', t]));
          // console.log(`tag: ${params}`);
          this.search = '?' + params.map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
        }
      });
    }
  };


  setupFromStorageOnLoad();
  setupSearchTag();
  setupBtnScrollToTop();
  setupModeSelect();

});

