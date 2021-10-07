// jQuery用DOM準備完了時 document ready
$(function () {
  'use strict';

  //  一括タグカテゴリの「一括追加」「一括削除」ボタン押下時
  $('#form-bulk-edit-tag-categories button').on('click', function () {
    const selectCategories = $('#select-catalog-tag-categories').val();
    if (!selectCategories.length) { return; }
    // console.log(selectCategories);
    const form = $(this).parents('form');
    form.find('[name=ids\\[\\]]').remove();
    let checkIdes = false;
    $('input[name=ids\\[\\]]:checked').each(function () {
      $('<input>').attr({ 'type': 'hidden', 'name': 'ids[]' }).val($(this).val()).appendTo(form);
      checkIdes = true;
    });
    if (checkIdes) {
      form.find('[name=operate]').val($(this).val());
      form.submit();
    }
  });

  //  すべてにチェックつける・はずす
  $('input[type=checkbox].toggle-selection').on('change', function () {
    const checked = $(this).prop('checked');
    $(this).parents('table').find('input[name=ids\\[\\]]').prop('checked', checked);
  });



  // タグカテゴリ名称変更を各所の表示反映
  const updateCategoryName = (category_id, oldName, newName) => {
    for (const edit of document.querySelectorAll('.edit2-tag')) {
      if (edit.innerText.includes(oldName)) {
        edit.innerText = edit.innerText.replace(oldName, newName);
      }
    }
    const orgCategorySelect = document.querySelector('#work-tag-category');
    for (const option of orgCategorySelect?.options) {
      if (option.text === oldName) { option.text = newName; }
    }
    const bulkSelect = document.querySelector('#select-catalog-tag-categories');
    for (const option of bulkSelect?.options) {
      if (option.text === oldName) { option.text = newName; }
    }
    $(bulkSelect)?.val(null).trigger('change');  // Select2の深層の名称変更が大変なので、選択解除させる
  };

  //  タグカテゴリの項目編集
  const editedCategoryItem = (target, value, oldValue) => {
    const category_id = target.parentNode?.id?.slice(21); // 21='catalog_tag_category-'.length
    const column = target.classList.item(0);
    $.ajax({
      type: 'PATCH',
      url: '/catalog_tag_categories/field_update/',
      data: `id=${category_id}&catalog_tag_category[${column}]=${value}`,
    }).done(function () {
      // console.log(`category changed: ${category_id} : ${column} : ${value}`);
      if (column === 'name') { updateCategoryName(category_id, oldValue, value); }  // タグカテゴリ名称変更を各所の表示反映
    }).fail(function (jqXHR, textStatus) {
      console.log(`category change failed: ${category_id} : ${column} : ${value} : ${textStatus}`);
      target.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
  };
  //  タグの項目編集
  const editedTagItem = (target, value, oldValue) => {
    const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
    const column = target.classList.item(0);
    $.ajax({
      type: 'PATCH',
      url: '/catalog_tags/field_update/',
      data: `id=${tag_id}&catalog_tag[${column}]=${value}`,
    }).done(function () {
      console.log(`tag changed ${tag_id} : ${column} : ${value}`);
    }).fail(function (jqXHR, textStatus) {
      console.log(`tag change failed: ${tag_id} : ${column} : ${value} : ${textStatus}`);
      target.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
  };
  const setupEdit = (className, editedCallback) => {
    const editedItem = (event, editedCallback) => {
      const target = event.target;
      target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();  //  改行・冒頭末尾余白削除 
      const oldValue = target.getAttribute('data-value');
      if (oldValue === target.innerText) return true;
      if (target.innerText.length === 0) {
        target.innerText = oldValue;
        return true;
      }
      event.preventDefault();
      if (editedCallback) {
        editedCallback(target, target.innerText || '__none__', oldValue);
      }
      return false;
    };
    for (const edit of document.querySelectorAll(className)) {
      edit.contentEditable = true;
      edit.setAttribute('data-value', edit.innerText);
      edit.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      });
      edit.addEventListener('focusout', function (event) {
        editedItem(event, editedCallback);
      });
      edit.addEventListener('focusin', function (event) {
        event.target.setAttribute('data-value', event.target.innerText);
      });
    }
  };
  setupEdit('.edit-category', editedCategoryItem);
  setupEdit('.edit-tag', editedTagItem);

  //  タグのカテゴリ選択編集
  const orgCategorySelect = document.querySelector('#work-tag-category');
  if (orgCategorySelect) {
    const makeCategorySelect = (orgText, tmpSelect_class, tmpSelect_id) => {
      const orgValues = orgText.split(',').map(x => x.trim());
      const newSelect = document.createElement('select');
      newSelect.id = tmpSelect_id;
      newSelect.className = tmpSelect_class;
      newSelect.multiple = true;
      for (const option of orgCategorySelect.options) {
        const op = document.createElement('option');
        op.value = option.value;
        op.text = option.text;
        if (orgValues.includes(op.text)) { op.setAttribute('selected', 'selected'); }
        newSelect.appendChild(op);
      }
      return newSelect;
    };
    const setupCategorySelect2 = ($newSelect, target, tag_id) => {
      $newSelect.select2({
        width: 'resolve',
        placeholder: 'Multi-select',
        closeOnSelect: false,
        allowClear: false
      });
      $newSelect.select2('open');
      $newSelect.on('select2:close', function (event) {
        const values = Array.from(this.options).filter(x => x.selected).map(x => x.text).join(', ');
        let sendValues = Array.from(this.options).filter(x => x.selected).map(x => x.value);
        if (sendValues.length == 0) { sendValues = ['']; }
        while (target.firstChild) { target.removeChild(target.firstChild); }
        target.innerText = values;
        const oldValue = target.getAttribute('data-value');
        if (oldValue === values) { return; }
        event.preventDefault();
        const data = { 'id': tag_id, 'catalog_tag': { 'catalog_tag_category_ids': sendValues } }
        $.ajax({
          type: 'PATCH',
          url: '/catalog_tags/field_update/',
          data: data,
          dataType: 'json'
        }).done(function () {
          console.log(`tag changed ${tag_id} : ${sendValues}`);
        }).fail(function (jqXHR, textStatus) {
          console.log(`tag change failed: ${tag_id} : ${sendValues} : ${textStatus}`);
          target.innerText = oldValue;  //  更新失敗したので元に戻す 
        });
      });
    };
    for (const edit of document.querySelectorAll('.edit2-tag')) {
      edit.addEventListener('click', function (event) {
        const target = this;
        const tmp = target.querySelector('.tmp-category-select');
        if (tmp) { return; }
        const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
        target.setAttribute('data-value', target.innerText);
        const newSelect = makeCategorySelect(target.innerText, 'tmp-category-select', `tmp-category-select-${tag_id}`);
        target.innerText = '';
        target.appendChild(newSelect);
        setupCategorySelect2($(newSelect), target, tag_id);
      });
    }
  }

  //  タグのグループ選択編集
  const orgGroupSelect = document.querySelector('#work-tag-group');
  if (orgGroupSelect) {
    const makeGroupSelect = (orgText, tmpSelect_class, tmpSelect_id) => {
      const orgValues = orgText.split(',').map(x => x.trim());
      const newSelect = document.createElement('select');
      newSelect.id = tmpSelect_id;
      newSelect.className = tmpSelect_class;
      newSelect.multiple = true;
      for (const option of orgGroupSelect.options) {
        const op = document.createElement('option');
        op.value = option.value;
        op.text = option.text;
        if (orgValues.includes(op.text)) { op.setAttribute('selected', 'selected'); }
        newSelect.appendChild(op);
      }
      return newSelect;
    };
    const setupGroupSelect2 = ($newSelect, target, tag_id) => {
      $newSelect.select2({
        width: 'resolve',
        placeholder: 'Multi-select',
        closeOnSelect: false,
        allowClear: false
      });
      $newSelect.select2('open');
      $newSelect.on('select2:close', function (event) {
        const values = Array.from(this.options).filter(x => x.selected).map(x => x.text).join(', ');
        let sendValues = Array.from(this.options).filter(x => x.selected).map(x => x.value);
        if (sendValues.length == 0) { sendValues = ['']; }
        while (target.firstChild) { target.removeChild(target.firstChild); }
        target.innerText = values;
        const oldValue = target.getAttribute('data-value');
        if (oldValue === values) { return; }
        event.preventDefault();
        const data = { 'id': tag_id, 'catalog_tag': { 'catalog_tag_group_ids': sendValues } }
        $.ajax({
          type: 'PATCH',
          url: '/catalog_tags/field_update/',
          data: data,
          dataType: 'json'
        }).done(function () {
          console.log(`tag changed ${tag_id} : ${sendValues}`);
        }).fail(function (jqXHR, textStatus) {
          console.log(`tag change failed: ${tag_id} : ${sendValues} : ${textStatus}`);
          target.innerText = oldValue;  //  更新失敗したので元に戻す 
        });
      });
    };
    for (const edit of document.querySelectorAll('.edit3-tag')) {
      edit.addEventListener('click', function (event) {
        const target = this;
        const tmp = target.querySelector('.tmp-group-select');
        if (tmp) { return; }
        const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
        target.setAttribute('data-value', target.innerText);
        const newSelect = makeGroupSelect(target.innerText, 'tmp-group-select', `tmp-group-select-${tag_id}`);
        target.innerText = '';
        target.appendChild(newSelect);
        setupGroupSelect2($(newSelect), target, tag_id);
      });
    }
  }
});