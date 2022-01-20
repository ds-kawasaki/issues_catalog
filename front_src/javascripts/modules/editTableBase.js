export class EditTableBase {
  static #nowTarget = null;
  static #callbackBlurNowTarget = null;
  static #editTypes = null;

  static init() {
    this.#nowTarget = null;
    this.#callbackBlurNowTarget = null;
    this.#editTypes = new Map();

    document.addEventListener('click', (event) => {
      const target = event.target;
      console.log(`EditTableBase:click targetClass: ${target.className}`);
      if (target === this.#nowTarget) {
        console.log('same');
      } else {
        const callbacks = this.#canEdit(target);
        if (callbacks) {
          if (this.#callbackBlurNowTarget && this.#nowTarget) {
            console.log('callbackBlur');
            this.#callbackBlurNowTarget(this.#nowTarget);
          }
          console.log(`newTarget: ${target.className}`);
          this.#nowTarget = target;
          if (callbacks.callbackFocus) {
            callbacks.callbackFocus(event);
          }
          this.#callbackBlurNowTarget = callbacks.callbackBlur;
        } else if (this.#isSosenNowTarget(target)) {
          console.log('sosenNowTarget');
        } else {
          console.log('other');
          if (this.#callbackBlurNowTarget && this.#nowTarget) {
            console.log('callbackBlur');
            this.#callbackBlurNowTarget(this.#nowTarget);
          }
          this.#nowTarget = null;
          this.#callbackBlurNowTarget = null;
        }
      }
    });
  }

  static registEdit(className, callbackFocus, callbackBlur) {
    if (!className) { return; }
    this.#editTypes.set(className, {
      callbackFocus: callbackFocus,
      callbackBlur: callbackBlur
    });
  }


  static #canEdit(target) {
    let ret = null;
    target.classList.forEach((c) => {
      const callbacks = this.#editTypes.get(c);
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
}