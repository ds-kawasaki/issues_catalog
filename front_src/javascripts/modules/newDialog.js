//  タグカテゴリ・タググループの追加ボタン時のダイアログ
export class NewDialog {
  constructor(dialog_id, trigger_id, bg_id, submitCallback) {
    this.dialog = document.getElementById(dialog_id);
    this.trigger = document.getElementById(trigger_id);
    this.backGround = document.getElementById(bg_id);
    this.submitCallback = submitCallback;
    this.setupShowDialog();
    this.setupHideDialog();
  }
  setupShowDialog() {
    this.trigger?.addEventListener('click', () => {
      if (!this.dialog) { return; }
      this.dialog.showModal();
      this.dialog.style.visibility = 'visible';
      this.dialog.classList.remove('is-motioned');
      this.dialog.setAttribute('tabIndex', '0');
      this.dialog.focus();
    });
  }
  setupHideDialog() {
    if (!this.dialog) { return; }
    this.dialog.querySelector('.dialog-button-submit')?.addEventListener('click', () => {
      if (this.submitCallback) {
        this.submitCallback(this.dialog);
      }
      this.hideProcess('submit');
    });
    this.dialog.querySelector('.dialog-button-cancel')?.addEventListener('click', () => {
      this.hideProcess('cancel');
    });
    this.dialog.addEventListener('cancel', () => {
      this.hideProcess('cancel from escape key');
    });
  }
  hideProcess(resText) {
    if (!this.dialog) { return; }
    this.dialog.close(resText);
    this.dialog.classList.add('is-motioned');
    if (this.backGround) {
      this.backGround.setAttribute('tabIndex', '0');
      this.backGround.focus();
    }
    setTimeout(() => {
      this.dialog.style.visibility = 'hidden';
    }, 250);
  }
}
