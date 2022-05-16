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
    EditTableBase.#nowTarget = null;
    EditTableBase.#callbackBlurNowTarget = null;
    EditTableBase.#editTypes = new Map();

    // document.addEventListener('click', (event) => EditTableBase.#clicked(event.target));
    let isClick = false;
    let startTarget = null;
    document.addEventListener('mousedown', (event) => {
      startTarget = event.target;
      isClick = true;
    });
    document.addEventListener('mousemove', (event) => {
      isClick = false;
    });
    document.addEventListener('mouseup', (event) => {
      if (isClick) {
        EditTableBase.#clicked(event.target);
      } else {
        EditTableBase.#clicked(startTarget);
      }
    });
  }

  static registEdit(className, callbackFocus, callbackBlur) {
    if (!className) { return; }
    EditTableBase.#editTypes.set(className, {
      callbackFocus: callbackFocus,
      callbackBlur: callbackBlur
    });
  }

  static updateToServer(sendUrl, sendData, sendType = 'PUT', callbackOk = null, callbackNg = null) {
    $.ajax({
      type: sendType,
      url: sendUrl,
      headers: {
        'X-Redmine-API-Key': IssuesCatalogSettingParam.user.apiKey
      },
      dataType: 'text', // json指定してREST APIの戻りが空っぽだとfailになるのでtextで
      format: 'json',
      data: sendData
    }).done((data, textStatus, jqXHR) => {
      // console.log(`jqXHR.status: ${jqXHR.status}`);
      if ((jqXHR.status >= 200 && jqXHR.status < 300) || jqXHR.status === 304) {
        if (callbackOk) {
          const datData = typeof data === 'string' && data.startsWith('{') ? JSON.parse(data) : {};
          callbackOk(datData);
        }
      } else {
        if (callbackNg) {
          callbackNg(null);
        }
      }
    }).fail((jqXHR) => {
      const message = (jqXHR.responseText.startsWith('{')) ?
        Object.entries(JSON.parse(jqXHR.responseText)).map(([key, value]) => `${key} : ${value}`).join('\n') :
        jqXHR.responseText;
      if (callbackNg) {
        callbackNg(message);
      }
    });
  }



  static #clicked(target) {
    if (target === EditTableBase.#nowTarget) {
      // console.log(`click(same): ${target.className}`);
    } else {
      const callbacks = EditTableBase.#canEdit(target);
      if (callbacks) {
        // console.log(`click(newTarget): ${target?.className}`);
        if (EditTableBase.#callbackBlurNowTarget && EditTableBase.#nowTarget) {
          EditTableBase.#callbackBlurNowTarget(EditTableBase.#nowTarget);
        }
        if (callbacks.callbackFocus) {
          callbacks.callbackFocus(target);
        }
        EditTableBase.#nowTarget = target;
        EditTableBase.#callbackBlurNowTarget = callbacks.callbackBlur;
      } else if (EditTableBase.#isSosenNowTarget(target)) {
        // console.log(`click(sosenNowTarget): ${target?.className}`);
      } else if (EditTableBase.#isSosenSelect2Open(target)) {  //  Select2のドロップダウン中はbodyの最後になるっぽいので、それは無視する 
        // console.log(`click(sosenSelect2Open): ${target?.className}`);
      } else {
        // console.log(`click(other): ${target?.className} : ${EditTableBase.#nowTarget}`);
        if (EditTableBase.#callbackBlurNowTarget && EditTableBase.#nowTarget) {
          EditTableBase.#callbackBlurNowTarget(EditTableBase.#nowTarget);
        }
        EditTableBase.#nowTarget = null;
        EditTableBase.#callbackBlurNowTarget = null;
      }
    }
  }

  static #canEdit(target) {
    if (target === null) { return null; }
    let ret = null;
    let callbacks = EditTableBase.#editTypes.get(target.className);
    if (callbacks !== undefined) {
      return callbacks;
    }
    target.classList.forEach((c) => {
      callbacks = EditTableBase.#editTypes.get(c);
      if (callbacks !== undefined) {
        ret = callbacks;
      }
    });
    return ret;
  }

  static #isSosenNowTarget(target) {
    for (let t = target; t; t = t.parentElement) {
      if (t === EditTableBase.#nowTarget) { return true; }
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