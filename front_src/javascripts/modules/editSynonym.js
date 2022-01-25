import { EditTableBase } from './editTableBase.js';
import { NewDialog } from './newDialog.js';


export class EditSynonym extends EditTableBase {
  constructor(elemTr) {
    super(elemTr);
    EditSynonym.#setupDelete(elemTr);
  }

  static init() {
    for (const edit of document.querySelectorAll('.edit-synonym')) {
      new EditSynonym(edit);
    }
    new NewDialog('dialog-new-synonym', 'add-synonym', 'tab-content-manage_synonyms', EditSynonym.#callbackNewDialog);
    EditTableBase.registEdit('term synonym editable', EditSynonym.#startEditItem, EditSynonym.#editedItem);
    EditTableBase.registEdit('synonyms synonym multieditable', EditSynonym.#startEditMulti, EditSynonym.#editedMulti);
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
    const sendData = {
      synonym: {
        term: dialog.querySelector('input[name=\'synonym[term]\']').value,
        synonyms: dialog.querySelector('input[name=\'synonym[synonyms][]\']').value.split(',')
      }
    };
    EditTableBase.updateToServer('/synonyms.json', sendData, 'POST',
      (data) => {
        const tableBody = document.querySelector('table.synonyms')?.querySelector('tbody');
        if ('synonym' in data && tableBody) {
          const addTr = EditSynonym.makeTableRow(data.synonym);
          tableBody.appendChild(addTr);
          EditSynonym.clearDialog(dialog);  //  次の追加に備えてダイアログクリア
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

    const sendUrl = `/synonyms/${encodeURIComponent(elem.parentElement.getAttribute('data-keyterm'))}.json`;
    const sendData = {
      synonym: {
        [elem.classList.item(0)]: value.split(',')
      }
    };
    EditTableBase.updateToServer(sendUrl, sendData, 'PUT',
      null,
      (message) => {
        if (message) {
          alert(`「${elem.innerText}」\n ${message}`);
          console.log(`「${elem.innerText}」 ${message}`);
        }
        elem.innerText = oldValue;  //  更新失敗したので元に戻す 
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
    const sendUrl = `/synonyms/${encodeURIComponent(elem.parentElement.getAttribute('data-keyterm'))}.json`;
    const sendData = {
      synonym: {
        [column]: value
      }
    };
    EditTableBase.updateToServer(sendUrl, sendData, 'PUT',
      () => {
        if (column === 'term') {
          elem.parentElement.setAttribute('data-keyterm', value);
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

  //  削除aタグを上書きして、REST APIで削除＞リロード（デフォルトだとredmine_tagsのオプションにリロードされるため）
  static #setupDelete(elemTr) {
    const delLink = elemTr.querySelector('a.icon-del');
    if (!delLink) { return; }
    delLink.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const elem = event.target;
      // console.log(`click: ${elem.href}`);
      const datConform = elem.getAttribute('data-confirm');
      if (datConform) {
        if (!window.confirm(datConform)) {
          return false;
        }
      }
      // const sendUrl = `/synonyms/${encodeURIComponent(elem.parentElement.parentElement.getAttribute('data-keyterm'))}.json`;
      const sendUrl = `${(new URL(elem.href)).pathname}.json`;
      EditTableBase.updateToServer(sendUrl, {}, 'DELETE',
        () => {
          document.location.reload();
        },
        (message) => {
          if (message) {
            alert(message);
            console.log(message);
          }
        });
      return false;
    });
  }
}