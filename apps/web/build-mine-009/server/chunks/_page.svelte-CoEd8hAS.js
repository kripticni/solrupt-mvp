import { ao as attr, ar as ensure_array_like, a7 as derived } from './index-MANu6bg9.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = { rooms: [] };
    const easy = derived(() => data.rooms?.filter((r) => r.tier === "Easy") ?? []);
    $$renderer2.push(`<h1>Rooms</h1> <p class="muted">Seven live rooms, Easy to Hard. Every exploit runs against a real program. Pass, then write the finding to score.</p> `);
    if (easy().length > 0) {
      $$renderer2.push(`<!--[0--><div class="panel"><h3><a${attr("href", `/rooms/${easy()[0].id}`)}>${escape_html(easy()[0].title)}</a></h3> <p><span class="badge">Easy</span> <span class="badge">${escape_html(easy()[0].points)} pts</span> `);
      if (easy()[0].live) {
        $$renderer2.push(`<!--[0--><span class="badge">● LIVE</span>`);
      } else {
        $$renderer2.push(`<!--[-1--><span class="badge">Stub</span>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (easy()[0].solved) {
        $$renderer2.push(`<!--[0--><span class="badge">solved</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></p> <p class="muted">Start here.</p> `);
      if (!easy()[0].live) {
        $$renderer2.push(`<!--[0--><p class="muted">Locked: program building.</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(["Easy", "Medium", "Hard"]);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let tier = each_array[$$index_1];
      const rest = tier === "Easy" ? easy().slice(1) : data.rooms?.filter((r) => r.tier === tier) ?? [];
      if (rest.length > 0) {
        $$renderer2.push(`<!--[0--><h2>${escape_html(tier)}</h2> <div class="cards"><!--[-->`);
        const each_array_1 = ensure_array_like(rest);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let room = each_array_1[$$index];
          $$renderer2.push(`<div class="panel">`);
          if (room.live) {
            $$renderer2.push(`<!--[0--><h3><a${attr("href", `/rooms/${room.id}`)}>${escape_html(room.title)}</a></h3> <p><span class="badge">${escape_html(room.tier)}</span> <span class="badge">${escape_html(room.points)} pts</span> <span class="badge">● LIVE</span> `);
            if (room.solved) {
              $$renderer2.push(`<!--[0--><span class="badge">solved</span>`);
            } else {
              $$renderer2.push("<!--[-1-->");
            }
            $$renderer2.push(`<!--]--></p>`);
          } else {
            $$renderer2.push(`<!--[-1--><h3>${escape_html(room.title)}</h3> <p class="muted">${escape_html(room.points)} pts · locked: program building</p>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CoEd8hAS.js.map
