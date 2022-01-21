import { EditTableBase } from './editTableBase.js';
import { NewDialog } from './newDialog.js';


export class EditSynonym extends EditTableBase {
  constructor(elemTr) {
    super(elemTr);
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-synonym')) {
      new EditSynonym(edit);
    }
    new NewDialog('dialog-new-synonym', 'add-synonym', 'tab-content-manage_synonyms', this.#callbackNewDialog);
    EditTableBase.registEdit('term synonym editable', this.#startEditItem, this.#editedItem);
    EditTableBase.registEdit('synonyms synonym multieditable', this.#startEditMulti, this.#editedMulti);
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
    EditTableBase.updateToServer(elem, oldValue, sendUrl, { synonym: params });
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
    EditTableBase.updateToServer(elem, oldValue, sendUrl, { synonym: params }, () => {
      if (column === 'term') {
        elem.parentElement.setAttribute('data-keyterm', value);
      }
    });
  }
}