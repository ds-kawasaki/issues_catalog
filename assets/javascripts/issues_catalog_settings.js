// jQuery用DOM準備完了時 document ready
$(function () {
  //  一括タグカテゴリの「一括追加」「一括削除」ボタン押下時
  $('#form-bulk-edit-tag-categories button').on('click', function() {
    const selectCategories = $('#select-catalog-tag-categories').val();
    if (!selectCategories.length) { return; }
    // console.log(selectCategories);
    const form = $(this).parents('form');
    form.find('[name=ids\\[\\]]').remove();
    let checkIdes = false;
    $('input[name=ids\\[\\]]:checked').each(function() {
      $('<input>').attr({'type':'hidden', 'name':'ids[]'}).val($(this).val()).appendTo(form);
      checkIdes = true;
    });
    if (checkIdes) {
      form.find('[name=operate]').val($(this).val());
      form.submit();
    }
  });

  //  すべてにチェックつける・はずす
  $('input[type=checkbox].toggle-selection').on('change', function() {
    const checked = $(this).prop('checked');
    $(this).parents('table').find('input[name=ids\\[\\]]').prop('checked', checked);
  });


  const editedCategoryItem = (event) => {
    const target = event.target;
    target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();
    if (target.getAttribute("data-value") === target.innerText) return true;
    if (target.innerText.length === 0) {
      target.innerText = target.getAttribute("data-value");
      return true;
    }
    event.preventDefault();
    const category_id = target.parentNode?.id?.slice(21); // 21="catalog_tag_category-".length
    const column = target.classList.item(0);
    const value = target.innerText || "__none__";
    console.log(`category ${category_id} : ${column} : ${value}`);
    return false;
  };
  //  タグカテゴリの項目編集
  document.querySelectorAll('.edit-category').forEach(editCategory => {
    editCategory.contentEditable = true;
    editCategory.setAttribute("data-value", editCategory.innerText);
    editCategory.addEventListener('keydown', function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    });
    editCategory.addEventListener('focusout', function(event) {
      editedCategoryItem(event);
    });
    editCategory.addEventListener('focusin', function(event) {
      event.target.setAttribute("data-value", event.target.innerText);
    });
  });

  const editedTagItem = (event) => {
    const target = event.target;
    target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();
    if (target.getAttribute("data-value") === target.innerText) return true;
    if (target.innerText.length === 0) {
      target.innerText = target.getAttribute("data-value");
      return true;
    }
    event.preventDefault();
    const tag_id = target.parentNode?.id?.slice(4); // 4="tag-".length
    const column = target.classList.item(0);
    const value = target.innerText || "__none__";
    console.log(`tag ${tag_id} : ${column} : ${value}`);
    return false;
  };
  //  タグの項目編集
  document.querySelectorAll('.edit-tag').forEach(editTag => {
    editTag.contentEditable = true;
    editTag.setAttribute("data-value", editTag.innerText);
    editTag.addEventListener('keydown', function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    });
    editTag.addEventListener('focusout', function(event) {
      editedTagItem(event);
    });
    editTag.addEventListener('focusin', function(event) {
      this.setAttribute("data-value", this.innerText);
    });
  });
});