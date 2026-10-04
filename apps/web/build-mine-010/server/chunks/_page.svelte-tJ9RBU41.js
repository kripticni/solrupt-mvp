import { ao as attr } from './index-MANu6bg9.js';
import { h as html } from './html-FW6Ia4bL.js';
import { Q as Quiz, L as LessonNav } from './LessonNav-D_XrqT2Z.js';
import './escaping-CqgfEcN3.js';

function _05_data_matching_md($$renderer) {
  $$renderer.push(`<h1>Lesson 105: the right signature on the wrong vault (5 min)</h1> <h2>Two questions, not one</h2> <p>Lesson 101 taught the first question every instruction must answer: WHO signed?
This room teaches the second: WHAT did they sign for? A valid signature on the
wrong account is worth exactly as much as no signature — nothing. The program
below verifies somebody signed and that funds exist, but never checks the
link between the two facts.</p> <p><em>Diagram: Bob’s signature plus Alice’s vault. Each fact checks out alone; without the link, the pair is still theft.</em></p> <h2>The bug</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token comment">// VULNERABLE: signer verified, relationship absent</span>
<span class="token keyword">pub</span> vault<span class="token punctuation">:</span> <span class="token class-name">Account</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token punctuation">,</span> <span class="token class-name">Vault</span><span class="token operator">></span><span class="token punctuation">,</span>   <span class="token comment">// ANY vault — no has_one, no seeds</span>
<span class="token keyword">pub</span> authority<span class="token punctuation">:</span> <span class="token class-name">Signer</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token operator">></span><span class="token punctuation">,</span>       <span class="token comment">// ANY signer — valid, but whose?</span></code>`)}</pre> <p>Bob signs his own transaction and passes Alice’s vault. Signature: valid.
Balance: sufficient. Relationship: never asked about. Alice’s units move to
Bob. Cashio lost about $48M to this class of bug: fake collateral accounts
no one verified, real tokens minted against nothing.</p> <h2>The fix (one attribute)</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token attribute attr-name">#[account(mut, has_one = authority)]</span>
<span class="token keyword">pub</span> vault<span class="token punctuation">:</span> <span class="token class-name">Account</span><span class="token operator">&lt;</span><span class="token lifetime-annotation symbol">'info</span><span class="token punctuation">,</span> <span class="token class-name">Vault</span><span class="token operator">></span><span class="token punctuation">,</span></code>`)}</pre> <p><code>has_one</code> generates <code>vault.authority == authority.key()</code> and runs it before
the body — Bob’s signature on Alice’s vault fails validation. Answer both
questions every time: <code>Signer</code> for WHO, <code>has_one</code>/<code>constraint</code> for WHAT FOR.
Your turn: drain with a stranger’s signature and watch the balance move, then
run the same bytes at the secure instruction and watch it refuse.</p>`);
}
const diagram = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMjUwIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlZhbGlkIHNpZ25hdHVyZSB3cm9uZyB2YXVsdCI+CiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjYyNCIgaGVpZ2h0PSIyMzQiIHJ4PSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI5NDllIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIyNCIgeT0iMzYiIGZpbGw9IiNlNmVkZjMiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTUiPlRXTyBUUlVFIEZBQ1RTLCBOTyBMSU5LPC90ZXh0PgogIDxnIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTMiPgogICAgPHJlY3QgeD0iMjQiIHk9IjUyIiB3aWR0aD0iMjcwIiBoZWlnaHQ9IjU2IiByeD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2ZiOTUwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPHRleHQgeD0iMzQiIHk9Ijc0IiBmaWxsPSIjM2ZiOTUwIj5mYWN0IDE6IEJvYiBzaWduZWQgKHZhbGlkKTwvdGV4dD4KICAgIDx0ZXh0IHg9IjM0IiB5PSI5NCIgZmlsbD0iIzhiOTQ5ZSI+aXNfc2lnbmVyID09IHRydWU8L3RleHQ+CiAgICA8cmVjdCB4PSIyNCIgeT0iMTE2IiB3aWR0aD0iMjcwIiBoZWlnaHQ9IjU2IiByeD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2ZiOTUwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPHRleHQgeD0iMzQiIHk9IjEzOCIgZmlsbD0iIzNmYjk1MCI+ZmFjdCAyOiB2YXVsdCBmdW5kZWQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzNCIgeT0iMTU4IiBmaWxsPSIjOGI5NDllIj5iYWxhbmNlIDEwMCAoQWxpY2Uncyk8L3RleHQ+CiAgICA8cmVjdCB4PSIzMzAiIHk9IjUyIiB3aWR0aD0iMjg2IiBoZWlnaHQ9IjEyMCIgcng9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y4NTE0OSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSIzNDAiIHk9Ijc2IiBmaWxsPSIjZjg1MTQ5Ij5taXNzaW5nOiB0aGUgbGluazwvdGV4dD4KICAgIDx0ZXh0IHg9IjM0MCIgeT0iOTgiIGZpbGw9IiM4Yjk0OWUiPnZhdWx0LmF1dGhvcml0eSA9PSBzaWduZXI/PC90ZXh0PgogICAgPHRleHQgeD0iMzQwIiB5PSIxMjAiIGZpbGw9IiM4Yjk0OWUiPm5ldmVyIGFza2VkIC0tJmd0OyBkcmFpbnM8L3RleHQ+CiAgICA8dGV4dCB4PSIzNDAiIHk9IjE0MiIgZmlsbD0iIzNmYjk1MCI+aGFzX29uZSBhc2tzIHByZS1ib2R5PC90ZXh0PgogICAgPHRleHQgeD0iMzQwIiB5PSIxNjIiIGZpbGw9IiM4Yjk0OWUiPi0tJmd0OyByZWZ1c2VkPC90ZXh0PgogIDwvZz4KICA8dGV4dCB4PSIyNCIgeT0iMTk2IiBmaWxsPSIjZTZlZGYzIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIj5jYXB0aW9uOiBlYWNoIGZhY3QgY2hlY2tzIG91dCBhbG9uZTsgd2l0aG91dCB0aGUgbGluayB0aGUgcGFpciBpcyBzdGlsbCB0aGVmdC48L3RleHQ+Cjwvc3ZnPgo=";
function _page($$renderer) {
  _05_data_matching_md($$renderer);
  $$renderer.push(`<!----> <img${attr("src", diagram)} alt="Valid signature, wrong vault"/> `);
  Quiz($$renderer, { quiz: "quiz-105" });
  $$renderer.push(`<!----> <a class="btn" href="/rooms/l5-match">Open the room</a> `);
  LessonNav($$renderer, {
    prev: { href: "/learn/104", label: "Lesson 104" },
    next: { href: "/learn/106", label: "Lesson 106" }
  });
  $$renderer.push(`<!---->`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-tJ9RBU41.js.map
