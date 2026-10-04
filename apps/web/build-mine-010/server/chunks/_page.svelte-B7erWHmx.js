import { ao as attr } from './index-MANu6bg9.js';
import { h as html } from './html-FW6Ia4bL.js';
import { Q as Quiz, L as LessonNav } from './LessonNav-D_XrqT2Z.js';
import './escaping-CqgfEcN3.js';

function _04_type_cosplay_md($$renderer) {
  $$renderer.push(`<h1>Lesson 104: type cosplay, or the right bytes in the wrong costume (5 min)</h1> <h2>Same bytes, different meaning</h2> <p>A <code>User</code> account holds <code>authority: Pubkey</code> in its first 32 bytes. A <code>Note</code> account holds <code>account: Pubkey</code> in its first 32 bytes. Read the bytes alone
and the two are indistinguishable: same length, same offsets, same key in the
same slot. The ONLY thing telling them apart is the 8-byte discriminator
Anchor prepends: <code>sha256("account:User")</code> versus <code>sha256("account:Note")</code>.</p> <p><em>Diagram: identical layouts, different discriminators — the first 8 bytes are the whole difference.</em></p> <h2>The bug</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token comment">// VULNERABLE: bytes read, type never asked</span>
<span class="token keyword">let</span> data <span class="token operator">=</span> ctx<span class="token punctuation">.</span>accounts<span class="token punctuation">.</span>user<span class="token punctuation">.</span><span class="token function">try_borrow_data</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span>
<span class="token keyword">let</span> stored_authority <span class="token operator">=</span> <span class="token class-name">Pubkey</span><span class="token punctuation">::</span><span class="token function">new_from_array</span><span class="token punctuation">(</span>data<span class="token punctuation">[</span><span class="token number">8</span><span class="token punctuation">..</span><span class="token number">40</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">try_into</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unwrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property">require!</span><span class="token punctuation">(</span>stored_authority <span class="token operator">==</span> ctx<span class="token punctuation">.</span>accounts<span class="token punctuation">.</span>authority<span class="token punctuation">.</span><span class="token function">key</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token class-name">Unauthorized</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code>`)}</pre> <p>The attacker registers a <code>Note</code> pointing at themselves and passes it where a <code>User</code> belongs. Bytes 8..40 hold the attacker’s key, the equality check
passes, and the ledger records a claim for a user that never existed. No
incident one-liner here: cosplay has no single canonical hack. It is a
hygiene class auditors check on every program — which is exactly why this
room pays the most points in the gym.</p> <h2>The fix (let the type do the asking)</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token keyword">pub</span> user<span class="token punctuation">:</span> <span class="token class-name">Account</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token punctuation">,</span> <span class="token class-name">User</span><span class="token operator">></span><span class="token punctuation">,</span></code>`)}</pre> <p><code>Account&lt;User></code> verifies discriminator plus owner plus shape before the body
runs — a <code>Note</code> fails at the door. Never parse account bytes by hand: a
manual parse without a discriminator compare is cosplay waiting for an
audience. Your turn: claim in costume and watch the ledger move, then run the
same shape at the secure instruction and watch it refuse.</p>`);
}
const diagram = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMjUwIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlR5cGUgY29zcGxheSBkaXNjcmltaW5hdG9yIj4KICA8cmVjdCB4PSI4IiB5PSI4IiB3aWR0aD0iNjI0IiBoZWlnaHQ9IjIzNCIgcng9IjEwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4Yjk0OWUiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjI0IiB5PSIzNiIgZmlsbD0iI2U2ZWRmMyIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNSI+U0FNRSBCWVRFUywgRElGRkVSRU5UIENPU1RVTUU8L3RleHQ+CiAgPGcgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMyI+CiAgICA8cmVjdCB4PSIyNCIgeT0iNTIiIHdpZHRoPSIyODAiIGhlaWdodD0iNzAiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiM1OGE2ZmYiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8dGV4dCB4PSIzNCIgeT0iNzQiIGZpbGw9IiM1OGE2ZmYiPlVzZXIgYWNjb3VudDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM0IiB5PSI5NCIgZmlsbD0iIzhiOTQ5ZSI+W2Rpc2M6IGFiMTIuLl1bYXV0aG9yaXR5OiBZT1VdPC90ZXh0PgogICAgPHRleHQgeD0iMzQiIHk9IjExMiIgZmlsbD0iIzhiOTQ5ZSI+c2hhMjU2KCJhY2NvdW50OlVzZXIiKTwvdGV4dD4KICAgIDxyZWN0IHg9IjMzNiIgeT0iNTIiIHdpZHRoPSIyODAiIGhlaWdodD0iNzAiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiNkMjk5MjIiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8dGV4dCB4PSIzNDYiIHk9Ijc0IiBmaWxsPSIjZDI5OTIyIj5Ob3RlIGFjY291bnQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzNDYiIHk9Ijk0IiBmaWxsPSIjOGI5NDllIj5bZGlzYzogMzRjZC4uXVthY2NvdW50OiBZT1VdPC90ZXh0PgogICAgPHRleHQgeD0iMzQ2IiB5PSIxMTIiIGZpbGw9IiM4Yjk0OWUiPnNoYTI1NigiYWNjb3VudDpOb3RlIik8L3RleHQ+CiAgICA8dGV4dCB4PSIyNzAiIHk9IjE1MCIgZmlsbD0iI2U2ZWRmMyIgZm9udC1zaXplPSIxMyI+Ynl0ZXMgOC4uNDA6IGlkZW50aWNhbDwvdGV4dD4KICAgIDxyZWN0IHg9IjI0IiB5PSIxNjAiIHdpZHRoPSI1OTIiIGhlaWdodD0iNTYiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiNmODUxNDkiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPHRleHQgeD0iMzQiIHk9IjE4NCIgZmlsbD0iI2Y4NTE0OSI+bWFudWFsIHBhcnNlIHJlYWRzIDguLjQwLCBuZXZlciBjb21wYXJlcyBkaXNjcyAtLSZndDsgY29zdHVtZSBmaXRzPC90ZXh0PgogICAgPHRleHQgeD0iMzQiIHk9IjIwNCIgZmlsbD0iIzNmYjk1MCI+QWNjb3VudCZsdDtVc2VyJmd0OyBjb21wYXJlcyBkaXNjcyBwcmUtYm9keSAtLSZndDsgY29zdHVtZSByZWZ1c2VkPC90ZXh0PgogIDwvZz4KPC9zdmc+Cg==";
function _page($$renderer) {
  _04_type_cosplay_md($$renderer);
  $$renderer.push(`<!----> <img${attr("src", diagram)} alt="Same bytes, different costume"/> `);
  Quiz($$renderer, { quiz: "quiz-104" });
  $$renderer.push(`<!----> <a class="btn" href="/rooms/l4-cosplay">Open the room</a> `);
  LessonNav($$renderer, {
    prev: { href: "/learn/103", label: "Lesson 103" },
    next: { href: "/learn/105", label: "Lesson 105" }
  });
  $$renderer.push(`<!---->`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B7erWHmx.js.map
