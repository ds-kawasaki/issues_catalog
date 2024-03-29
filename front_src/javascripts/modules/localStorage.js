export class wrapLocalStorage {
  static #localStorageKeyCategoryTab = 'catalog-category-tabs-state';
  static #localStorageKeyHistory = 'catalog-history';
  static #localStorageKeyBtnThumbnails = 'catalog-btn-thumbnails';

  static #storageAvailable(type) {
    let storage;
    try {
      storage = window[type];
      const testValue = '__storage_test__';
      storage.setItem(testValue, testValue);
      storage.removeItem(testValue);
      return true;
    } catch (e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        (storage && storage.length !== 0);
    }
  };

  static setupFromStorageOnLoad() {
    if (!wrapLocalStorage.#storageAvailable('localStorage')) { return false; }
  
    const $bodyClass = $('body').attr('class');
    if ($bodyClass) {
      try {
        const postfixProject = '-' + $bodyClass.split(/\s+/).filter(function (s) {
          return s.match(/project-.*/);
        }).sort().join('-');
        wrapLocalStorage.#localStorageKeyCategoryTab += postfixProject;
        wrapLocalStorage.#localStorageKeyHistory += postfixProject;
        wrapLocalStorage.#localStorageKeyBtnThumbnails += postfixProject;
      } catch (e) {
        // in case of error (probably IE8), continue with the unmodified key
      }
    }
    return true;
  };


  static getHistorys() {
    const rawValue = localStorage.getItem(wrapLocalStorage.#localStorageKeyHistory);
    return rawValue ? JSON.parse(rawValue) : [];
  }
  static setHistorys(historys) {
    if (historys) {
      localStorage.setItem(wrapLocalStorage.#localStorageKeyHistory, JSON.stringify(historys));
    }
  }


  static getCategoryTab() {
    return localStorage.getItem(wrapLocalStorage.#localStorageKeyCategoryTab);
  }
  static setCategoryTab(tab) {
    if (tab) {
      localStorage.setItem(wrapLocalStorage.#localStorageKeyCategoryTab, tab);
    }
  }


  static getBtnThumbnails() {
    return localStorage.getItem(wrapLocalStorage.#localStorageKeyBtnThumbnails);
  }
  static setBtnThumbnails(value) {
    if (value) {
      localStorage.setItem(wrapLocalStorage.#localStorageKeyBtnThumbnails, value);
    }
  }
}