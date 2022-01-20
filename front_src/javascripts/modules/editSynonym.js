import { EditTableBase } from './editTableBase.js';
import { NewDialog } from './newDialog.js';


export class EditSynonym {
  constructor(elemTr) {
    this.targetTerm = elemTr.getAttribute('data-keyterm');

    for (const elem of elemTr.querySelectorAll('.editable')) {
      this.#setupEditable(elem);
    }
    this.#setupMultieditable(elemTr.querySelector('.multieditable'));
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-synonym')) {
      new EditSynonym(edit);
    }
    new NewDialog('dialog-new-synonym', 'add-synonym', 'tab-content-manage_synonyms', this.#callbackNewDialog);
    EditTableBase.registEdit('editable', null, null);
    EditTableBase.registEdit('multieditable', null, this.#editedMuli);
  }

  static makeTableRow(newItem) {
    const aDelBtn = document.createElement('a');
    aDelBtn.classList.add('icon', 'icon-del');
    aDelBtn.setAttribute('data-method', 'delete');
    aDelBtn.setAttribute('data-confirm', 'よろしいですか？');
    aDelBtn.setAttribute('rel', 'nofollow');
    aDelBtn.href = `/synonyms/${encodeURIComponent(newItem.term)}`;
    aDelBtn.appendChild(document.createTextNode('削除'));
    const tdTerm = document.createElement('td');
    tdTerm.classList.add('term', 'editable');
    tdTerm.appendChild(document.createTextNode(newItem.term));
    const tdSynonyms = document.createElement('td');
    tdSynonyms.classList.add('synonyms', 'multieditable');
    tdSynonyms.appendChild(document.createTextNode(newItem.synonyms.join(',')));
    const tdButtons = document.createElement('td');
    tdButtons.classList.add('buttons');
    tdButtons.appendChild(aDelBtn);
    const retTr = document.createElement('tr');
    retTr.setAttribute('data-keyterm', newItem.term);
    retTr.classList.add('edit-synonym');
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


  #setupMultieditable(elem) {
    if (!elem) { return; }
    elem.setAttribute('data-value', elem.innerText);
    elem.addEventListener('click', (event) => {
      const target = event.target;  //this;
      if (!target.classList.contains('multieditable')) { return; }
      const tmp = target.querySelector('.tmp-edit');
      if (tmp) { return; }
      event.preventDefault();
      const tmpEdit = this.#makeEdits(target.innerText);
      target.innerText = '';
      target.appendChild(tmpEdit);
      $(tmpEdit).tagit({
        caseSensitive: false,
        removeConfirmation: true
      });
    });
  }

  #makeEdits(synonyms) {
    const tmpEdit = document.createElement('input');
    tmpEdit.setAttribute('type', 'text');
    tmpEdit.setAttribute('value', synonyms);
    tmpEdit.className = 'tmp-edit';
    return tmpEdit;
  }

  static #editedMuli(elem) {
    if (!elem) { return; }
    const tmp = elem.querySelector('.tmp-edit');
    if (!tmp) { return; }
    const value = tmp.value;
    while (elem.firstChild) { elem.removeChild(elem.firstChild); }
    elem.innerText = value;
    const oldValue = elem.getAttribute('data-value');
    if (oldValue === value) { return; }

    const targetTerm = elem.parentElement.getAttribute('data-keyterm');
    const column = elem.classList.item(0);
    const params = {};
    params[column] = value.split(',');
    $.ajax({
      type: 'PUT',
      url: `/synonyms/${encodeURIComponent(targetTerm)}.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'json',
      format: 'json',
      data: { synonym: params }
    }).done((data, textStatus, jqXHR) => {
      // console.log(`jqXHR.status: ${jqXHR.status}`);
      if ((jqXHR.status >= 200 && jqXHR.status < 300) || jqXHR.status === 304) {
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


  //  シンプルなテキスト入力を有効化 
  #setupEditable(elem) {
    if (!elem) { return; }
    elem.contentEditable = true;
    elem.setAttribute('data-value', elem.innerText);
    elem.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {  //  改行させない 
        event.preventDefault();
      }
    });
    elem.addEventListener('focusout', (event) => {
      this.#editedItem(event);
    });
    elem.addEventListener('focusin', (event) => {
      event.target.setAttribute('data-value', event.target.innerText);
    });
  }

  //  シンプルなテキスト変更トリガー 
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
      url: `/synonyms/${encodeURIComponent(this.targetTerm)}.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'json',
      format: 'json',
      data: { synonym: params }
    }).done((data, textStatus, jqXHR) => {
      // console.log(`jqXHR.status: ${jqXHR.status}`);
      if ((jqXHR.status >= 200 && jqXHR.status < 300) || jqXHR.status === 304) {
        if (column === 'term') {
          this.targetTerm = value;
          target.closest('.edit-synonym')?.setAttribute('data-keyterm', value);
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

}