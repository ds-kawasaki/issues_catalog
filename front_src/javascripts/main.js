'use strict';

import { wrapLocalStorage } from './modules/localStorage.js';
import { setHistoryOnLoad, addHistory } from './modules/history.js';


// jQuery用DOM準備完了時 document ready
$(function () {

  //  エレメント作成ヘルパー 
  const createElementWithClassText = (elem, className, text) => {
    const element = document.createElement(elem);
    if (className) {
      element.className = className;
    }
    if (text) {
      element.appendChild(document.createTextNode(text));
    }
    return element;
  };


  // railsから受け取るもの
  // console.dir(IssuesCatalogParam);
  //  and検索時のタグ数の初期化 
  if (IssuesCatalogParam.selected_tags.length > 0) {
    const tmpMaps = new Map();
    for (const tag of IssuesCatalogParam.tags) {
      tmpMaps[tag.id] = tag;
    }
    for (const selectTag of IssuesCatalogParam.selected_tags) {
      if (tmpMaps[selectTag.id]) {
        tmpMaps[selectTag.id].select_count = selectTag.select_count;
      }
    }
  }
  //  タグ名からアクセスするパラメーター 
  const mapAllTags = new Map();
  for (const tag of IssuesCatalogParam.tags) {
    mapAllTags[tag.name] = {
      'allCount': tag.count,
      'selectCount': tag.select_count,
      'description': tag.description,
      'groups': tag.groups,
    };
  }

  // railsから受け取った選択しているタグ配列
  const getFilterTags = () => {
    const tags = IssuesCatalogParam.select_filters.find(x => x[0] == 'tags');
    return (tags && tags.length >= 2) ? tags[2] : [];
  };
  // タグ選択モードラジオボタンの現状 
  const getNowSelectMode = () => {
    for (const radio of document.querySelectorAll('.radio-select-mode')) {
      if (radio.checked) { return radio.value; }
    }
    return IssuesCatalogParam.select_mode;
  };

  //  タグのエレメント作成 
  const makeTagElement = (tagText, nowMode, elmName, addClearBtn = false) => {
    const a = document.createElement('a');
    a.href = '#';
    if (addClearBtn) {
      const spanClear = createElementWithClassText('span', 'icon-only', IssuesCatalogParam.label_clear);
      spanClear.classList.add('catalog-icon-clear-selected');
      a.appendChild(spanClear);
    }
    a.appendChild(document.createTextNode(tagText));
    const sLabel = createElementWithClassText('span', 'catalog-tag-label', '');
    sLabel.appendChild(a);
    const mapTag = mapAllTags[tagText];
    // console.log(`makeTag: ${tagText} : ${mapTag.allCount} : ${mapTag.selectCount} : ${mapTag.desciption}`);
    if (mapTag) {
      const cnt = (nowMode === 'and') ? mapTag.selectCount : mapTag.allCount;
      const sCount = createElementWithClassText('span', 'tag-count', `(${cnt})`);
      sCount.dataset.allcount = mapTag.allCount;
      sCount.dataset.selectedcount = mapTag.selectCount;
      sLabel.appendChild(sCount);
      if (cnt === 0) {
        sLabel.classList.add('catalog-count-zero');
      }
      if (mapTag.description) {
        const divTooltip = createElementWithClassText('div', 'tag-tooltip', '');
        divTooltip.appendChild(createElementWithClassText('div', 'tag-description', mapTag.description));
        sLabel.appendChild(divTooltip);
      }
    }
    if (addClearBtn) {
      return sLabel;
    } else {
      const elm = createElementWithClassText(elmName, 'tags', '');
      elm.appendChild(sLabel);
      return elm;
    }
  };
  function makeTagElementNowMode(tagText, elmName, addClearBtn = false) {
    const nowMode = getNowSelectMode();
    function tmp(tagText, elmName) {
      return makeTagElement(tagText, nowMode, elmName, addClearBtn);
    }
    return tmp;
  }


  //  ページ読み込み時にタグにツールチップ追加
  const setTagTooltipOnLoad = () => {
    for (const tag of document.querySelectorAll('.catalog-tag-label')) {
      const tagText = tag.querySelector('a')?.innerText;
      if (tagText) {
        const mapTag = mapAllTags[tagText];
        if (mapTag && mapTag.description) {
          const divTooltip = createElementWithClassText('div', 'tag-tooltip', '');
          divTooltip.appendChild(createElementWithClassText('div', 'tag-description', mapTag.description));
          tag.appendChild(divTooltip);
        }
      }
    }
  };
  //  ページ読み込み時にサイドバータグ展開
  const setSidebarTagsOnLoad = () => {
    const cateNum = IssuesCatalogParam.tag_categories.length;
    // const nowMode = getNowSelectMode();
    const funcMakeTagElementNowMode = makeTagElementNowMode();
    const sidebarCategoryTabs = document.querySelector('ul.tabs-area');
    if (sidebarCategoryTabs) {
      if (cateNum === 1) {
        const li = createElementWithClassText('li', 'category-tab', IssuesCatalogParam.label_tag_category_none);
        li.id = `category-tab-none`;
        li.classList.add('active-tab');
        sidebarCategoryTabs.prepend(li);
      } else {
        for (let i = cateNum - 1; i > 0; --i) {  //  子の先頭にいれるので逆順 
          const li = createElementWithClassText('li', 'category-tab', IssuesCatalogParam.tag_categories[i].name);
          li.id = `category-tab-id${i - 1}`;
          if (i === 1) { li.classList.add('active-tab'); }
          sidebarCategoryTabs.prepend(li);
        }
      }
    }
    const sidebarCategoryContents = document.querySelector('div.contents-area');
    if (sidebarCategoryContents) {
      if (cateNum === 1) {
        const ulTags = createElementWithClassText('ul', 'tags', '');
        for (const tag of IssuesCatalogParam.tags) {
          ulTags.appendChild(funcMakeTagElementNowMode(tag.name, 'ul'));
        }
        const divContent = createElementWithClassText('div', 'category-content', '');
        divContent.appendChild(ulTags);
        if (i === 1) { divContent.classList.add('show-content'); }
        sidebarCategoryContents.prepend(divContent);
      } else {
        for (let i = cateNum - 1; i > 0; --i) {  //  子の先頭にいれるので逆順 
          const ulTags = createElementWithClassText('ul', 'category-tags', '');
          const categoryId = IssuesCatalogParam.tag_categories[i].id;
          for (const tag of IssuesCatalogParam.tags) {
            if (tag.categories.includes(categoryId)) {
              ulTags.appendChild(funcMakeTagElementNowMode(tag.name, 'ul'));
            }
          }
          const divContent = createElementWithClassText('div', 'category-content', '');
          divContent.appendChild(createElementWithClassText('p', '', IssuesCatalogParam.tag_categories[i].description));
          divContent.appendChild(ulTags);
          if (i === 1) { divContent.classList.add('show-content'); }
          sidebarCategoryContents.prepend(divContent);
        }
      }
    }
  };
  //  ページ読み込み時に選択タグ（常時表示）展開
  const setSelectedTagsOnLoad = () => {
    const makeRadioLabel = (parent, mode, labelText) => {
      const radio = createElementWithClassText('input', 'radio-select-mode', '');
      radio.type = 'radio';
      radio.name = 'select-mode';
      radio.id = `radio-select-mode-${mode}`;
      radio.value = mode;
      radio.checked = (nowMode === mode);
      parent.appendChild(radio);
      const label = createElementWithClassText('label', 'label-select-mode', labelText);
      label.htmlFor = `radio-select-mode-${mode}`;
      parent.appendChild(label);
    };
    const nowMode = getNowSelectMode();
    const funcMakeTagElementNowMode = makeTagElementNowMode();
    const tagsSelected = document.querySelector('#catalog_tags_selected');
    const filterTags = getFilterTags();
    if (tagsSelected && filterTags.length > 0) {
      const divSelectedTags = createElementWithClassText('div', 'selected-tags', '');
      const selectedGroups = [];
      for (let i = 0; i < filterTags.length; ++i) {
        if (i > 0) {
          divSelectedTags.appendChild(createElementWithClassText('span', '', (IssuesCatalogParam.select_mode === 'and') ? ' and ' : ' or '));
        }
        divSelectedTags.appendChild(funcMakeTagElementNowMode(filterTags[i], 'span', true));
        const mapTag = mapAllTags[filterTags[i]];
        if (mapTag && mapTag.groups && mapTag.groups.length > 0) {
          for (const grp of mapTag.groups) {
            if (!selectedGroups.includes(grp)) {
              selectedGroups.push(grp);
            }
          }
        }
      }
      divSelectedTags.appendChild(createElementWithClassText('span', '', ' : '));
      const aClearAll = createElementWithClassText('a', '', IssuesCatalogParam.label_clear_select);
      aClearAll.href = `${document.location.protocol}//${document.location.host}${document.location.pathname}`;
      const span = document.createElement('span');
      span.appendChild(aClearAll);
      divSelectedTags.appendChild(span);
      tagsSelected.appendChild(divSelectedTags);
      const divModeOperation = createElementWithClassText('div', 'catalog-select-mode-operation', '');
      makeRadioLabel(divModeOperation, 'one', IssuesCatalogParam.label_operator_one);
      makeRadioLabel(divModeOperation, 'and', IssuesCatalogParam.label_operator_and);
      makeRadioLabel(divModeOperation, 'or', IssuesCatalogParam.label_operator_or);
      tagsSelected.appendChild(divModeOperation);
      if (selectedGroups.length > 0) {
        tagsSelected.appendChild(createElementWithClassText('hr', 'catalog-separator', ''));
        const divGroup = createElementWithClassText('div', 'catalog-selected-tag-groups', '');
        divGroup.appendChild(createElementWithClassText('div', 'catalog-lavel-selected-tag-group', IssuesCatalogParam.label_selected_tag_group));
        for (const grp of IssuesCatalogParam.tag_groups) {
          for (const selectedGroup of selectedGroups) {
            if (selectedGroup != grp.id) { continue; }
            const fieldsetGroup = createElementWithClassText('fieldset', 'catalog-tag-group', '');
            const legend = document.createElement('legend');
            legend.appendChild(document.createTextNode(grp.name));
            fieldsetGroup.appendChild(legend);
            fieldsetGroup.appendChild(createElementWithClassText('div', '', grp.description));
            for (const tag of IssuesCatalogParam.tags) {
              if (tag.groups.includes(selectedGroup)) {
                fieldsetGroup.appendChild(funcMakeTagElementNowMode(tag.name, 'span'));
              }
            }
            divGroup.appendChild(fieldsetGroup);
          }
        }
        tagsSelected.appendChild(divGroup);
      }
    } else {
      const dispThumbs = document.querySelector('#catalog_btn_thumbnails');
      if (dispThumbs) {
        dispThumbs.style.display = 'none';
      }
    }
    const alwaysSelector = document.querySelector('div.catalog-always-selector');
    if (alwaysSelector) {
      for (const tag of IssuesCatalogParam.tags) {
        if (tag.categories.includes(IssuesCatalogParam.tag_categories[0].id)) {
          alwaysSelector.appendChild(funcMakeTagElementNowMode(tag.name, 'span'));
        }
      }
    }
  };


  // メインカテゴリタブ切替クリック時 
  const setSidebarTagsClickOnLoad = () => {
    const $tags = $('.category-tab');
    $tags.on('click', function () {
      $('.active-tab').removeClass('active-tab');
      $(this).addClass('active-tab');
      const index = $tags.index(this);
      $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
      wrapLocalStorage.setCategoryTab($(this).attr('id'));
    });
  };

  // メインカテゴリタブ切替読み込み時
  const setCatalogTabOnLoad = () => {
    const cateTab = wrapLocalStorage.getCategoryTab();
    if (!cateTab) { return; }
    const activeTab = $('#' + cateTab);
    if (!activeTab.length) { return; }

    $('.active-tab').removeClass('active-tab');
    activeTab.addClass('active-tab');
    const index = $('.category-tab').index(activeTab);
    $('.category-content').removeClass('show-content').eq(index).addClass('show-content');
  };




  // サムネイルオンリーボタン 
  $('#catalog-thubnails-btn1').on('click', function () {
    $('table.catalog-issues td.id').show();
    $('table.catalog-issues td.subject').show();
    $('table.catalog-issues td.tags').show();
    $('.pagination.top').show();
  });
  $('#catalog-thubnails-btn2').on('click', function () {
    $('table.catalog-issues td.id').show();
    $('table.catalog-issues td.subject').show();
    $('table.catalog-issues td.tags').hide();
    $('.pagination.top').hide();
  });
  $('#catalog-thubnails-btn3').on('click', function () {
    $('table.catalog-issues td.id').hide();
    $('table.catalog-issues td.subject').hide();
    $('table.catalog-issues td.tags').hide();
    $('.pagination.top').hide();
  });


  // タグ検索関連
  const setupSearchTag = () => {
    const makeHidden = (name, value) => {
      const ret = document.createElement('input');
      ret.type = 'hidden';
      ret.name = name;
      ret.value = value;
      return ret;
    };
    let projectName = '';
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
          addHistory(tagText);
          const form = document.querySelector('#form-search-tag');
          if (form) {
            form.appendChild(makeHidden('sm', nowMode));
            form.appendChild(makeHidden('f[]', 'tags'));
            switch (nowMode) {
              default:
              case 'one':
                form.appendChild(makeHidden('op[tags]', '='));
                form.appendChild(makeHidden('v[tags][]', tagText));
                break;
              case 'and':
                form.appendChild(makeHidden('op[tags]', 'and'));
                selectTags.forEach(t => form.appendChild(makeHidden('v[tags][]', t)));
                break;
              case 'or':
                form.appendChild(makeHidden('op[tags]', '='));
                selectTags.forEach(t => form.appendChild(makeHidden('v[tags][]', t)));
                break;
            }
            form.submit();
          }
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


  //  タグクリック処理
  const setupTagLink = () => {
    const makeBaseParams = (nowMode) => {
      const params = [
        ['set_filter', '1'],
        ['sort', 'priority:desc'],
        ['sm', nowMode],
        ['f[]', 'tags']
      ];
      if (IssuesCatalogParam.issues_open_only) {
        params.push(['f[]', 'status_id']);
        params.push(['op[status_id]', 'o']);
        params.push(['v[status_id][]', '']);
      }
      return params;
    };
    //  選択モードクリック
    for (const radio of document.querySelectorAll('.radio-select-mode')) {
      radio.addEventListener('click', function (event) {
        const selectMode = this.value;
        //  タグの後ろの数を変更 
        for (const tagCount of document.querySelectorAll('.catalog-tag-label .tag-count')) {
          const count = (selectMode === 'and') ? tagCount.dataset.selectedcount : tagCount.dataset.allcount;
          tagCount.innerText = `(${count})`;
          if (count === '0') {
            tagCount.parentElement.classList.add('catalog-count-zero');
          } else {
            tagCount.parentElement.classList.remove('catalog-count-zero');
          }
        }
        //  ページ切替URL差し替え 
        for (const pageLink of document.querySelectorAll('.pagination a')) {
          const queries = pageLink.search ? pageLink.search.slice(1).split('&') : [];
          const params = queries.map((x) => {
            const [key, value] = x.split('=');
            const decKey = decodeURIComponent(key);
            let decValue = decodeURIComponent(value);
            if (decKey === 'sm') {
              decValue = selectMode;
            }
            else if (decKey === 'op[tags]') {
              decValue = (selectMode === 'and') ? 'and' : '=';
            }
            return [decKey, decValue];
          });
          // console.log(`page: ${params}`);
          pageLink.search = '?' + params.map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
        }
      });
    }
    // タグリンククリック
    for (const tag of document.querySelectorAll('.tags a')) {
      tag.addEventListener('click', function (event) {
        const nowMode = getNowSelectMode();
        const tagText = this.innerText;
        const params = makeBaseParams(nowMode);
        const selectTags = getFilterTags();
        if (!selectTags.includes(tagText)) { selectTags.push(tagText); }
        addHistory(tagText);
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
    // 選択タグリンククリック（選択解除）
    for (const selectTag of document.querySelectorAll('.selected-tags .catalog-tag-label a')) {
      selectTag.addEventListener('click', function (event) {
        const nowMode = getNowSelectMode();
        let tagText = this.innerText;
        if (tagText.startsWith(IssuesCatalogParam.label_clear)) {
          tagText = tagText.slice(IssuesCatalogParam.label_clear.length);
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
          params.push(['op[tags]', ((nowMode === 'and') ? 'and' : '=')]);
          selectTags.forEach(t => params.push(['v[tags][]', t]));
          // console.log(`tag: ${params}`);
          this.search = '?' + params.map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
        }
      });
    }
  };


  setTagTooltipOnLoad();
  setSelectedTagsOnLoad();
  setSidebarTagsOnLoad();
  if (wrapLocalStorage.setupFromStorageOnLoad()) {
    const funcMakeTagElementNowMode = makeTagElementNowMode();
    setCatalogTabOnLoad();
    setHistoryOnLoad(funcMakeTagElementNowMode);
    setSidebarTagsClickOnLoad();
  }

  setupSearchTag();
  setupBtnScrollToTop();
  setupTagLink();


  // 紛らわしいのでredmine標準検索フォームを非表示
  const quickSearch = document.querySelector('#quick-search form');
  if (quickSearch) {
    quickSearch.style.display = 'none';
  }

});

