(()=>{"use strict";class t{static#t="catalog-category-tabs-state";static#e="catalog-history";static#a(t){let e;try{e=window[t];const a="__storage_test__";return e.setItem(a,a),e.removeItem(a),!0}catch(t){return t instanceof DOMException&&(22===t.code||1014===t.code||"QuotaExceededError"===t.name||"NS_ERROR_DOM_QUOTA_REACHED"===t.name)&&e&&0!==e.length}}static setupFromStorageOnLoad(){if(!t.#a("localStorage"))return!1;const e=$("body").attr("class");if(e)try{const a="-"+e.split(/\s+/).filter((function(t){return t.match(/project-.*/)})).sort().join("-");t.#t+=a,t.#e+=a}catch(t){}return!0}static getHistorys(){const e=localStorage.getItem(t.#e);return e?JSON.parse(e):[]}static setHistorys(e){e&&localStorage.setItem(t.#e,JSON.stringify(e))}static getCategoryTab(){return localStorage.getItem(t.#t)}static setCategoryTab(e){e&&localStorage.setItem(t.#t,e)}}const e=e=>{const a=t.getHistorys(),o=a.indexOf(e);o>=0&&a.splice(o,1),a.unshift(e),a.length>20&&a.pop(),t.setHistorys(a)};$((function(){const a=(t,e,a)=>{const o=document.createElement(t);return e&&(o.className=e),a&&o.appendChild(document.createTextNode(a)),o};if(IssuesCatalogParam.selected_tags.length>0){const t=new Map;for(const e of IssuesCatalogParam.tags)t[e.id]=e;for(const e of IssuesCatalogParam.selected_tags)t[e.id]&&(t[e.id].select_count=e.select_count)}const o=new Map;for(const t of IssuesCatalogParam.tags)o[t.name]={allCount:t.count,selectCount:t.select_count,description:t.description,groups:t.groups};const s=()=>{const t=IssuesCatalogParam.select_filters.find((t=>"tags"==t[0]));return t&&t.length>=2?t[2]:[]},n=()=>{for(const t of document.querySelectorAll(".radio-select-mode"))if(t.checked)return t.value;return IssuesCatalogParam.select_mode};function c(t,e,s=!1){const c=n();return function(t,e){return((t,e,s,n=!1)=>{const c=document.createElement("a");if(c.href="#",n){const t=a("span","icon-only",IssuesCatalogParam.label_clear);t.classList.add("catalog-icon-clear-selected"),c.appendChild(t)}c.appendChild(document.createTextNode(t));const l=a("span","catalog-tag-label","");l.appendChild(c);const r=o[t];if(r){const t="and"===e?r.selectCount:r.allCount,o=a("span","tag-count",`(${t})`);if(o.dataset.allcount=r.allCount,o.dataset.selectedcount=r.selectCount,l.appendChild(o),0===t&&l.classList.add("catalog-count-zero"),r.description){const t=a("div","tag-tooltip","");t.appendChild(a("div","tag-description",r.description)),l.appendChild(t)}}if(n)return l;{const t=a(s,"tags","");return t.appendChild(l),t}})(t,c,e,s)}}const l=()=>{const e=$(".category-tab");e.on("click",(function(){$(".active-tab").removeClass("active-tab"),$(this).addClass("active-tab");const a=e.index(this);$(".category-content").removeClass("show-content").eq(a).addClass("show-content"),t.setCategoryTab($(this).attr("id"))}))};if($("#catalog-thubnails-btn1").on("click",(function(){$("table.catalog-issues td.id").show(),$("table.catalog-issues td.subject").show(),$("table.catalog-issues td.tags").show(),$(".pagination.top").show()})),$("#catalog-thubnails-btn2").on("click",(function(){$("table.catalog-issues td.id").show(),$("table.catalog-issues td.subject").show(),$("table.catalog-issues td.tags").hide(),$(".pagination.top").hide()})),$("#catalog-thubnails-btn3").on("click",(function(){$("table.catalog-issues td.id").hide(),$("table.catalog-issues td.subject").hide(),$("table.catalog-issues td.tags").hide(),$(".pagination.top").hide()})),(()=>{for(const t of document.querySelectorAll(".catalog-tag-label")){const e=t.querySelector("a")?.innerText;if(e){const s=o[e];if(s&&s.description){const e=a("div","tag-tooltip","");e.appendChild(a("div","tag-description",s.description)),t.appendChild(e)}}}})(),(()=>{const t=(t,o,s)=>{const n=a("input","radio-select-mode","");n.type="radio",n.name="select-mode",n.id=`radio-select-mode-${o}`,n.value=o,n.checked=e===o,t.appendChild(n);const c=a("label","label-select-mode",s);c.htmlFor=`radio-select-mode-${o}`,t.appendChild(c)},e=n(),l=c(),r=document.querySelector("#catalog_tags_selected"),i=s();if(r&&i.length>0){const e=a("div","selected-tags",""),s=[];for(let t=0;t<i.length;++t){t>0&&e.appendChild(a("span","","and"===IssuesCatalogParam.select_mode?" and ":" or ")),e.appendChild(l(i[t],"span",!0));const n=o[i[t]];if(n&&n.groups&&n.groups.length>0)for(const t of n.groups)s.includes(t)||s.push(t)}e.appendChild(a("span",""," : "));const n=a("a","",IssuesCatalogParam.label_clear_select);n.href=`${document.location.protocol}//${document.location.host}${document.location.pathname}`;const c=document.createElement("span");c.appendChild(n),e.appendChild(c),r.appendChild(e);const d=a("div","catalog-select-mode-operation","");if(t(d,"one",IssuesCatalogParam.label_operator_one),t(d,"and",IssuesCatalogParam.label_operator_and),t(d,"or",IssuesCatalogParam.label_operator_or),r.appendChild(d),s.length>0){r.appendChild(a("hr","catalog-separator",""));const t=a("div","catalog-selected-tag-groups","");t.appendChild(a("div","catalog-lavel-selected-tag-group",IssuesCatalogParam.label_selected_tag_group));for(const e of IssuesCatalogParam.tag_groups)for(const o of s){if(o!=e.id)continue;const s=a("fieldset","catalog-tag-group",""),n=document.createElement("legend");n.appendChild(document.createTextNode(e.name)),s.appendChild(n),s.appendChild(a("div","",e.description));for(const t of IssuesCatalogParam.tags)t.groups.includes(o)&&s.appendChild(l(t.name,"span"));t.appendChild(s)}r.appendChild(t)}}else{const t=document.querySelector("#catalog_btn_thumbnails");t&&(t.style.display="none")}const d=document.querySelector("div.catalog-always-selector");if(d)for(const t of IssuesCatalogParam.tags)t.categories.includes(IssuesCatalogParam.tag_categories[0].id)&&d.appendChild(l(t.name,"span"))})(),(()=>{const t=IssuesCatalogParam.tag_categories.length,e=c(),o=document.querySelector("ul.tabs-area");if(o)if(1===t){const t=a("li","category-tab",IssuesCatalogParam.label_tag_category_none);t.id="category-tab-none",t.classList.add("active-tab"),o.prepend(t)}else for(let e=t-1;e>0;--e){const t=a("li","category-tab",IssuesCatalogParam.tag_categories[e].name);t.id="category-tab-id"+(e-1),1===e&&t.classList.add("active-tab"),o.prepend(t)}const s=document.querySelector("div.contents-area");if(s)if(1===t){const t=a("ul","tags","");for(const a of IssuesCatalogParam.tags)t.appendChild(e(a.name,"ul"));const o=a("div","category-content","");o.appendChild(t),1===i&&o.classList.add("show-content"),s.prepend(o)}else for(let o=t-1;o>0;--o){const t=a("ul","category-tags",""),n=IssuesCatalogParam.tag_categories[o].id;for(const a of IssuesCatalogParam.tags)a.categories.includes(n)&&t.appendChild(e(a.name,"ul"));const c=a("div","category-content","");c.appendChild(a("p","",IssuesCatalogParam.tag_categories[o].description)),c.appendChild(t),1===o&&c.classList.add("show-content"),s.prepend(c)}})(),t.setupFromStorageOnLoad()){const e=c();(()=>{const e=t.getCategoryTab();if(!e)return;const a=$("#"+e);if(!a.length)return;$(".active-tab").removeClass("active-tab"),a.addClass("active-tab");const o=$(".category-tab").index(a);$(".category-content").removeClass("show-content").eq(o).addClass("show-content")})(),(e=>{const a=document.querySelector("#catalog-category-history");if(!a)return;const o=t.getHistorys();for(const t of o)a.appendChild(e(t,"ul"))})(e),l()}(()=>{const t=(t,e)=>{const a=document.createElement("input");return a.type="hidden",a.name=t,a.value=e,a};let a="";const o=$("body").attr("class").match(/project-([\w-]+)/);o&&(a=o[1]);const c=$("#catalog-input-search-tag");c.blur(),c.autocomplete({source:function(t,e){$.ajax({url:"/issue_tags/auto_complete/"+a,type:"GET",dataType:"json",data:{q:t.term},success:function(t){e(t)},error:function(t,a,o){e([""])}})},select:function(a,o){if(o.item&&o.item.value){const a=o.item.value,c=n(),l=s();l.includes(a)||l.push(a),e(a);const r=document.querySelector("#form-search-tag");if(r){switch(r.appendChild(t("sm",c)),r.appendChild(t("f[]","tags")),c){default:case"one":r.appendChild(t("op[tags]","=")),r.appendChild(t("v[tags][]",a));break;case"and":r.appendChild(t("op[tags]","and")),l.forEach((e=>r.appendChild(t("v[tags][]",e))));break;case"or":r.appendChild(t("op[tags]","=")),l.forEach((e=>r.appendChild(t("v[tags][]",e))))}r.submit()}}},minLength:1})})(),(()=>{const t=document.querySelector("#btn-scroll-to-top");t&&(t.addEventListener("click",(function(){window.scroll({top:0,behavior:"smooth"})})),window.addEventListener("scroll",(function(){window.pageYOffset>300?t.style.opacity="1":window.pageYOffset<300&&(t.style.opacity="0")})))})(),(()=>{const t=t=>{const e=[["set_filter","1"],["sort","priority:desc"],["sm",t],["f[]","tags"]];return IssuesCatalogParam.issues_open_only&&(e.push(["f[]","status_id"]),e.push(["op[status_id]","o"]),e.push(["v[status_id][]",""])),e};for(const t of document.querySelectorAll(".radio-select-mode"))t.addEventListener("click",(function(t){const e=this.value;for(const t of document.querySelectorAll(".catalog-tag-label .tag-count")){const a="and"===e?t.dataset.selectedcount:t.dataset.allcount;t.innerText=`(${a})`,"0"===a?t.parentElement.classList.add("catalog-count-zero"):t.parentElement.classList.remove("catalog-count-zero")}for(const t of document.querySelectorAll(".pagination a")){const a=(t.search?t.search.slice(1).split("&"):[]).map((t=>{const[a,o]=t.split("="),s=decodeURIComponent(a);let n=decodeURIComponent(o);return"sm"===s?n=e:"op[tags]"===s&&(n="and"===e?"and":"="),[s,n]}));t.search="?"+a.map((t=>`${encodeURIComponent(t[0])}=${encodeURIComponent(t[1])}`)).join("&")}}));for(const a of document.querySelectorAll(".tags a"))a.addEventListener("click",(function(a){const o=n(),c=this.innerText,l=t(o),r=s();switch(r.includes(c)||r.push(c),e(c),o){default:case"one":l.push(["op[tags]","="]),l.push(["v[tags][]",c]);break;case"and":l.push(["op[tags]","and"]),r.forEach((t=>l.push(["v[tags][]",t])));break;case"or":l.push(["op[tags]","="]),r.forEach((t=>l.push(["v[tags][]",t])))}this.search="?"+l.map((t=>`${encodeURIComponent(t[0])}=${encodeURIComponent(t[1])}`)).join("&")}));for(const e of document.querySelectorAll(".selected-tags .catalog-tag-label a"))e.addEventListener("click",(function(e){const a=n();let o=this.innerText;o.startsWith(IssuesCatalogParam.label_clear)&&(o=o.slice(IssuesCatalogParam.label_clear.length));const c=s().filter((t=>t!==o));if(0===c.length)this.search="",this.href.endsWith("#")&&(this.href=this.href.slice(0,-1));else{const e=t(a);e.push(["op[tags]","and"===a?"and":"="]),c.forEach((t=>e.push(["v[tags][]",t]))),this.search="?"+e.map((t=>`${encodeURIComponent(t[0])}=${encodeURIComponent(t[1])}`)).join("&")}}))})();const r=document.querySelector("#quick-search form");r&&(r.style.display="none")}))})();