import { NewDialog } from './newDialog.js';


export class EditCategory {
  constructor(elemTr) {
    this.targetId = elemTr.id.slice(21);  //  21='catalog_tag_category-'.length
    this.columns = new Map();

    for (const edit of elemTr.querySelectorAll('.editable')) {
      const column = edit.classList.item(0);
      this.columns.set(column, edit); //this.columns[column] = edit;
      edit.contentEditable = true;
      edit.setAttribute('data-value', edit.innerText);
      edit.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {  //  改行させない 
          event.preventDefault();
        }
      });
      edit.addEventListener('focusout', (event) => {
        this.#editedItem(event);
      });
      edit.addEventListener('focusin', (event) => {
        event.target.setAttribute('data-value', event.target.innerText);
      });
    }
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-category')) {
      new EditCategory(edit);
    }
    new NewDialog('dialog-new-catalog-tag-category', 'add-catalog-tag-category', 'tab-content-manage_tag_categories', this.#callbackNewDialog);
  }

  static makeTableRow(newItem) {
    const aDelBtn = document.createElement('a');
    aDelBtn.classList.add('icon', 'icon-del');
    aDelBtn.setAttribute('data-method', 'delete');
    aDelBtn.setAttribute('data-confirm', 'よろしいですか？');
    aDelBtn.setAttribute('rel', 'nofollow');
    aDelBtn.href = `/catalog_tag_categories/${newItem.id}`;
    aDelBtn.appendChild(document.createTextNode('削除'));
    const tdName = document.createElement('td');
    tdName.classList.add('name', 'editable');
    tdName.appendChild(document.createTextNode(newItem.name));
    const tdDescription = document.createElement('td');
    tdDescription.classList.add('description', 'editable');
    tdDescription.appendChild(document.createTextNode(newItem.description));
    const tdButtons = document.createElement('td');
    tdButtons.classList.add('buttons');
    tdButtons.appendChild(aDelBtn);
    const retTr = document.createElement('tr');
    retTr.id = `catalog_tag_category-${newItem.id}`;
    retTr.classList.add('edit-category');
    retTr.appendChild(tdName);
    retTr.appendChild(tdDescription);
    retTr.appendChild(tdButtons);
    //  TODO: イベントリスナー登録 
    new EditCategory(retTr);
    return retTr;
  }


  static #callbackNewDialog(dialog) {
    if (!dialog) { return; }
    const datName = dialog.querySelector('input[name=\'catalog_tag_category[name]\']').value;
    const datDescription = dialog.querySelector('input[name=\'catalog_tag_category[description]\']').value;
    $.ajax({
      type: 'POST',
      url: `/projects/${IssuesCatalogSettingParam.project?.identifier}/catalog_tag_categories.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'text',
      format: 'json',
      data: {
        catalog_tag_category: {
          name: datName,
          description: datDescription
        }
      }
    }).done((data) => {
      if (data.startsWith('{')) {
        const tableBody = document.querySelector('table.catalog-tag-categories')?.querySelector('tbody');
        if (tableBody) {
          const retData = JSON.parse(data);
          const addTr = EditCategory.makeTableRow(retData.catalog_tag_category);
          tableBody.insertBefore(addTr, tableBody.lastElementChild);  //  最後（常時表示）の手前に挿入
        }
      } else {
        console.log(data);
      }
    }).fail((jqXHR, textStatus) => {
      const message = (jqXHR.responseText.startsWith('{')) ?
        Object.entries(JSON.parse(jqXHR.responseText)).map(([key, value]) => `${key} : ${value}`).join('\n') :
        jqXHR.responseText;
      alert(message);
      console.log(message);
    });
  }

  #editedItem(event) {
    const target = event.target;
    // target.innerText = target.innerText.replace(/[\r\n]/g, '').trim();  //  改行・冒頭末尾余白削除 
    target.innerText = target.innerText.replace(/[\r\n]/g, '');  //  改行削除 
    const oldValue = target.getAttribute('data-value');
    if (oldValue === target.innerText) return true;
    if (target.innerText.length === 0) {
      target.innerText = oldValue;
      return true;
    }
    event.preventDefault();

    const column = target.classList.item(0);
    const value = target.innerText || '__none__';
    const params = {};
    params[column] = value;
    $.ajax({
      type: 'PUT',
      url: `/catalog_tag_categories/${this.targetId}.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'json',
      format: 'json',
      data: { catalog_tag_category: params }
    }).done((data, textStatus, jqXHR) => {
      // console.log(`jqXHR.status: ${jqXHR.status}`);
      if ((jqXHR.status >= 200 && jqXHR.status < 300) || jqXHR.status === 304) {
        if (column === 'name') {
          EditCategory.#updateCategoryName(oldValue, value);
        }
      } else {
        target.innerText = oldValue;  //  更新失敗したので元に戻す 
      }
    }).fail((jqXHR) => {
      const message = (jqXHR.responseText.startsWith('{')) ?
        Object.entries(JSON.parse(jqXHR.responseText)).map(([key, value]) => `${key} : ${value}`).join('\n') :
        jqXHR.responseText;
      alert(`「${target.innerText}」\n ${message}`);
      console.log(`「${target.innerText}」 ${message}`);
      target.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
  }

  // タグカテゴリ名称変更を各所の表示反映
  static #updateCategoryName(oldName, newName) {
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

}