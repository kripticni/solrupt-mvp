import { at as store_get, au as unsubscribe_stores } from './index-MANu6bg9.js';
import { p as page } from './stores-C0S8sGbV.js';
import './escaping-CqgfEcN3.js';
import './root-f2T38pft.js';
import './state.svelte-B2YL251E.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.nickname ?? "";
    {
      $$renderer2.push(`<!--[-1--><div class="skeleton"><p>Loading profile…</p></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BgXjkoJD.js.map
