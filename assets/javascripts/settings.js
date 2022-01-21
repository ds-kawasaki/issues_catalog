/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./front_src/javascripts/modules/bulkFormButton.js":
/*!*********************************************************!*\
  !*** ./front_src/javascripts/modules/bulkFormButton.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setupBulkFormButton": () => (/* binding */ setupBulkFormButton)
/* harmony export */ });
  //  一括タグカテゴリの「一括追加」「一括削除」ボタン押下時
const setupBulkFormButton = (buttonQuery, selectQuery) => {
  $(buttonQuery).on('click', function () {
    const selects = $(selectQuery).val();
    if (!selects.length) { return; }
    // console.log(selects);
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
};


/***/ }),

/***/ "./front_src/javascripts/modules/editCategory.js":
/*!*******************************************************!*\
  !*** ./front_src/javascripts/modules/editCategory.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditCategory": () => (/* binding */ EditCategory)
/* harmony export */ });
/* harmony import */ var _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editTableBase.js */ "./front_src/javascripts/modules/editTableBase.js");
/* harmony import */ var _newDialog_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./newDialog.js */ "./front_src/javascripts/modules/newDialog.js");




class EditCategory extends _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase {
  constructor(elemTr) {
    super(elemTr);
    elemTr.targetId = elemTr.id.slice(21);  //  21='catalog_tag_category-'.length
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-category')) {
      new EditCategory(edit);
    }
    new _newDialog_js__WEBPACK_IMPORTED_MODULE_1__.NewDialog('dialog-new-catalog-tag-category', 'add-catalog-tag-category', 'tab-content-manage_tag_categories', this.#callbackNewDialog);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('name category editable', this.#startEditItem, this.#editedItem);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('description category editable', this.#startEditItem, this.#editedItem);
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
    retTr.className =  'edit-category';
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
    const params = {};
    params[column] = value;
    const sendUrl = `/catalog_tag_categories/${elem.parentElement.targetId}.json`
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.updateToServer(elem, oldValue, sendUrl, { catalog_tag_category: params }, () => {
      if (column === 'name') {
        EditCategory.#updateCategoryName(oldValue, value);
      }
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

/***/ }),

/***/ "./front_src/javascripts/modules/editGroup.js":
/*!****************************************************!*\
  !*** ./front_src/javascripts/modules/editGroup.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditGroup": () => (/* binding */ EditGroup)
/* harmony export */ });
/* harmony import */ var _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editTableBase.js */ "./front_src/javascripts/modules/editTableBase.js");
/* harmony import */ var _newDialog_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./newDialog.js */ "./front_src/javascripts/modules/newDialog.js");




class EditGroup extends _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase {
  constructor(elemTr) {
    super(elemTr, 'editable-group');
    elemTr.targetId = elemTr.id.slice(18);  // 18='catalog_tag_group-'.length
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-group')) {
      new EditGroup(edit);
    }
    new _newDialog_js__WEBPACK_IMPORTED_MODULE_1__.NewDialog('dialog-new-catalog-tag-group', 'add-catalog-tag-group', 'tab-content-manage_tag_groups', this.#callbackNewDialog);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('name group editable', this.#startEditItem, this.#editedItem);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('description group editable', this.#startEditItem, this.#editedItem);
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
    const datName = dialog.querySelector('input[name=\'catalog_tag_group[name]\']').value;
    const datDescription = dialog.querySelector('input[name=\'catalog_tag_group[description]\']').value;
    $.ajax({
      type: 'POST',
      url: `/projects/${IssuesCatalogSettingParam.project?.identifier}/catalog_tag_groups.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'text',
      format: 'json',
      data: {
        catalog_tag_group: {
          name: datName,
          description: datDescription
        }
      }
    }).done((data) => {
      if (data.startsWith('{')) {
        const tableBody = document.querySelector('table.catalog-tag-groups')?.querySelector('tbody');
        if (tableBody) {
          const retData = JSON.parse(data);
          const addTr = EditGroup.makeTableRow(retData.catalog_tag_group);
          tableBody.appendChild(addTr);
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
    const params = {};
    params[column] = value;
    const sendUrl = `/catalog_tag_groups/${elem.parentElement.targetId}.json`
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.updateToServer(elem, oldValue, sendUrl, { catalog_tag_group: params }, () => {
      if (column === 'name') {
        EditGroup.#updateGroupName(oldValue, value);
      }
    });
  }

  // タググループ名称変更を各所の表示反映
  static #updateGroupName(oldName, newName) {
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

}

/***/ }),

/***/ "./front_src/javascripts/modules/editSynonym.js":
/*!******************************************************!*\
  !*** ./front_src/javascripts/modules/editSynonym.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditSynonym": () => (/* binding */ EditSynonym)
/* harmony export */ });
/* harmony import */ var _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editTableBase.js */ "./front_src/javascripts/modules/editTableBase.js");
/* harmony import */ var _newDialog_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./newDialog.js */ "./front_src/javascripts/modules/newDialog.js");




class EditSynonym extends _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase {
  constructor(elemTr) {
    super(elemTr);
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-synonym')) {
      new EditSynonym(edit);
    }
    new _newDialog_js__WEBPACK_IMPORTED_MODULE_1__.NewDialog('dialog-new-synonym', 'add-synonym', 'tab-content-manage_synonyms', this.#callbackNewDialog);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('term synonym editable', this.#startEditItem, this.#editedItem);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('synonyms synonym multieditable', this.#startEditMulti, this.#editedMulti);
  }

  static makeTableRow(newItem) {
    const aDelBtn = document.createElement('a');
    aDelBtn.className = 'icon icon-del';
    aDelBtn.setAttribute('data-method', 'delete');
    aDelBtn.setAttribute('data-confirm', 'よろしいですか？');
    aDelBtn.setAttribute('rel', 'nofollow');
    aDelBtn.href = `/synonyms/${encodeURIComponent(newItem.term)}`;
    aDelBtn.appendChild(document.createTextNode('削除'));
    const tdTerm = document.createElement('td');
    tdTerm.className = 'term synonym editable';
    tdTerm.appendChild(document.createTextNode(newItem.term));
    const tdSynonyms = document.createElement('td');
    tdSynonyms.className = 'synonyms synonym multieditable';
    tdSynonyms.appendChild(document.createTextNode(newItem.synonyms.join(',')));
    const tdButtons = document.createElement('td');
    tdButtons.className = 'buttons';
    tdButtons.appendChild(aDelBtn);
    const retTr = document.createElement('tr');
    retTr.setAttribute('data-keyterm', newItem.term);
    retTr.className = 'edit-synonym';
    retTr.appendChild(tdTerm);
    retTr.appendChild(tdSynonyms);
    retTr.appendChild(tdButtons);
    new EditSynonym(retTr);
    return retTr;
  }


  static #callbackNewDialog(dialog) {
    if (!dialog) { return; }
    const datTerm = dialog.querySelector('input[name=\'synonym[term]\']').value;
    const datSynonyms = dialog.querySelector('input[name=\'synonym[synonyms][]\']').value.split(',');
    $.ajax({
      type: 'POST',
      url: `/synonyms.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'text',
      format: 'json',
      data: {
        synonym: {
          term: datTerm,
          synonyms: datSynonyms
        }
      }
    }).done((data) => {
      if (data.startsWith('{')) {
        const tableBody = document.querySelector('table.synonyms')?.querySelector('tbody');
        if (tableBody) {
          const retData = JSON.parse(data);
          const addTr = EditSynonym.makeTableRow(retData.synonym);
          tableBody.appendChild(addTr);
          EditSynonym.clearDialog(dialog);  //  次の追加に備えてダイアログクリア
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

  static clearDialog(dialog) {
    dialog.querySelector('input[name=\'synonym[term]\']').value = '';
    const inputSynonyms = dialog.querySelector('input[name=\'synonym[synonyms][]\']');
    inputSynonyms.value = '';
    $(inputSynonyms).tagit('removeAll');
  }


  //  multieditableの編集開始トリガー 
  static #startEditMulti(event) {
    const elem = event.target;
    const tmp = elem.querySelector('.tmp-edit');
    if (tmp) { return; }
    elem.setAttribute('data-value', elem.innerText);
    const tmpEdit = document.createElement('input');
    tmpEdit.setAttribute('type', 'text');
    tmpEdit.setAttribute('value', elem.innerText);
    tmpEdit.className = 'tmp-edit';
    elem.innerText = '';
    elem.appendChild(tmpEdit);
    $(tmpEdit).tagit({
      caseSensitive: false,
      removeConfirmation: true
    });
  }
  //  multieditableの編集完了トリガー 
  static #editedMulti(elem) {
    if (!elem) { return; }
    const tmp = elem.querySelector('.tmp-edit');
    if (!tmp) { return; }
    const value = tmp.value;
    while (elem.firstChild) { elem.removeChild(elem.firstChild); }
    elem.innerText = value;
    const oldValue = elem.getAttribute('data-value');
    if (oldValue === value) { return; }

    // const targetTerm = elem.parentElement.getAttribute('data-keyterm');
    const column = elem.classList.item(0);
    const params = {};
    params[column] = value.split(',');
    const sendUrl = `/synonyms/${encodeURIComponent(elem.parentElement.getAttribute('data-keyterm'))}.json`
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.updateToServer(elem, oldValue, sendUrl, { synonym: params });
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
    const params = {};
    params[column] = value;
    const sendUrl = `/synonyms/${encodeURIComponent(elem.parentElement.getAttribute('data-keyterm'))}.json`
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.updateToServer(elem, oldValue, sendUrl, { synonym: params }, () => {
      if (column === 'term') {
        elem.parentElement.setAttribute('data-keyterm', value);
      }
    });
  }
}

/***/ }),

/***/ "./front_src/javascripts/modules/editTableBase.js":
/*!********************************************************!*\
  !*** ./front_src/javascripts/modules/editTableBase.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditTableBase": () => (/* binding */ EditTableBase)
/* harmony export */ });
class EditTableBase {
  constructor(elemTr) {
    for (const elem of elemTr.querySelectorAll('.editable')) {
      elem.contentEditable = true;
      elem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {  //  改行させない 
          event.preventDefault();
        }
      });
    }
  }

  static #nowTarget = null;
  static #callbackBlurNowTarget = null;
  static #editTypes = null;

  static init() {
    this.#nowTarget = null;
    this.#callbackBlurNowTarget = null;
    this.#editTypes = new Map();

    document.addEventListener('click', (event) => this.#clicked(event));
  }

  static registEdit(className, callbackFocus, callbackBlur) {
    if (!className) { return; }
    this.#editTypes.set(className, {
      callbackFocus: callbackFocus,
      callbackBlur: callbackBlur
    });
  }

  static updateToServer(elem, oldValue, sendUrl, sendData, callbackOk) {
    const targetTerm = elem.parentElement.getAttribute('data-keyterm');
    $.ajax({
      type: 'PUT',
      url: sendUrl,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'json',
      format: 'json',
      data: sendData
    }).done((data, textStatus, jqXHR) => {
      // console.log(`jqXHR.status: ${jqXHR.status}`);
      if ((jqXHR.status >= 200 && jqXHR.status < 300) || jqXHR.status === 304) {
        if (callbackOk) {
          callbackOk();
        }
      } else {
        elem.innerText = oldValue;  //  更新失敗したので元に戻す 
      }
    }).fail((jqXHR) => {
      const message = (jqXHR.responseText.startsWith('{')) ?
        Object.entries(JSON.parse(jqXHR.responseText)).map(([key, value]) => `${key} : ${value}`).join('\n') :
        jqXHR.responseText;
      alert(`「${elem.innerText}」\n ${message}`);
      console.log(`「${elem.innerText}」 ${message}`);
      elem.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
  }



  static #clicked(event) {
    const target = event.target;
    if (target === this.#nowTarget) {
      // console.log(`click(same): ${target.className}`);
    } else {
      const callbacks = this.#canEdit(target);
      if (callbacks) {
        if (this.#callbackBlurNowTarget && this.#nowTarget) {
          this.#callbackBlurNowTarget(this.#nowTarget);
        }
        // console.log(`click(newTarget): ${target.className}`);
        if (callbacks.callbackFocus) {
          callbacks.callbackFocus(event);
        }
        this.#nowTarget = target;
        this.#callbackBlurNowTarget = callbacks.callbackBlur;
      } else if (this.#isSosenNowTarget(target)) {
        // console.log(`click(sosenNowTarget): ${target.className}`);
      } else if (this.#isSosenSelect2Open(target)) {  //  Select2のドロップダウン中はbodyの最後になるっぽいので、それは無視する 
        // console.log(`click(sosenSelect2Open): ${target.className}`);
      } else {
        // console.log(`click(other): ${target.className}`);
        if (this.#callbackBlurNowTarget && this.#nowTarget) {
          this.#callbackBlurNowTarget(this.#nowTarget);
        }
        this.#nowTarget = null;
        this.#callbackBlurNowTarget = null;
      }
    }
  }

  static #canEdit(target) {
    let ret = null;
    let callbacks = this.#editTypes.get(target.className);
    if (callbacks !== undefined) {
      return callbacks;
    }
    target.classList.forEach((c) => {
      callbacks = this.#editTypes.get(c);
      if (callbacks !== undefined) {
        ret = callbacks;
      }
    });
    return ret;
  }

  static #isSosenNowTarget(target) {
    for (let t = target; t; t = t.parentElement) {
      if (t === this.#nowTarget) { return true; }
    }
    return false;
  }

  static #isSosenSelect2Open(target) {
    for (let t = target; t; t = t.parentElement) {
      if (t.classList.contains('select2-container--open')) { return true; }
    }
    return false;
  }
}

/***/ }),

/***/ "./front_src/javascripts/modules/editTag.js":
/*!**************************************************!*\
  !*** ./front_src/javascripts/modules/editTag.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditTag": () => (/* binding */ EditTag)
/* harmony export */ });
/* harmony import */ var _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editTableBase.js */ "./front_src/javascripts/modules/editTableBase.js");
/* harmony import */ var _newDialog_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./newDialog.js */ "./front_src/javascripts/modules/newDialog.js");




class EditTag extends _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase {
  constructor(elemTr) {
    super(elemTr);
    elemTr.targetId = elemTr.id.slice(4); // 4='tag-'.length
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-tag')) {
      new EditTag(edit);
    }
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('name tag editable', this.#startEditItem, this.#editedItem);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('description tag editable', this.#startEditItem, this.#editedItem);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('category tag multiselect', this.#startSelectCategory, this.#selectedCategory);
    _editTableBase_js__WEBPACK_IMPORTED_MODULE_0__.EditTableBase.registEdit('group tag multiselect', this.#startSelectGroup, this.#selectedGroup);
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

    const targetId = elem.parentElement.targetId;
    const column = elem.classList.item(0);
    const value = elem.innerText || '__none__';
    $.ajax({
      type: 'PATCH',
      url: '/catalog_tags/field_update/',
      data: `id=${targetId}&catalog_tag[${column}]=${value}`,
    }).done(function (data) {
      if (data.status === 'SUCCESS') {
      } else {
        console.log(`${paramName} changed: ${targetId} : ${column} : ${value} : status ${data.status}`);
        if (data.message) {
          alert(data.message);
          console.log(data.message);
        }
        elem.innerText = oldValue;  //  更新失敗したので元に戻す 
      }
    }).fail(function (jqXHR, textStatus) {
      console.log(`${paramName} change failed: ${targetId} : ${column} : ${value} : ${textStatus}`);
      elem.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
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

    $.ajax({
      type: 'PATCH',
      url: '/catalog_tags/field_update/',
      data: { 'id': elem.parentElement.targetId, 'catalog_tag': { [param_ids]: sendValues } },
      dataType: 'json',
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      }
    }).done(function (data) {
      if (data.status === 'SUCCESS') {
        // console.log(`tag changed ${elem.parentElement.targetId} : ${sendValues}`);
      } else {
        console.log(`${paramName} changed: ${targetId} : ${column} : ${value} : status ${data.status}`);
        if (data.message) {
          alert(data.message);
          console.log(data.message);
        }
        elem.innerText = oldValue;  //  更新失敗したので元に戻す 
      }
    }).fail(function (jqXHR, textStatus) {
      console.log(`tag change failed: ${elem.parentElement.targetId} : ${sendValues} : ${textStatus}`);
      elem.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
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
}


/***/ }),

/***/ "./front_src/javascripts/modules/newDialog.js":
/*!****************************************************!*\
  !*** ./front_src/javascripts/modules/newDialog.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NewDialog": () => (/* binding */ NewDialog)
/* harmony export */ });
//  タグカテゴリ・タググループの追加ボタン時のダイアログ
class NewDialog {
  constructor(dialog_id, trigger_id, bg_id, submitCallback) {
    this.dialog = document.getElementById(dialog_id);
    this.trigger = document.getElementById(trigger_id);
    this.backGround = document.getElementById(bg_id);
    this.submitCallback = submitCallback;
    this.setupShowDialog();
    this.setupHideDialog();
  }
  setupShowDialog() {
    this.trigger?.addEventListener('click', () => {
      if (!this.dialog) { return; }
      this.dialog.showModal();
      this.dialog.style.visibility = 'visible';
      this.dialog.classList.remove('is-motioned');
      this.dialog.setAttribute('tabIndex', '0');
      this.dialog.focus();
    });
  }
  setupHideDialog() {
    if (!this.dialog) { return; }
    this.dialog.querySelector('.dialog-button-submit')?.addEventListener('click', () => {
      if (this.submitCallback) {
        this.submitCallback(this.dialog);
      }
      this.hideProcess('submit');
    });
    this.dialog.querySelector('.dialog-button-cancel')?.addEventListener('click', () => {
      this.hideProcess('cancel');
    });
    this.dialog.addEventListener('cancel', () => {
      this.hideProcess('cancel from escape key');
    });
  }
  hideProcess(resText) {
    if (!this.dialog) { return; }
    this.dialog.close(resText);
    this.dialog.classList.add('is-motioned');
    if (this.backGround) {
      this.backGround.setAttribute('tabIndex', '0');
      this.backGround.focus();
    }
    setTimeout(() => {
      this.dialog.style.visibility = 'hidden';
    }, 250);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************************************!*\
  !*** ./front_src/javascripts/settings.js ***!
  \*******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_bulkFormButton_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/bulkFormButton.js */ "./front_src/javascripts/modules/bulkFormButton.js");
/* harmony import */ var _modules_editTableBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/editTableBase.js */ "./front_src/javascripts/modules/editTableBase.js");
/* harmony import */ var _modules_editTag_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/editTag.js */ "./front_src/javascripts/modules/editTag.js");
/* harmony import */ var _modules_editCategory_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/editCategory.js */ "./front_src/javascripts/modules/editCategory.js");
/* harmony import */ var _modules_editGroup_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/editGroup.js */ "./front_src/javascripts/modules/editGroup.js");
/* harmony import */ var _modules_editSynonym_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/editSynonym.js */ "./front_src/javascripts/modules/editSynonym.js");










// jQuery用DOM準備完了時 document ready
$(function () {
  //  一括タグカテゴリの「一括追加」「一括削除」ボタン押下時
  (0,_modules_bulkFormButton_js__WEBPACK_IMPORTED_MODULE_0__.setupBulkFormButton)('#form-bulk-edit-tag-categories button', '#select-catalog-tag-categories');
  //  一括タググループの「一括追加」「一括削除」ボタン押下時
  (0,_modules_bulkFormButton_js__WEBPACK_IMPORTED_MODULE_0__.setupBulkFormButton)('#form-bulk-edit-tag-groups button', '#select-catalog-tag-groups');

  //  すべてにチェックつける・はずす
  $('input[type=checkbox].toggle-selection').on('change', function () {
    const checked = $(this).prop('checked');
    $(this).parents('table').find('input[name=ids\\[\\]]').prop('checked', checked);
  });


  _modules_editTableBase_js__WEBPACK_IMPORTED_MODULE_1__.EditTableBase.init();
  _modules_editTag_js__WEBPACK_IMPORTED_MODULE_2__.EditTag.init();
  _modules_editCategory_js__WEBPACK_IMPORTED_MODULE_3__.EditCategory.init();
  _modules_editGroup_js__WEBPACK_IMPORTED_MODULE_4__.EditGroup.init();
  _modules_editSynonym_js__WEBPACK_IMPORTED_MODULE_5__.EditSynonym.init();
});
})();

/******/ })()
;
//# sourceMappingURL=settings.js.map