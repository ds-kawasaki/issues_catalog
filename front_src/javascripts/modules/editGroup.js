import { EditTableBase } from './editTableBase.js';
import { NewDialog } from './newDialog.js';


export class EditGroup extends EditTableBase {
  constructor(elemTr) {
    super(elemTr, 'editable-group');
    elemTr.targetId = elemTr.id.slice(18);  // 18='catalog_tag_group-'.length
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-group')) {
      new EditGroup(edit);
    }
    new NewDialog('dialog-new-catalog-tag-group', 'add-catalog-tag-group', 'tab-content-manage_tag_groups', EditGroup.#callbackNewDialog);
    EditTableBase.registEdit('name group editable', EditGroup.#startEditItem, EditGroup.#editedItem);
    EditTableBase.registEdit('description group editable', EditGroup.#startEditItem, EditGroup.#editedItem);
  }

  static makeTableRow(newItem) {
    const aDelBtn = document.createElement('a');
    aDelBtn.className = 'icon icon-del';
    aDelBtn.setAttribute('data-method', 'delete');
    aDelBtn.setAttribute('data-confirm', 'よろしいですか？');
    aDelBtn.setAttribute('rel', 'nofollow');
    aDelBtn.href = `/catalog_tag_groups/${newItem.id}`;
    aDelBtn.appendChild(document.createTextNode('削除'));
    const tdName = document.createElement('td');
    tdName.className = 'name group editable';
    tdName.appendChild(document.createTextNode(newItem.name));
    const tdDescription = document.createElement('td');
    tdDescription.className = 'description group editable';
    tdDescription.appendChild(document.createTextNode(newItem.description));
    const tdButtons = document.createElement('td');
    tdButtons.classname = 'buttons';
    tdButtons.appendChild(aDelBtn);
    const retTr = document.createElement('tr');
    retTr.id = `catalog_tag_group-${newItem.id}`;
    retTr.className = 'edit-group';
    retTr.appendChild(tdName);
    retTr.appendChild(tdDescription);
    retTr.appendChild(tdButtons);
    new EditGroup(retTr);
    return retTr;
  }


  static #callbackNewDialog(dialog) {
    if (!dialog) { return; }
    const sendUrl = `/projects/${IssuesCatalogSettingParam.project?.identifier}/catalog_tag_groups.json`;
    const sendData = {
      catalog_tag_group: {
        name: dialog.querySelector('input[name=\'catalog_tag_group[name]\']').value,
        description: dialog.querySelector('input[name=\'catalog_tag_group[description]\']').value
      }
    };
    EditTableBase.updateToServer(sendUrl, sendData, 'POST',
      (data) => {
        const tableBody = document.querySelector('table.catalog-tag-groups')?.querySelector('tbody');
        if ('catalog_tag_group' in data && tableBody) {
          const addTr = EditGroup.makeTableRow(data.catalog_tag_group);
          tableBody.appendChild(addTr);
          EditGroup.#addGroupToWork(data.catalog_tag_group);
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
  static #startEditItem(elem) {
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
    const sendUrl = `/catalog_tag_groups/${elem.parentElement.targetId}.json`;
    const sendData = {
      catalog_tag_group: {
        [column]: value
      }
    };
    EditTableBase.updateToServer(sendUrl, sendData, 'PUT',
      () => {
        if (column === 'name') {
          EditGroup.#updateGroupName(oldValue, value);
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

  // タググループ名称変更を各所の表示反映
  static #updateGroupName(oldName, newName) {
    for (const edit of document.querySelectorAll('.group.tag.multiselect')) {
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
  //  タググループ追加を各所の表示反映
  static #addGroupToWork(newItem) {
    const orgGroupSelect = document.querySelector('#work-tag-group');
    if (orgGroupSelect) {
      orgGroupSelect.appendChild(EditGroup.#makeOption(newItem));
    }
    const bulkSelect = document.querySelector('#select-catalog-tag-groups');
    if (bulkSelect) {
      bulkSelect.appendChild(EditGroup.#makeOption(newItem));
    }
  }
  static #makeOption(newItem) {
    const op = document.createElement('option');
    op.value = newItem.id;
    op.text = newItem.name;
    return op;
  }
}