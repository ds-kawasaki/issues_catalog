export class EditTableBase {
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