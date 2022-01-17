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
        this.editedItem(event);
      });
      edit.addEventListener('focusin', (event) => {
        event.target.setAttribute('data-value', event.target.innerText);
      });
    }
  }

  editedItem(event) {
    // console.dir(this);
    // console.dir(event);
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

    const params = this.makeParam();
    // console.dir(params); 
    $.ajax({
      type: 'PUT',
      url: `/catalog_tag_categories/${this.targetId}.json`,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'json',
      format: 'json',
      data: { catalog_tag_category: params }
    }).done(function (data, textStatus, jqXHR) {
      // console.log(`data: ${data}   textStatus: ${textStatus}`);
      // console.dir(jqXHR);
    }).fail(function(jqXHR, textStatus) {
      const message = (jqXHR.responseText.startsWith('{')) ?
        Object.entries(JSON.parse(jqXHR.responseText)).map(([key, value]) => `${key} : ${value}`).join('\n') :
        jqXHR.responseText;
      alert(message);
      console.log(message);
      target.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
  }

  makeParam() {
    let ret = {};
    for (const [key, value] of this.columns) {
      ret[key] = value.innerText;
    }
    return ret;
  }
}