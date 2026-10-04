import { as as store_get, at as unsubscribe_stores } from './index-DxdwV7NI.js';
import { p as page } from './stores-Vy4Dk-ny.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';
import './root-H6y-nOUr.js';
import './state.svelte-CQQc5AvK.js';

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
//# sourceMappingURL=_page.svelte-PeTzsTUg.js.map
