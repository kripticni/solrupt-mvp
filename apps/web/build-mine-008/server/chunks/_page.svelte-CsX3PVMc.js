import { an as attr } from './index-DxdwV7NI.js';
import { h as html } from './html-FW6Ia4bL.js';
import { Q as Quiz, L as LessonNav } from './LessonNav-DOIaH1t6.js';
import './escaping-CqgfEcN3.js';

function _07_overflow_math_md($$renderer) {
  $$renderer.push(`<h1>Lesson 107: when subtraction adds a fortune (5 min)</h1> <h2>Debug panics, release wraps</h2> <p>Rust has two personalities around arithmetic. Debug builds panic on overflow: <code>0 - 1</code> kills the program. Release builds wrap silently: <code>0 - 1</code> becomes <code>u64::MAX</code> — 18,446,744,073,709,551,615, the largest fortune the type can
hold. Solana programs run as release BPF, so every bare <code>+</code> or <code>-</code> on a
balance is a potential mint in disguise.</p> <p><em>Diagram: the number line that bites its own tail. On release, 100 minus 101 lands on quintillions.</em></p> <h2>The bug</h2> <pre class="language-rust">${html(`<code class="language-rust"><span class="token comment">// VULNERABLE: bare subtraction on a release build</span>
vault<span class="token punctuation">.</span>balance <span class="token operator">=</span> vault<span class="token punctuation">.</span>balance <span class="token operator">-</span> amount<span class="token punctuation">;</span>   <span class="token comment">// 100 - 101 = u64::MAX, no error</span></code>`)}</pre> <p>A 100-unit vault, asked for 101, does not refuse. It wraps. No signer
forgery, no fake account, no confused deputy: just an operator the author
assumed would fail. The class is the lesson, worth every point. No single
canonical incident is claimed for it.</p> <h2>The fix (one method)</h2> <pre class="language-rust">${html(`<code class="language-rust">vault<span class="token punctuation">.</span>balance <span class="token operator">=</span> vault<span class="token punctuation">.</span>balance<span class="token punctuation">.</span><span class="token function">checked_sub</span><span class="token punctuation">(</span>amount<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ok_or</span><span class="token punctuation">(</span><span class="token class-name">InsufficientFunds</span><span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span></code>`)}</pre> <p><code>checked_sub</code> returns None instead of wrapping, and the error propagates.
Same inputs, opposite verdict: the 101-unit withdrawal refuses instead of
minting quintillions. Rule for life: financial math is always <code>checked_*</code>.
Bare operators are release-build wrapping bugs; <code>overflow-checks = true</code> in
the profile is defense in depth, never the fix. Open the room and prove it:
wrap the books, watch quintillions appear, then run the same shape at the
secure instruction and watch it refuse.</p>`);
}
const diagram = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMjUwIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9Ik92ZXJmbG93IHdyYXAgbnVtYmVyIGxpbmUiPgogIDxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI2MjQiIGhlaWdodD0iMjM0IiByeD0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhiOTQ5ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHRleHQgeD0iMjQiIHk9IjM2IiBmaWxsPSIjZTZlZGYzIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE1Ij5USEUgTlVNQkVSIExJTkUgVEhBVCBCSVRFUyBJVFMgVEFJTDwvdGV4dD4KICA8ZyBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEzIj4KICAgIDx0ZXh0IHg9IjM0IiB5PSI2NiIgZmlsbD0iIzhiOTQ5ZSI+MCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAgMTAwIOKUgOKUgOKWtiB1NjQ6Ok1BWCAoMTguNCBxdWludGlsbGlvbik8L3RleHQ+CiAgICA8cmVjdCB4PSIyNCIgeT0iODAiIHdpZHRoPSIyODAiIGhlaWdodD0iNTYiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiM1OGE2ZmYiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8dGV4dCB4PSIzNCIgeT0iMTAyIiBmaWxsPSIjNThhNmZmIj5kZWJ1ZzogMTAwIC0gMTAxPC90ZXh0PgogICAgPHRleHQgeD0iMzQiIHk9IjEyMiIgZmlsbD0iIzU4YTZmZiI+UEFOSUMgKGxvdWQsIHNhZmUpPC90ZXh0PgogICAgPHJlY3QgeD0iMzM2IiB5PSI4MCIgd2lkdGg9IjI4MCIgaGVpZ2h0PSI1NiIgcng9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y4NTE0OSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSIzNDYiIHk9IjEwMiIgZmlsbD0iI2Y4NTE0OSI+cmVsZWFzZTogMTAwIC0gMTAxPC90ZXh0PgogICAgPHRleHQgeD0iMzQ2IiB5PSIxMjIiIGZpbGw9IiNmODUxNDkiPnU2NDo6TUFYIChzaWxlbnQhKTwvdGV4dD4KICAgIDxyZWN0IHg9IjI0IiB5PSIxNTAiIHdpZHRoPSI1OTIiIGhlaWdodD0iNDYiIHJ4PSI2IiBmaWxsPSJub25lIiBzdHJva2U9IiMzZmI5NTAiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8dGV4dCB4PSIzNCIgeT0iMTcyIiBmaWxsPSIjM2ZiOTUwIj5jaGVja2VkX3N1YjogMTAwIC0gMTAxIC0tJmd0OyBOb25lIC0tJmd0OyBJbnN1ZmZpY2llbnRGdW5kczwvdGV4dD4KICAgIDx0ZXh0IHg9IjM0IiB5PSIxOTAiIGZpbGw9IiM4Yjk0OWUiPmxvdWQgb24gZXZlcnkgcHJvZmlsZTwvdGV4dD4KICA8L2c+CiAgPHRleHQgeD0iMjQiIHk9IjIxNiIgZmlsbD0iI2U2ZWRmMyIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiI+Y2FwdGlvbjogb24gcmVsZWFzZSB0aGUgbGluZSBpcyBhIGNpcmNsZSDigJQgMTAwIG1pbnVzIDEwMSBsYW5kcyBvbiBxdWludGlsbGlvbnMuPC90ZXh0Pgo8L3N2Zz4K";
function _page($$renderer) {
  _07_overflow_math_md($$renderer);
  $$renderer.push(`<!----> <img${attr("src", diagram)} alt="The number line that bites its tail"/> `);
  Quiz($$renderer, { quiz: "quiz-107" });
  $$renderer.push(`<!----> <a class="btn" href="/rooms/l7-overflow">Open the room</a> `);
  LessonNav($$renderer, {
    prev: { href: "/learn/106", label: "Lesson 106" },
    next: null
  });
  $$renderer.push(`<!---->`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CsX3PVMc.js.map
