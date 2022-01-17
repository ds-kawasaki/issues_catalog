export const setupEdit = (className, idSliceNum, targetUrl, paramName, editedCallback) => {
  const editedItem = (event) => {
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
    const targetId = target.parentNode?.id?.slice(idSliceNum);
    const column = target.classList.item(0);
    const value = target.innerText || '__none__';
    $.ajax({
      type: 'PATCH',
      url: targetUrl,
      data: `id=${targetId}&${paramName}[${column}]=${value}`,
    }).done(function (data) {
      if (data.status === 'SUCCESS') {
        if (column === 'name') {
          if (editedCallback) {
            editedCallback(targetId, oldValue, value); // 名称変更を各所の表示反映
          }
          // const targetTr = target.parentNode;
          // if (targetTr) { //  name欄編集したら並べ替え 
          //   const targetTbody = targetTr.parentNode;
          //   if (targetTbody && targetTbody.children.length > 1) {
          //     targetTbody.removeChild(targetTr);
          //     for (const c of targetTbody.children) {
          //       const cValue = c.querySelector('.name')?.innerText;
          //       if (cValue > value) {
          //         targetTbody.insertBefore(targetTr, c);
          //         break;
          //       }
          //     }
          //     if (!targetTr.parentNode) {
          //       targetTbody.appendChild(targetTr);
          //     }
          //   }
          // }
        }
      } else {
        console.log(`${paramName} changed: ${targetId} : ${column} : ${value} : status ${data.status}`);
        if (data.message) {
          alert(data.message);
          console.log(data.message);
        }
        target.innerText = oldValue;  //  更新失敗したので元に戻す 
      }
    }).fail(function (jqXHR, textStatus) {
      console.log(`${paramName} change failed: ${targetId} : ${column} : ${value} : ${textStatus}`);
      target.innerText = oldValue;  //  更新失敗したので元に戻す 
    });
    return false;
  };
  for (const edit of document.querySelectorAll(className)) {
    edit.contentEditable = true;
    edit.setAttribute('data-value', edit.innerText);
    edit.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {  //  改行させない 
        event.preventDefault();
      }
    });
    edit.addEventListener('focusout', function (event) {
      editedItem(event);
    });
    edit.addEventListener('focusin', function (event) {
      event.target.setAttribute('data-value', event.target.innerText);
    });
  }
};
