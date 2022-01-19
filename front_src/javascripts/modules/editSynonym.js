import { NewDialog } from './newDialog.js';


export class EditSynonym {
  constructor(elemTr) {
    this.targetTerm = elemTr.getAttribute('data-keyterm');
    this.columns = new Map();

    for (const edit of elemTr.querySelectorAll('.editable')) {
      const column = edit.classList.item(0);
      this.columns.set(column, edit);
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
    for (const edit of document.querySelectorAll('.edit-synonym')) {
      new EditSynonym(edit);
    }
    new NewDialog('dialog-new-synonym', 'add-synonym', 'tab-content-manage_synonyms', this.#callbackNewDialog);
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
    const datSynonyms = Array.from(dialog.querySelectorAll('input[name=\'synonym[synonyms][]\']')).map(v => v.value);
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
          dialog.querySelector('input[name=\'synonym[term]\']').value = '';
          for (const v of dialog.querySelectorAll('input[name=\'synonym[synonyms][]\']')) {
            v.value = '';
          }
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