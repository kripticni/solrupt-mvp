import { ar as ensure_array_like, ao as attr } from './index-MANu6bg9.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let board = { entries: [], first_solvers: [] };
    $$renderer2.push(`<h1>Board</h1> <p class="muted">Practice progress only. Never a hiring signal.</p> <ol class="board-rows">`);
    const each_array = ensure_array_like(board.entries);
    if (each_array.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let e = each_array[i];
        $$renderer2.push(`<li><span class="rank">${escape_html(String(i + 1).padStart(2, "0"))}</span> <a${attr("href", `/profile/${encodeURIComponent(e.nickname)}`)}><strong>${escape_html(e.nickname)}</strong></a> · ${escape_html(e.points)} pts · ${escape_html((e.rooms ?? []).length)} rooms</li>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ol> <h2>First solvers</h2> <ul>`);
    const each_array_1 = ensure_array_like(board.first_solvers);
    if (each_array_1.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let f = each_array_1[$$index_1];
        $$renderer2.push(`<li>${escape_html(f.room)}: <a${attr("href", `/profile/${encodeURIComponent(f.nickname)}`)}>${escape_html(f.nickname)}</a></li>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ul>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Cws9SAFa.js.map
