import { wrapLocalStorage } from './localStorage.js';

const MAX_HISTORY = 20;

// ヒストリータブ内容セット
export const setHistoryOnLoad = (funcMakeTagElementNowMode) => {
  const divHistory = document.querySelector('#catalog-category-history');
  if (!divHistory) { return; }
  const historys = wrapLocalStorage.getHistorys();
  for (const history of historys) {
    divHistory.appendChild(funcMakeTagElementNowMode(history, 'ul'));
  }
};

//  ヒストリー更新
export const addHistory = (tagText) => {
  const historys = wrapLocalStorage.getHistorys();
  const idx = historys.indexOf(tagText);
  if (idx >= 0) {
    historys.splice(idx, 1);
  }
  historys.unshift(tagText);
  if (historys.length > MAX_HISTORY) {
    historys.pop();
  }
  wrapLocalStorage.setHistorys(historys);
};
