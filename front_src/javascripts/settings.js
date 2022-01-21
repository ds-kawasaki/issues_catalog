'use strict';

import { setupBulkFormButton } from './modules/bulkFormButton.js';
import { EditTableBase } from './modules/editTableBase.js';
import { EditTag } from './modules/editTag.js';
import { EditCategory } from './modules/editCategory.js';
import { EditGroup } from './modules/editGroup.js';
import { EditSynonym } from './modules/editSynonym.js';


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


  EditTableBase.init();
  EditTag.init();
  EditCategory.init();
  EditGroup.init();
  EditSynonym.init();
});