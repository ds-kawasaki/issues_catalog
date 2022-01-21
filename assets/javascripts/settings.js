(()=>{"use strict";const t=(t,e)=>{$(t).on("click",(function(){if(!$(e).val().length)return;const t=$(this).parents("form");t.find("[name=ids\\[\\]]").remove();let a=!1;$("input[name=ids\\[\\]]:checked").each((function(){$("<input>").attr({type:"hidden",name:"ids[]"}).val($(this).val()).appendTo(t),a=!0})),a&&(t.find("[name=operate]").val($(this).val()),t.submit())}))},e=(t,e,a)=>{const n=document.querySelector(t);if(n){const t=(t,e,a)=>{const o=t.split(",").map((t=>t.trim())),s=document.createElement("select");s.id=a,s.className=e,s.multiple=!0;for(const t of n.options){const e=document.createElement("option");e.value=t.value,e.text=t.text,o.includes(e.text)&&e.setAttribute("selected","selected"),s.appendChild(e)}return s},o=(t,a,n)=>{t.select2({width:"resolve",placeholder:"Multi-select",closeOnSelect:!1,allowClear:!1}),t.select2("open"),t.on("select2:close",(function(t){const o=Array.from(this.options).filter((t=>t.selected)).map((t=>t.text)).join(", ");let s=Array.from(this.options).filter((t=>t.selected)).map((t=>t.value));for(0==s.length&&(s=[""]);a.firstChild;)a.removeChild(a.firstChild);a.innerText=o;const i=a.getAttribute("data-value");i!==o&&(t.preventDefault(),$.ajax({type:"PATCH",url:"/catalog_tags/field_update/",data:{id:n,catalog_tag:{[e]:s}},dataType:"json"}).done((function(t){"SUCCESS"===t.status||(console.log(`${paramName} changed: ${targetId} : ${column} : ${value} : status ${t.status}`),t.message&&(alert(t.message),console.log(t.message)),a.innerText=i)})).fail((function(t,e){console.log(`tag change failed: ${n} : ${s} : ${e}`),a.innerText=i})))}))};for(const e of document.querySelectorAll(a))e.addEventListener("click",(function(e){const a=this;if(a.querySelector(".tmp-select"))return;const n=a.parentNode?.id?.slice(4);a.setAttribute("data-value",a.innerText);const s=t(a.innerText,"tmp-select",`tmp-select-${n}`);a.innerText="",a.appendChild(s),o($(s),a,n)}))}};class a{constructor(t){for(const e of t.querySelectorAll(".editable"))e.contentEditable=!0,e.addEventListener("keydown",(t=>{"Enter"===t.key&&t.preventDefault()}))}static#t=null;static#e=null;static#a=null;static init(){this.#t=null,this.#e=null,this.#a=new Map,document.addEventListener("click",(t=>this.#n(t)))}static registEdit(t,e,a){t&&this.#a.set(t,{callbackFocus:e,callbackBlur:a})}static updateToServer(t,e,a,n,o){t.parentElement.getAttribute("data-keyterm"),$.ajax({type:"PUT",url:a,headers:{"X-Redmine-API-Key":IssuesCatalogSettingParam.user.apiKey},dataType:"json",format:"json",data:n}).done(((a,n,s)=>{s.status>=200&&s.status<300||304===s.status?o&&o():t.innerText=e})).fail((a=>{const n=a.responseText.startsWith("{")?Object.entries(JSON.parse(a.responseText)).map((([t,e])=>`${t} : ${e}`)).join("\n"):a.responseText;alert(`「${t.innerText}」\n ${n}`),console.log(`「${t.innerText}」 ${n}`),t.innerText=e}))}static#n(t){const e=t.target;if(e===this.#t);else{const a=this.#o(e);a?(this.#e&&this.#t&&this.#e(this.#t),a.callbackFocus&&a.callbackFocus(t),this.#t=e,this.#e=a.callbackBlur):this.#s(e)||(this.#e&&this.#t&&this.#e(this.#t),this.#t=null,this.#e=null)}}static#o(t){let e=null,a=this.#a.get(t.className);return void 0!==a?a:(t.classList.forEach((t=>{a=this.#a.get(t),void 0!==a&&(e=a)})),e)}static#s(t){for(let e=t;e;e=e.parentElement)if(e===this.#t)return!0;return!1}}class n{constructor(t,e,a,n){this.dialog=document.getElementById(t),this.trigger=document.getElementById(e),this.backGround=document.getElementById(a),this.submitCallback=n,this.setupShowDialog(),this.setupHideDialog()}setupShowDialog(){this.trigger?.addEventListener("click",(()=>{this.dialog&&(this.dialog.showModal(),this.dialog.style.visibility="visible",this.dialog.classList.remove("is-motioned"),this.dialog.setAttribute("tabIndex","0"),this.dialog.focus())}))}setupHideDialog(){this.dialog&&(this.dialog.querySelector(".dialog-button-submit")?.addEventListener("click",(()=>{this.submitCallback&&this.submitCallback(this.dialog),this.hideProcess("submit")})),this.dialog.querySelector(".dialog-button-cancel")?.addEventListener("click",(()=>{this.hideProcess("cancel")})),this.dialog.addEventListener("cancel",(()=>{this.hideProcess("cancel from escape key")})))}hideProcess(t){this.dialog&&(this.dialog.close(t),this.dialog.classList.add("is-motioned"),this.backGround&&(this.backGround.setAttribute("tabIndex","0"),this.backGround.focus()),setTimeout((()=>{this.dialog.style.visibility="hidden"}),250))}}class o extends a{constructor(t){super(t),t.targetId=t.id.slice(21)}static init(){for(const t of document.querySelectorAll(".edit-category"))new o(t);new n("dialog-new-catalog-tag-category","add-catalog-tag-category","tab-content-manage_tag_categories",this.#i),a.registEdit("name category editable",this.#r,this.#c),a.registEdit("description category editable",this.#r,this.#c)}static makeTableRow(t){const e=document.createElement("a");e.className="icon icon-del",e.setAttribute("data-method","delete"),e.setAttribute("data-confirm","よろしいですか？"),e.setAttribute("rel","nofollow"),e.href=`/catalog_tag_categories/${t.id}`,e.appendChild(document.createTextNode("削除"));const a=document.createElement("td");a.className="name category editable",a.appendChild(document.createTextNode(t.name));const n=document.createElement("td");n.className="description category editable",n.appendChild(document.createTextNode(t.description));const s=document.createElement("td");s.className="buttons",s.appendChild(e);const i=document.createElement("tr");return i.id=`catalog_tag_category-${t.id}`,i.className="edit-category",i.appendChild(a),i.appendChild(n),i.appendChild(s),new o(i),i}static#i(t){if(!t)return;const e=t.querySelector("input[name='catalog_tag_category[name]']").value,a=t.querySelector("input[name='catalog_tag_category[description]']").value;$.ajax({type:"POST",url:`/projects/${IssuesCatalogSettingParam.project?.identifier}/catalog_tag_categories.json`,headers:{"X-Redmine-API-Key":IssuesCatalogSettingParam.user.apiKey},dataType:"text",format:"json",data:{catalog_tag_category:{name:e,description:a}}}).done((t=>{if(t.startsWith("{")){const e=document.querySelector("table.catalog-tag-categories")?.querySelector("tbody");if(e){const a=JSON.parse(t),n=o.makeTableRow(a.catalog_tag_category);e.insertBefore(n,e.lastElementChild)}}else console.log(t)})).fail(((t,e)=>{const a=t.responseText.startsWith("{")?Object.entries(JSON.parse(t.responseText)).map((([t,e])=>`${t} : ${e}`)).join("\n"):t.responseText;alert(a),console.log(a)}))}static#r(t){const e=t.target;e.setAttribute("data-value",e.innerText)}static#c(t){t.innerText=t.innerText.replace(/[\r\n]/g,"");const e=t.getAttribute("data-value");if(e===t.innerText)return!0;if(0===t.innerText.length)return t.innerText=e,!0;const n=t.classList.item(0),s=t.innerText||"__none__",i={};i[n]=s;const r=`/catalog_tag_categories/${t.parentElement.targetId}.json`;a.updateToServer(t,e,r,{catalog_tag_category:i},(()=>{"name"===n&&o.#l(e,s)}))}static#l(t,e){for(const a of document.querySelectorAll(".edit2-tag"))a.innerText.includes(t)&&(a.innerText=a.innerText.replace(t,e));const a=document.querySelector("#work-tag-category");for(const n of a?.options)n.text===t&&(n.text=e);const n=document.querySelector("#select-catalog-tag-categories");for(const a of n?.options)a.text===t&&(a.text=e);$(n)?.val(null).trigger("change")}}class s extends a{constructor(t){super(t,"editable-group"),t.targetId=t.id.slice(18)}static init(){for(const t of document.querySelectorAll(".edit-group"))new s(t);new n("dialog-new-catalog-tag-group","add-catalog-tag-group","tab-content-manage_tag_groups",this.#i),a.registEdit("name group editable",this.#r,this.#c),a.registEdit("description group editable",this.#r,this.#c)}static makeTableRow(t){const e=document.createElement("a");e.className="icon icon-del",e.setAttribute("data-method","delete"),e.setAttribute("data-confirm","よろしいですか？"),e.setAttribute("rel","nofollow"),e.href=`/catalog_tag_groups/${t.id}`,e.appendChild(document.createTextNode("削除"));const a=document.createElement("td");a.className="name group editable",a.appendChild(document.createTextNode(t.name));const n=document.createElement("td");n.className="description group editable",n.appendChild(document.createTextNode(t.description));const o=document.createElement("td");o.classname="buttons",o.appendChild(e);const i=document.createElement("tr");return i.id=`catalog_tag_group-${t.id}`,i.className="edit-group",i.appendChild(a),i.appendChild(n),i.appendChild(o),new s(i),i}static#i(t){if(!t)return;const e=t.querySelector("input[name='catalog_tag_group[name]']").value,a=t.querySelector("input[name='catalog_tag_group[description]']").value;$.ajax({type:"POST",url:`/projects/${IssuesCatalogSettingParam.project?.identifier}/catalog_tag_groups.json`,headers:{"X-Redmine-API-Key":IssuesCatalogSettingParam.user.apiKey},dataType:"text",format:"json",data:{catalog_tag_group:{name:e,description:a}}}).done((t=>{if(t.startsWith("{")){const e=document.querySelector("table.catalog-tag-groups")?.querySelector("tbody");if(e){const a=JSON.parse(t),n=s.makeTableRow(a.catalog_tag_group);e.appendChild(n)}}else console.log(t)})).fail(((t,e)=>{const a=t.responseText.startsWith("{")?Object.entries(JSON.parse(t.responseText)).map((([t,e])=>`${t} : ${e}`)).join("\n"):t.responseText;alert(a),console.log(a)}))}static#r(t){const e=t.target;e.setAttribute("data-value",e.innerText)}static#c(t){t.innerText=t.innerText.replace(/[\r\n]/g,"");const e=t.getAttribute("data-value");if(e===t.innerText)return!0;if(0===t.innerText.length)return t.innerText=e,!0;const n=t.classList.item(0),o=t.innerText||"__none__",i={};i[n]=o;const r=`/catalog_tag_groups/${t.parentElement.targetId}.json`;a.updateToServer(t,e,r,{catalog_tag_group:i},(()=>{"name"===n&&s.#d(e,o)}))}static#d(t,e){for(const a of document.querySelectorAll(".edit3-tag"))a.innerText.includes(t)&&(a.innerText=a.innerText.replace(t,e));const a=document.querySelector("#work-tag-group");for(const n of a?.options)n.text===t&&(n.text=e);const n=document.querySelector("#select-catalog-tag-groups");for(const a of n?.options)a.text===t&&(a.text=e);$(n)?.val(null).trigger("change")}}class i extends a{constructor(t){super(t)}static init(){for(const t of document.querySelectorAll(".edit-synonym"))new i(t);new n("dialog-new-synonym","add-synonym","tab-content-manage_synonyms",this.#i),a.registEdit("term synonym editable",this.#r,this.#c),a.registEdit("synonyms synonym multieditable",this.#u,this.#g)}static makeTableRow(t){const e=document.createElement("a");e.className="icon icon-del",e.setAttribute("data-method","delete"),e.setAttribute("data-confirm","よろしいですか？"),e.setAttribute("rel","nofollow"),e.href=`/synonyms/${encodeURIComponent(t.term)}`,e.appendChild(document.createTextNode("削除"));const a=document.createElement("td");a.className="term synonym editable",a.appendChild(document.createTextNode(t.term));const n=document.createElement("td");n.className="synonyms synonym multieditable",n.appendChild(document.createTextNode(t.synonyms.join(",")));const o=document.createElement("td");o.className="buttons",o.appendChild(e);const s=document.createElement("tr");return s.setAttribute("data-keyterm",t.term),s.className="edit-synonym",s.appendChild(a),s.appendChild(n),s.appendChild(o),new i(s),s}static#i(t){if(!t)return;const e=t.querySelector("input[name='synonym[term]']").value,a=t.querySelector("input[name='synonym[synonyms][]']").value.split(",");$.ajax({type:"POST",url:"/synonyms.json",headers:{"X-Redmine-API-Key":IssuesCatalogSettingParam.user.apiKey},dataType:"text",format:"json",data:{synonym:{term:e,synonyms:a}}}).done((e=>{if(e.startsWith("{")){const a=document.querySelector("table.synonyms")?.querySelector("tbody");if(a){const n=JSON.parse(e),o=i.makeTableRow(n.synonym);a.appendChild(o),i.clearDialog(t)}}else console.log(e)})).fail(((t,e)=>{const a=t.responseText.startsWith("{")?Object.entries(JSON.parse(t.responseText)).map((([t,e])=>`${t} : ${e}`)).join("\n"):t.responseText;alert(a),console.log(a)}))}static clearDialog(t){t.querySelector("input[name='synonym[term]']").value="";const e=t.querySelector("input[name='synonym[synonyms][]']");e.value="",$(e).tagit("removeAll")}static#u(t){const e=t.target;if(e.querySelector(".tmp-edit"))return;e.setAttribute("data-value",e.innerText);const a=document.createElement("input");a.setAttribute("type","text"),a.setAttribute("value",e.innerText),a.className="tmp-edit",e.innerText="",e.appendChild(a),$(a).tagit({caseSensitive:!1,removeConfirmation:!0})}static#g(t){if(!t)return;const e=t.querySelector(".tmp-edit");if(!e)return;const n=e.value;for(;t.firstChild;)t.removeChild(t.firstChild);t.innerText=n;const o=t.getAttribute("data-value");if(o===n)return;const s={};s[t.classList.item(0)]=n.split(",");const i=`/synonyms/${encodeURIComponent(t.parentElement.getAttribute("data-keyterm"))}.json`;a.updateToServer(t,o,i,{synonym:s})}static#r(t){const e=t.target;e.setAttribute("data-value",e.innerText)}static#c(t){t.innerText=t.innerText.replace(/[\r\n]/g,"");const e=t.getAttribute("data-value");if(e===t.innerText)return!0;if(0===t.innerText.length)return t.innerText=e,!0;const n=t.classList.item(0),o=t.innerText||"__none__",s={};s[n]=o;const i=`/synonyms/${encodeURIComponent(t.parentElement.getAttribute("data-keyterm"))}.json`;a.updateToServer(t,e,i,{synonym:s},(()=>{"term"===n&&t.parentElement.setAttribute("data-keyterm",o)}))}}$((function(){t("#form-bulk-edit-tag-categories button","#select-catalog-tag-categories"),t("#form-bulk-edit-tag-groups button","#select-catalog-tag-groups"),$("input[type=checkbox].toggle-selection").on("change",(function(){const t=$(this).prop("checked");$(this).parents("table").find("input[name=ids\\[\\]]").prop("checked",t)})),a.init(),o.init(),s.init(),i.init(),((t,e,a,n,o)=>{const s=t=>{const e=t.target;e.innerText=e.innerText.replace(/[\r\n]/g,"");const a=e.getAttribute("data-value");if(a===e.innerText)return!0;if(0===e.innerText.length)return e.innerText=a,!0;t.preventDefault();const n=e.parentNode?.id?.slice(4),o=e.classList.item(0),s=e.innerText||"__none__";return $.ajax({type:"PATCH",url:"/catalog_tags/field_update/",data:`id=${n}&catalog_tag[${o}]=${s}`}).done((function(t){"SUCCESS"!==t.status&&(console.log(`catalog_tag changed: ${n} : ${o} : ${s} : status ${t.status}`),t.message&&(alert(t.message),console.log(t.message)),e.innerText=a)})).fail((function(t,i){console.log(`catalog_tag change failed: ${n} : ${o} : ${s} : ${i}`),e.innerText=a})),!1};for(const t of document.querySelectorAll(".edit-tag"))t.contentEditable=!0,t.setAttribute("data-value",t.innerText),t.addEventListener("keydown",(function(t){"Enter"===t.key&&t.preventDefault()})),t.addEventListener("focusout",(function(t){s(t)})),t.addEventListener("focusin",(function(t){t.target.setAttribute("data-value",t.target.innerText)}))})(),e("#work-tag-category","catalog_tag_category_ids",".edit2-tag"),e("#work-tag-group","catalog_tag_group_ids",".edit3-tag")}))})();