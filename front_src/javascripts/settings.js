'use strict';

import { setupBulkFormButton } from './modules/bulkFormButton.js';
import { NewDialog } from './modules/newDialog.js';
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


  const callbackNewCatalogTagCategory = (dialog) => {
    if (!dialog) { return; }
    const datName = dialog.querySelector('input[name=\'catalog_tag_category[name]\']').value;
    const datDescription = dialog.querySelector('input[name=\'catalog_tag_category[description]\']').value;
    const apiKey = IssuesCatalogSettingParam.user.apiKey;
    let projectName = IssuesCatalogSettingParam.project?.identifier;
    console.log(`callbackNew: ${datName} : ${datDescription} : ${projectName} : ${apiKey}`);
    $.ajax({
      type: 'POST',
      url: `/projects/${projectName}/catalog_tag_categories.json`,
      headers: {
        'X-Redmine-API-Key': apiKey
      },
      dataType: 'text',
      format: 'json',
      data: {
        catalog_tag_category: {
          name: datName,
          description: datDescription
        }
      }
    }).done(function (data) {
      if (data.startsWith('{')) {
        const retData = JSON.parse(data);
        // console.dir(retData);
        const tableBody = document.querySelector('table.catalog-tag-categories')?.querySelector('tbody');
        if (tableBody) {
          const addTr = document.createElement('tr');
          addTr.id = `catalog_tag_category-${retData.catalog_tag_category.id}`;
          const tdName = document.createElement('td');
          tdName.classList.add('name', 'edit-category');
          tdName.innerText = retData.catalog_tag_category.name;
          const tdDescription = document.createElement('td');
          tdDescription.classList.add('description', 'edit-category');
          tdDescription.innerText = retData.catalog_tag_category.description;
          //  TODO: イベントリスナー登録 
          addTr.appendChild(tdName);
          addTr.appendChild(tdDescription);
          tableBody.insertBefore(addTr, tableBody.lastElementChild);  //  最後（常時表示）の手前に挿入
        }
      } else {
        console.log(data);
      }
    }).fail(function (jqXHR, textStatus) {
      const message = (jqXHR.responseText.startsWith('{')) ?
        Object.entries(JSON.parse(jqXHR.responseText)).map(([key, value]) => `${key} : ${value}`).join('\n') :
        jqXHR.responseText;
      alert(message);
      console.log(message);
      // console.log(`catalog_tag_categories/new failed: ${textStatus} : ${jqXHR.statusText} : ${jqXHR.responseText}`);
      // alert(jqXHR.responseText);
      // console.dir(jqXHR);
    });
  };
  const dialogNewCategory = new NewDialog('dialog-new-catalog-tag-category', 'add-catalog-tag-category', 'tab-content-manage_tag_categories', callbackNewCatalogTagCategory);


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
  for (const edit of document.querySelectorAll('.edit-category')) {
    new EditCategory(edit);
  }


  setupTagsMultiSelect('#work-tag-category', 'catalog_tag_category_ids', '.edit2-tag');
  setupTagsMultiSelect('#work-tag-group', 'catalog_tag_group_ids', '.edit3-tag');
});