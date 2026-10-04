import { as as store_get, aq as ensure_array_like, at as unsubscribe_stores, a7 as derived } from './index-DxdwV7NI.js';
import { p as page } from './stores-Vy4Dk-ny.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';
import './root-H6y-nOUr.js';
import './state.svelte-CQQc5AvK.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.hash;
    let board = { entries: [] };
    const solverNickname = derived(() => {
      return null;
    });
    const roomsSolved = derived(() => solverNickname() ? board.entries.find((e) => e.nickname === solverNickname())?.rooms ?? [] : []);
    $$renderer2.push(`<h1>Proof</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <section><h2>Solver progress</h2> <p class="muted">Read-only summary of recorded work. Points track practice progress only.</p> `);
    if (solverNickname()) {
      $$renderer2.push(`<!--[0--><p>Solver: ${escape_html(solverNickname())}</p> `);
      if (roomsSolved().length > 0) {
        $$renderer2.push(`<!--[0--><p>Rooms with recorded work:</p> <ul><!--[-->`);
        const each_array = ensure_array_like(roomsSolved());
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let room = each_array[$$index];
          $$renderer2.push(`<li>${escape_html(room)}</li>`);
        }
        $$renderer2.push(`<!--]--></ul>`);
      } else {
        $$renderer2.push(`<!--[-1--><p class="muted">No recorded solves yet.</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push(`<!--[-1--><p class="muted">Solver details appear with the proof record.</p>`);
    }
    $$renderer2.push(`<!--]--></section> <section><h2>Next steps</h2> <p>Existing places to keep practicing with real code:</p> <ul><li><a href="https://codehawks.cyfrin.io/">First Flights (CodeHawks)</a></li> <li><a href="https://earn.superteam.fun/">Superteam Earn</a></li> <li><a href="https://immunefi.com/explore/">Immunefi Solana filter</a></li> <li><a href="https://cantina.xyz/">Cantina</a></li></ul></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BXOLdtXp.js.map
