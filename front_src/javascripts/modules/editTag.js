import { EditTableBase } from './editTableBase.js';
import { NewDialog } from './newDialog.js';


export class EditTag extends EditTableBase {
  constructor(elemTr) {
    super(elemTr);
    elemTr.targetId = elemTr.id.slice(4); // 4='tag-'.length
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-tag')) {
      new EditTag(edit);
    }
    EditTableBase.registEdit('name tag editable', this.#startEditItem, this.#editedItem);
    EditTableBase.registEdit('description tag editable', this.#startEditItem, this.#editedItem);
    EditTableBase.registEdit('category tag multiselect', this.#startSelectCategory, this.#selectedCategory);
    EditTableBase.registEdit('group tag multiselect', this.#startSelectGroup, this.#selectedGroup);
  }


  //  シンプルなテキスト編集開始トリガー 
  static #startEditItem(event) {
    const elem = event.target;
    elem.setAttribute('data-value', elem.innerText);
  }
  //  シンプルなテキスト変更トリガー 
  static #editedItem(elem) {
    // elem.innerText = elem.innerText.replace(/[\r\n]/g, '').trim();  //  改行・冒頭末尾余白削除 
    elem.innerText = elem.innerText.replace(/[\r\n]/g, '');  //  改行削除 
    const oldValue = elem.getAttribute('data-value');
    if (oldValue === elem.innerText) return true;
    if (elem.innerText.length === 0) {
      elem.innerText = oldValue;
      return true;
    }

    const column = elem.classList.item(0);
    const value = elem.innerText || '__none__';
    EditTag.#updateToServerTags(elem, oldValue, column, value);
  }


  //  categoryの編集開始トリガー 
  static #startSelectCategory(event) {
    EditTag.#startSelectMulti(event, '#work-tag-category');
  }
  //  categoryの編集完了トリガー 
  static #selectedCategory(elem) {
    EditTag.#selectedMulti(elem, 'catalog_tag_category_ids');
  }

  //  categoryの編集開始トリガー 
  static #startSelectGroup(event) {
    EditTag.#startSelectMulti(event, '#work-tag-group');
  }
  //  categoryの編集完了トリガー 
  static #selectedGroup(elem) {
    EditTag.#selectedMulti(elem, 'catalog_tag_group_ids');
  }

  static #startSelectMulti(event, work_id) {
    const elem = event.target;
    const tmp = elem.querySelector('.tmp-select');
    if (tmp) { return; }
    elem.setAttribute('data-value', elem.innerText);
    const newSelect = EditTag.#makeSelect(elem.innerText, 'tmp-select', `tmp-select-${elem.parentElement.targetId}`, work_id);
    elem.innerText = '';
    elem.appendChild(newSelect);
    EditTag.#setupSelect2($(newSelect));
  }
  static #selectedMulti(elem, param_ids) {
    if (!elem) { return; }
    const tmp = elem.querySelector('.tmp-select');
    if (!tmp) { return; }
    $(tmp).select2('close');
    const values = Array.from(tmp.options).filter(x => x.selected).map(x => x.text).join(', ');
    let sendValues = Array.from(tmp.options).filter(x => x.selected).map(x => x.value);
    if (sendValues.length == 0) { sendValues = ['']; }
    while (elem.firstChild) { elem.removeChild(elem.firstChild); }
    elem.innerText = values;
    const oldValue = elem.getAttribute('data-value');
    if (oldValue === values) { return; }

    EditTag.#updateToServerTags(elem, oldValue, param_ids, sendValues);
  }

  static #makeSelect(orgText, tmpSelect_class, tmpSelect_id, work_id) {
    const orgSelect = document.querySelector(work_id);
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
  static #setupSelect2($newSelect) {
    $newSelect.select2({
      width: 'resolve',
      placeholder: 'Multi-select',
      closeOnSelect: false,
      allowClear: false
    });
    //$newSelect.select2('open');
  }

  //  redmine_tagsのupdateはadmin権限必須なので、一部分updateする別のAPIを使用
  static #updateToServerTags(elem, oldValue, column, value) {
    $.ajax({
      type: 'PATCH',
      url: '/catalog_tags/field_update/',
      data: { 'id': elem.parentElement.targetId, 'catalog_tag': { [column]: value } },
      dataType: 'json',
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      }
    }).done(function (data) {
      if (data.status === 'SUCCESS') {
        // console.log(`tag changed ${elem.parentElement.targetId} : ${value}`);
      } else {
        console.log(`tag change fail: ${elem.parentElement.targetId} : ${column} : ${value} : status ${data.status}`);
        if (data.message) {
          alert(data.message);
          console.log(data.message);
        }
        elem.innerText = oldValue;  //  更新失敗したので元に戻す 
      }
    }).fail(function (jqXHR, textStatus) {
      console.log(`tag change failed: ${elem.parentElement.targetId} : ${column} : ${value} : status ${textStatus}`);
      elem.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
  }
}
