import { an as attr } from './index-DxdwV7NI.js';
import { h as html } from './html-FW6Ia4bL.js';
import { Q as Quiz, L as LessonNav } from './LessonNav-DOIaH1t6.js';
import './escaping-CqgfEcN3.js';

function _02_owner_pda_md($$renderer) {
  $$renderer.push(`<h1>Lesson 102: owner, PDA, and the fake account (5 min)</h1> <h2>Who owns this account?</h2> <p>Every account has an <code>owner</code> field: the only program allowed to write its data.
Anyone can <em>create</em> an account and write <em>anything</em> into it. The owner field
says who is responsible for the bytes — not that the bytes are true.</p> <h2>The bug</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token keyword">let</span> data <span class="token operator">=</span> ctx<span class="token punctuation">.</span>accounts<span class="token punctuation">.</span>token_account<span class="token punctuation">.</span><span class="token function">try_borrow_data</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span> <span class="token comment">// nobody asked: owned by whom?</span>
<span class="token keyword">let</span> balance <span class="token operator">=</span> <span class="token keyword">u64</span><span class="token punctuation">::</span><span class="token function">from_le_bytes</span><span class="token punctuation">(</span>data<span class="token punctuation">[</span><span class="token number">64</span><span class="token punctuation">..</span><span class="token number">72</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">try_into</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unwrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code>`)}</pre> <p>The program parses bytes 64–72 as a token balance without checking the account
is owned by the Token program. The attacker hands it a System-owned account
with <code>1_000_000</code> written at exactly those offsets: fake collateral, real loan.</p> <h2>PDAs: the same idea, one level up</h2> <p>A PDA (program-derived address) is an address your program <em>must</em> own: derived
from seeds + bump, with no private key. <code>seeds = [b"vault", authority]</code> plus the
canonical bump means only your program can sign for it. Skip the bump check and
attackers grind a different bump to a colliding address.</p> <p><em>Diagram: seeds plus the stored bump produce the one address your program can sign for.</em></p> <h2>The fix</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token keyword">pub</span> token_account<span class="token punctuation">:</span> <span class="token class-name">Account</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token punctuation">,</span> <span class="token class-name">TokenAccount</span><span class="token operator">></span><span class="token punctuation">,</span></code>`)}</pre> <p><code>Account&lt;T></code> verifies owner + deserialization + discriminator before your code
runs. Your turn: open the room, approve the fake loan, then run the same shape
at both secure variants and watch them refuse.</p>`);
}
const pda = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMjQwIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlBEQSBzZWVkcyBhbmQgYnVtcCI+CiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjYyNCIgaGVpZ2h0PSIyMjQiIHJ4PSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI5NDllIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIyNCIgeT0iMzYiIGZpbGw9IiNlNmVkZjMiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTUiPlBEQTogQU4gQUREUkVTUyBXSVRIIE5PIFBSSVZBVEUgS0VZPC90ZXh0PgogIDxnIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTMiPgogICAgPHJlY3QgeD0iMjQiIHk9IjUyIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjUyIiByeD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNThhNmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPHRleHQgeD0iMzQiIHk9Ijc0IiBmaWxsPSIjNThhNmZmIj5zZWVkczwvdGV4dD4KICAgIDx0ZXh0IHg9IjM0IiB5PSI5NCIgZmlsbD0iIzhiOTQ5ZSI+W3ZhdWx0LCBhdXRob3JpdHldPC90ZXh0PgogICAgPHRleHQgeD0iMjE0IiB5PSI4NCIgZmlsbD0iI2U2ZWRmMyIgZm9udC1zaXplPSIxOCI+KzwvdGV4dD4KICAgIDxyZWN0IHg9IjI0NCIgeT0iNTIiIHdpZHRoPSIxNzAiIGhlaWdodD0iNTIiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiNkMjk5MjIiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPHRleHQgeD0iMjU0IiB5PSI3NCIgZmlsbD0iI2QyOTkyMiI+YnVtcCAoc3RvcmVkKTwvdGV4dD4KICAgIDx0ZXh0IHg9IjI1NCIgeT0iOTQiIGZpbGw9IiM4Yjk0OWUiPmNhbm9uaWNhbCwgb24tY2hhaW48L3RleHQ+CiAgICA8dGV4dCB4PSI0MjQiIHk9Ijg0IiBmaWxsPSIjZTZlZGYzIiBmb250LXNpemU9IjE4Ij4tLSZndDs8L3RleHQ+CiAgICA8cmVjdCB4PSI0NTQiIHk9IjUyIiB3aWR0aD0iMTYyIiBoZWlnaHQ9IjUyIiByeD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2ZiOTUwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPHRleHQgeD0iNDY0IiB5PSI3NCIgZmlsbD0iIzNmYjk1MCI+UERBIGFkZHJlc3M8L3RleHQ+CiAgICA8dGV4dCB4PSI0NjQiIHk9Ijk0IiBmaWxsPSIjOGI5NDllIj5vbmx5IHByb2dyYW0gc2lnbnM8L3RleHQ+CiAgICA8cmVjdCB4PSIyNCIgeT0iMTIwIiB3aWR0aD0iNTkyIiBoZWlnaHQ9IjUyIiByeD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjg1MTQ5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iNSA0Ii8+CiAgICA8dGV4dCB4PSIzNCIgeT0iMTQyIiBmaWxsPSIjZjg1MTQ5Ij5jYWxsZXItc3VwcGxpZWQgYnVtcCAtLSZndDsgZ3JvdW5kIHRvIGEgY29sbGlkaW5nIGFkZHJlc3MgKGJvdW5jZXMgb2ZmKTwvdGV4dD4KICAgIDx0ZXh0IHg9IjM0IiB5PSIxNjIiIGZpbGw9IiM4Yjk0OWUiPm5ldmVyIGFjY2VwdCBidW1wIGFzIGluc3RydWN0aW9uIGlucHV0PC90ZXh0PgogIDwvZz4KICA8dGV4dCB4PSIyNCIgeT0iMTk2IiBmaWxsPSIjZTZlZGYzIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIj5jYXB0aW9uOiB0aGUgc3RvcmVkIGNhbm9uaWNhbCBidW1wIGlzIHRoZSBvbmx5IGFkZHJlc3MgdGhlIHByb2dyYW0gY2FuIHNpZ24gZm9yLjwvdGV4dD4KPC9zdmc+Cg==";
function _page($$renderer) {
  _02_owner_pda_md($$renderer);
  $$renderer.push(`<!----> <img${attr("src", pda)} alt="PDA seeds and bump"/> `);
  Quiz($$renderer, { quiz: "quiz-102" });
  $$renderer.push(`<!----> <a class="btn" href="/rooms/l2-owner">Open the room</a> `);
  LessonNav($$renderer, {
    prev: { href: "/learn/101", label: "Lesson 101" },
    next: { href: "/learn/103", label: "Lesson 103" }
  });
  $$renderer.push(`<!---->`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DVp74vK8.js.map
