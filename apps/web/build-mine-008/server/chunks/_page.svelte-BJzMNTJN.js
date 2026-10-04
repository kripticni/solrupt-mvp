import { an as attr } from './index-DxdwV7NI.js';
import { h as html } from './html-FW6Ia4bL.js';
import { Q as Quiz, L as LessonNav } from './LessonNav-DOIaH1t6.js';
import './escaping-CqgfEcN3.js';

function _06_vault_capstone_md($$renderer) {
  $$renderer.push(`<h1>Lesson 106: vault raid capstone — no training wheels (5 min)</h1> <h2>Challenge rooms are a different game</h2> <p>Walkthrough rooms teach one check at a time. Challenge rooms test whether the
checks compose in your head: this vault’s withdraw holds a vault and a caller
and asks NOTHING about either. No signer, no compare, no relationship. Spot
which lines are missing, not which lines are wrong. One transaction, 100%
drained, remainder zero — or the verifier fails you.</p> <p><em>Diagram: the door that was never built. Lessons 101 and 105, missing at once.</em></p> <h2>The bug (all of them)</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token comment">// VULNERABLE: the authority is never even read</span>
<span class="token keyword">pub</span> vault<span class="token punctuation">:</span> <span class="token class-name">Account</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token punctuation">,</span> <span class="token class-name">Vault</span><span class="token operator">></span><span class="token punctuation">,</span>
<span class="token keyword">pub</span> caller<span class="token punctuation">:</span> <span class="token class-name">AccountInfo</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token operator">></span><span class="token punctuation">,</span>   <span class="token comment">// decoration — passed, never questioned</span></code>`)}</pre> <p>Name any vault, take everything. The fix you already know, twice over: <code>Signer</code> for consent (101) plus the equality bind for ownership (105).
The secure instruction carries both.</p> <h2>Before you raid</h2> <p>Answer the check below, then open the room. Partial drains fail on purpose:
the capstone demands the full balance in a single run, with nobody’s
signature but yours on it. When it passes, write the finding: severity
Critical, proof in two sentences, fix in one.</p>`);
}
const diagram = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMjUwIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlZhdWx0IHJhaWQgY2Fwc3RvbmUiPgogIDxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI2MjQiIGhlaWdodD0iMjM0IiByeD0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhiOTQ5ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHRleHQgeD0iMjQiIHk9IjM2IiBmaWxsPSIjZTZlZGYzIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE1Ij5USEUgRE9PUiBUSEFUIFdBUyBORVZFUiBCVUlMVDwvdGV4dD4KICA8ZyBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEzIj4KICAgIDxyZWN0IHg9IjI0IiB5PSI1MiIgd2lkdGg9IjI3MCIgaGVpZ2h0PSI2NiIgcng9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhiOTQ5ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjUgNCIvPgogICAgPHRleHQgeD0iMzQiIHk9Ijc2IiBmaWxsPSIjOGI5NDllIj4xMDE6IHNpZ25lcj8gIC0tICBhYnNlbnQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzNCIgeT0iOTgiIGZpbGw9IiM4Yjk0OWUiPmNhbGxlciBpcyBBY2NvdW50SW5mbzwvdGV4dD4KICAgIDxyZWN0IHg9IjI0IiB5PSIxMjYiIHdpZHRoPSIyNzAiIGhlaWdodD0iNjYiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiM4Yjk0OWUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSI1IDQiLz4KICAgIDx0ZXh0IHg9IjM0IiB5PSIxNTAiIGZpbGw9IiM4Yjk0OWUiPjEwNTogYmluZGluZz8gLS0gYWJzZW50PC90ZXh0PgogICAgPHRleHQgeD0iMzQiIHk9IjE3MiIgZmlsbD0iIzhiOTQ5ZSI+bm8gY29tcGFyZSwgbm8gaGFzX29uZTwvdGV4dD4KICAgIDx0ZXh0IHg9IjMwNiIgeT0iMTMwIiBmaWxsPSIjZTZlZGYzIiBmb250LXNpemU9IjE4Ij4tLSZndDs8L3RleHQ+CiAgICA8cmVjdCB4PSIzMzYiIHk9IjUyIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE0MCIgcng9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y4NTE0OSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSIzNDYiIHk9Ijc4IiBmaWxsPSIjZjg1MTQ5Ij5yYWlkOiBvbmUgdHgsIDEwMCU8L3RleHQ+CiAgICA8dGV4dCB4PSIzNDYiIHk9IjEwMCIgZmlsbD0iI2U2ZWRmMyI+bmFtZSBhbnkgdmF1bHQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzNDYiIHk9IjEyMiIgZmlsbD0iI2U2ZWRmMyI+dGFrZSBldmVyeXRoaW5nPC90ZXh0PgogICAgPHRleHQgeD0iMzQ2IiB5PSIxNDQiIGZpbGw9IiM4Yjk0OWUiPnJlbWFpbmRlciAwIG9yIGZhaWw8L3RleHQ+CiAgICA8dGV4dCB4PSIzNDYiIHk9IjE3MiIgZmlsbD0iIzNmYjk1MCI+c2VjdXJlOiBTaWduZXIgKyA9PTwvdGV4dD4KICA8L2c+Cjwvc3ZnPgo=";
function _page($$renderer) {
  _06_vault_capstone_md($$renderer);
  $$renderer.push(`<!----> <img${attr("src", diagram)} alt="The door that was never built"/> `);
  Quiz($$renderer, { quiz: "quiz-106" });
  $$renderer.push(`<!----> <a class="btn" href="/rooms/l6-vault">Open the room</a> `);
  LessonNav($$renderer, {
    prev: { href: "/learn/105", label: "Lesson 105" },
    next: { href: "/learn/107", label: "Lesson 107" }
  });
  $$renderer.push(`<!---->`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BJzMNTJN.js.map
