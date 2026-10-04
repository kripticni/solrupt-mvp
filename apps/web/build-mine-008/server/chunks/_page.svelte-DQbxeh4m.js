import { e as escape_html } from './escaping-CqgfEcN3.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let severity = "High";
    let proof = "";
    let fix = "";
    $$renderer2.push(`<h1>Finding</h1> <p class="muted">Last step: describe the bug and its fix in your own words, and the proof URL is yours.</p> <div class="panel"><label for="sev">Severity</label> `);
    $$renderer2.select({ id: "sev", value: severity }, ($$renderer3) => {
      $$renderer3.option({}, ($$renderer4) => {
        $$renderer4.push(`Critical`);
      });
      $$renderer3.option({}, ($$renderer4) => {
        $$renderer4.push(`High`);
      });
      $$renderer3.option({}, ($$renderer4) => {
        $$renderer4.push(`Medium`);
      });
      $$renderer3.option({}, ($$renderer4) => {
        $$renderer4.push(`Low`);
      });
    });
    $$renderer2.push(` <label for="proof">Proof: what the exploit did (2 to 3 sentences)</label> <textarea id="proof" rows="4">`);
    const $$body = escape_html(proof);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> <label for="fix">Fix (1 to 2 sentences)</label> <textarea id="fix" rows="3">`);
    const $$body_1 = escape_html(fix);
    if ($$body_1) {
      $$renderer2.push(`${$$body_1}`);
    }
    $$renderer2.push(`</textarea> <div><button class="btn">Publish proof</button></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DQbxeh4m.js.map
