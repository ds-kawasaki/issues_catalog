// jQuery用DOM準備完了時 document ready
$(function () {
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


  const editedCategoryItem = (event) => {
    const target = event.target;
    target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();
    if (target.getAttribute('data-value') === target.innerText) return true;
    if (target.innerText.length === 0) {
      target.innerText = target.getAttribute('data-value');
      return true;
    }
    event.preventDefault();
    const category_id = target.parentNode?.id?.slice(21); // 21='catalog_tag_category-'.length
    const column = target.classList.item(0);
    const value = target.innerText || '__none__';
    console.log(`category ${category_id} : ${column} : ${value}`);
    return false;
  };
  //  タグカテゴリの項目編集
  document.querySelectorAll('.edit-category').forEach(editCategory => {
    editCategory.contentEditable = true;
    editCategory.setAttribute('data-value', editCategory.innerText);
    editCategory.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
    editCategory.addEventListener('focusout', function (event) {
      editedCategoryItem(event);
    });
    editCategory.addEventListener('focusin', function (event) {
      event.target.setAttribute('data-value', event.target.innerText);
    });
  });

  const editedTagItem = (event) => {
    const target = event.target;
    target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();
    if (target.getAttribute('data-value') === target.innerText) return true;
    if (target.innerText.length === 0) {
      target.innerText = target.getAttribute('data-value');
      return true;
    }
    event.preventDefault();
    const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
    const column = target.classList.item(0);
    const value = target.innerText || '__none__';
    console.log(`tag ${tag_id} : ${column} : ${value}`);
    return false;
  };
  //  タグの項目編集
  document.querySelectorAll('.edit-tag').forEach(editTag => {
    editTag.contentEditable = true;
    editTag.setAttribute('data-value', editTag.innerText);
    editTag.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
    editTag.addEventListener('focusout', function (event) {
      editedTagItem(event);
    });
    editTag.addEventListener('focusin', function (event) {
      this.setAttribute('data-value', this.innerText);
    });
  });

  //  タグのカテゴリ選択編集
  const orgSelect = document.querySelector('#tmp-edit-catalog-tag-categories');
  if (orgSelect) {
    const orgOptions = Array.from(orgSelect.options);
    const makeSelect = (orgText, tmpSelect_id) => {
      const orgValues = orgText.split(',').map(x => x.trim());
      const newSelect = document.createElement('select');
      newSelect.id = tmpSelect_id;
      newSelect.className = 'tmp-select';
      newSelect.multiple = true;
      orgOptions.forEach((option) => {
        const op = document.createElement('option');
        op.value = option.value;
        op.text = option.text;
        if (orgValues.includes(op.text)) { op.setAttribute('selected', 'selected'); }
        newSelect.appendChild(op);
      });
      return newSelect;
    };
    document.querySelectorAll('.edit2-tag').forEach(edit2Tag => {
      edit2Tag.addEventListener('click', function (event) {
        const target = this;
        const tmp = target.querySelector('.tmp-select');
        if (tmp) { return; }
        const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
        const tmpSelect_id = `tmp-select-${tag_id}`;
        target.setAttribute('data-value', target.innerText);
        const newSelect = makeSelect(target.innerText, tmpSelect_id);
        target.innerText = '';
        target.appendChild(newSelect);
        const $newSelect = $(newSelect);
        $newSelect.select2({
          width: 'resolve',
          placeholder: 'Multi-select',
          closeOnSelect: false,
          alloClear: true
        });
        $newSelect.select2('open');
        $newSelect.on('select2:close', function (event) {
          const values = Array.from(this.options).filter(x => x.selected).map(x => x.text).join(', ');
          while (target.firstChild) { target.removeChild(target.firstChild); }
          target.innerText = values;
          if (target.getAttribute('data-value') === values) { return; }
          // const tag_id = target.parentNode?.id?.slice(4); // 4='tag-'.length
          const column = target.classList.item(0);
          const value = values;
          console.log(`tag ${tag_id} : ${column} : ${value}`);
        });
      });
    });
  }
});