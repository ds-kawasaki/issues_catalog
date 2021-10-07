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
  // タググループ名称変更を各所の表示反映
  const updateGroupName = (group_id, oldName, newName) => {
    for (const edit of document.querySelectorAll('.edit3-tag')) {
      if (edit.innerText.includes(oldName)) {
        edit.innerText = edit.innerText.replace(oldName, newName);
      }
    }
    const orgGroupSelect = document.querySelector('#work-tag-group');
    for (const option of orgGroupSelect?.options) {
      if (option.text === oldName) { option.text = newName; }
    }
  };


  const setupEdit = (className, idSliceNum, targetUrl, paramName, editedCallback) => {
    const editedItem = (event) => {
      const target = event.target;
      target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();  //  改行・冒頭末尾余白削除 
      const oldValue = target.getAttribute('data-value');
      if (oldValue === target.innerText) return true;
      if (target.innerText.length === 0) {
        target.innerText = oldValue;
        return true;
      }
      event.preventDefault();
      const targetId = target.parentNode?.id?.slice(idSliceNum);
      const column = target.classList.item(0);
      const value = target.innerText || '__none__';
      $.ajax({
        type: 'PATCH',
        url: targetUrl,
        data: `id=${targetId}&${paramName}[${column}]=${value}`,
      }).done(function () {
        // console.log(`${paramName} changed: ${targetId} : ${column} : ${value}`);
        if (column === 'name' && editedCallback) {
          editedCallback(targetId, oldValue, value); // 名称変更を各所の表示反映
        }
      }).fail(function (jqXHR, textStatus) {
        console.log(`${paramName} change failed: ${targetId} : ${column} : ${value} : ${textStatus}`);
        target.innerText = oldValue;  //  更新失敗したので元に戻す 
      });
      return false;
    };
    for (const edit of document.querySelectorAll(className)) {
      edit.contentEditable = true;
      edit.setAttribute('data-value', edit.innerText);
      edit.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {  //  改行させない 
          event.preventDefault();
        }
      });
      edit.addEventListener('focusout', function (event) {
        editedItem(event);
      });
      edit.addEventListener('focusin', function (event) {
        event.target.setAttribute('data-value', event.target.innerText);
      });
    }
  };
  setupEdit('.edit-category', 21, '/catalog_tag_categories/field_update/', 'catalog_tag_category', updateCategoryName); // 21='catalog_tag_category-'.length
  setupEdit('.edit-group', 18, '/catalog_tag_groups/field_update/', 'catalog_tag_group', updateGroupName); // 18='catalog_tag_group-'.length
  setupEdit('.edit-tag', 4, '/catalog_tags/field_update/', 'catalog_tag', null); // 4='tag-'.length



  //  タグのカテゴリ・グループ選択編集
  const setupTagsMultiSelect = (work_id, param_ids, targetsQuery) => {
    const orgSelect = document.querySelector(work_id);
    if (orgSelect) {
      const makeSelect = (orgText, tmpSelect_class, tmpSelect_id) => {
        const orgValues = orgText.split(',').map(x => x.trim());
        const newSelect = document.createElement('select');
        newSelect.id = tmpSelect_id;
        newSelect.className = tmpSelect_class;
        newSelect.multiple = true;
        for (const option of orgSelect.options) {
          const op = document.createElement('option');
          op.value = option.value;
          op.text = option.text;
          if (orgValues.includes(op.text)) { op.setAttribute('selected', 'selected'); }
          newSelect.appendChild(op);
        }
        return newSelect;
      };
      const setupSelect2 = ($newSelect, target, tag_id) => {
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
          const data = { 'id': tag_id, 'catalog_tag': { [param_ids]: sendValues } }
          $.ajax({
            type: 'PATCH',
            url: '/catalog_tags/field_update/',
            data: data,
            dataType: 'json'
          }).done(function () {
            // console.log(`tag changed ${tag_id} : ${sendValues}`);
          }).fail(function (jqXHR, textStatus) {
            console.log(`tag change failed: ${tag_id} : ${sendValues} : ${textStatus}`);
            target.innerText = oldValue;  //  更新失敗したので元に戻す 
          });
        });
      };
      for (const edit of document.querySelectorAll(targetsQuery)) {
        edit.addEventListener('click', function (event) {
          const target = this;
          const tmp = target.querySelector('.tmp-select');
          if (tmp) { return; }
          const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
          target.setAttribute('data-value', target.innerText);
          const newSelect = makeSelect(target.innerText, 'tmp-select', `tmp-select-${tag_id}`);
          target.innerText = '';
          target.appendChild(newSelect);
          setupSelect2($(newSelect), target, tag_id);
        });
      }
    }
  };
  setupTagsMultiSelect('#work-tag-category', 'catalog_tag_category_ids', '.edit2-tag');
  setupTagsMultiSelect('#work-tag-group', 'catalog_tag_group_ids', '.edit3-tag');
});