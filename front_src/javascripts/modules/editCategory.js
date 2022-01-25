import { EditTableBase } from './editTableBase.js';
import { NewDialog } from './newDialog.js';


export class EditCategory extends EditTableBase {
  constructor(elemTr) {
    super(elemTr);
    elemTr.targetId = elemTr.id.slice(21);  //  21='catalog_tag_category-'.length
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-category')) {
      new EditCategory(edit);
    }
    new NewDialog('dialog-new-catalog-tag-category', 'add-catalog-tag-category', 'tab-content-manage_tag_categories', this.#callbackNewDialog);
    EditTableBase.registEdit('name category editable', this.#startEditItem, this.#editedItem);
    EditTableBase.registEdit('description category editable', this.#startEditItem, this.#editedItem);
  }

  static makeTableRow(newItem) {
    const aDelBtn = document.createElement('a');
    aDelBtn.className = 'icon icon-del';
    aDelBtn.setAttribute('data-method', 'delete');
    aDelBtn.setAttribute('data-confirm', 'よろしいですか？');
    aDelBtn.setAttribute('rel', 'nofollow');
    aDelBtn.href = `/catalog_tag_categories/${newItem.id}`;
    aDelBtn.appendChild(document.createTextNode('削除'));
    const tdName = document.createElement('td');
    tdName.className = 'name category editable';
    tdName.appendChild(document.createTextNode(newItem.name));
    const tdDescription = document.createElement('td');
    tdDescription.className = 'description category editable';
    tdDescription.appendChild(document.createTextNode(newItem.description));
    const tdButtons = document.createElement('td');
    tdButtons.className = 'buttons';
    tdButtons.appendChild(aDelBtn);
    const retTr = document.createElement('tr');
    retTr.id = `catalog_tag_category-${newItem.id}`;
    retTr.className = 'edit-category';
    retTr.appendChild(tdName);
    retTr.appendChild(tdDescription);
    retTr.appendChild(tdButtons);
    new EditCategory(retTr);
    return retTr;
  }


  static #callbackNewDialog(dialog) {
    if (!dialog) { return; }
    const sendUrl = `/projects/${IssuesCatalogSettingParam.project?.identifier}/catalog_tag_categories.json`;
    const sendData = {
      catalog_tag_category: {
        name: dialog.querySelector('input[name=\'catalog_tag_category[name]\']').value,
        description: dialog.querySelector('input[name=\'catalog_tag_category[description]\']').value
      }
    };
    EditTableBase.updateToServer(sendUrl, sendData, 'POST',
      (data) => {
        const tableBody = document.querySelector('table.catalog-tag-categories')?.querySelector('tbody');
        if ('catalog_tag_category' in data && tableBody) {
          const addTr = EditCategory.makeTableRow(data.catalog_tag_category);
          tableBody.insertBefore(addTr, tableBody.lastElementChild);  //  最後（常時表示）の手前に挿入
          EditCategory.#addCategoryToWork(data.catalog_tag_category);
        } else {
          console.log(data);
        }
      },
      (message) => {
        if (message) {
          alert(message);
          console.log(message);
        }
      });
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
    const sendUrl = `/catalog_tag_categories/${elem.parentElement.targetId}.json`;
    const sendData = {
      catalog_tag_category: {
        [column]: value
      }
    };
    EditTableBase.updateToServer(sendUrl, sendData, 'PUT',
      () => {
        if (column === 'name') {
          EditCategory.#updateCategoryName(oldValue, value);
        }
      },
      (message) => {
        if (message) {
          alert(`「${elem.innerText}」\n ${message}`);
          console.log(`「${elem.innerText}」 ${message}`);
        }
        elem.innerText = oldValue;  //  更新失敗したので元に戻す 
      });
  }

  // タグカテゴリ名称変更を各所の表示反映
  static #updateCategoryName(oldName, newName) {
    for (const edit of document.querySelectorAll('.category.tag.multiselect')) {
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
  //  カテゴリ追加を各所の表示反映
  static #addCategoryToWork(newItem) {
    const orgCategorySelect = document.querySelector('#work-tag-category');
    if (orgCategorySelect) {
      orgCategorySelect.insertBefore(EditCategory.#makeOption(newItem), orgCategorySelect.lastElementChild);  //  最後（常時表示）の手前に挿入
    }
    const bulkSelect = document.querySelector('#select-catalog-tag-categories');
    if (bulkSelect) {
      bulkSelect.insertBefore(EditCategory.#makeOption(newItem), bulkSelect.lastElementChild);  //  最後（常時表示）の手前に挿入
    }
  }
  static #makeOption(newItem) {
    const op = document.createElement('option');
    op.value = newItem.id;
    op.text = newItem.name;
    return op;
  }
}