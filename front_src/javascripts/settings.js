'use strict';

import { setupBulkFormButton } from './modules/bulkFormButton.js';
import { setupEdit } from './modules/setupEdit.js';
import { setupTagsMultiSelect } from './modules/setupTagsMultiSelect.js';
import { EditCategory } from './modules/editCategory.js';


// jQuery用DOM準備完了時 document ready
$(function () {
  //  一括タグカテゴリの「一括追加」「一括削除」ボタン押下時
  setupBulkFormButton('#form-bulk-edit-tag-categories button', '#select-catalog-tag-categories');
  //  一括タググループの「一括追加」「一括削除」ボタン押下時
  setupBulkFormButton('#form-bulk-edit-tag-groups button', '#select-catalog-tag-groups');

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
    const bulkSelect = document.querySelector('#select-catalog-tag-groups');
    for (const option of bulkSelect?.options) {
      if (option.text === oldName) { option.text = newName; }
    }
    $(bulkSelect)?.val(null).trigger('change');  // Select2の深層の名称変更が大変なので、選択解除させる
  };

  // setupEdit('.edit-category', 21, '/catalog_tag_categories/field_update/', 'catalog_tag_category', updateCategoryName); // 21='catalog_tag_category-'.length
  setupEdit('.edit-group', 18, '/catalog_tag_groups/field_update/', 'catalog_tag_group', updateGroupName); // 18='catalog_tag_group-'.length
  setupEdit('.edit-tag', 4, '/catalog_tags/field_update/', 'catalog_tag', null); // 4='tag-'.length
  EditCategory.init();


  setupTagsMultiSelect('#work-tag-category', 'catalog_tag_category_ids', '.edit2-tag');
  setupTagsMultiSelect('#work-tag-group', 'catalog_tag_group_ids', '.edit3-tag');
});