import { at as store_get, au as unsubscribe_stores } from './index-MANu6bg9.js';
import { p as page } from './stores-C0S8sGbV.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';
import './root-f2T38pft.js';
import './state.svelte-B2YL251E.js';

new Set(
  "use pub mod fn let mut struct enum impl trait return if else match for in while loop where crate super self Self const static ref move async await dyn Result Ok Err Option Some None true false as break continue Require require msg".split(
    " "
  )
);
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.id;
    let loadSecs = 0;
    function fmtElapsed(s) {
      return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }
    {
      $$renderer2.push(`<!--[-1--><div class="loading-line">Spawning session… ${escape_html(fmtElapsed(loadSecs))}</div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BI6t7nRP.js.map
