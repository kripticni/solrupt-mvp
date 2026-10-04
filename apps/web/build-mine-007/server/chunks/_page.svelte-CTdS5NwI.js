import { as as store_get, at as unsubscribe_stores } from './index-DxdwV7NI.js';
import { p as page } from './stores-Vy4Dk-ny.js';
import './escaping-CqgfEcN3.js';
import './root-H6y-nOUr.js';
import './state.svelte-CQQc5AvK.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.nickname;
    {
      $$renderer2.push(`<!--[-1--><div class="skeleton"><p>Loading profile…</p></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CTdS5NwI.js.map
