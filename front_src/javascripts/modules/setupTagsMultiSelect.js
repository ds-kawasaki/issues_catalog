//  タグのカテゴリ・グループ選択編集
export const setupTagsMultiSelect = (work_id, param_ids, targetsQuery) => {
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
        $.ajax({
          type: 'PATCH',
          url: '/catalog_tags/field_update/',
          data: { 'id': tag_id, 'catalog_tag': { [param_ids]: sendValues } },
          dataType: 'json'
        }).done(function (data) {
          if (data.status === 'SUCCESS') {
            // console.log(`tag changed ${tag_id} : ${sendValues}`);
          } else {
            console.log(`${paramName} changed: ${targetId} : ${column} : ${value} : status ${data.status}`);
            if (data.message) {
              alert(data.message);
              console.log(data.message);
            }
            target.innerText = oldValue;  //  更新失敗したので元に戻す 
          }
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
