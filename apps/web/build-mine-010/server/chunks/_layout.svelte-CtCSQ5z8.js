import { an as head, ao as attr, ap as attr_class } from './index-MANu6bg9.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    let menu = false;
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Solrupt — break Solana programs, prove it</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Free hands-on Solana security gym: run guided exploits in your browser and earn a proof URL a stranger can re-run."/>`);
    });
    $$renderer2.push(`<nav class="topnav"><a class="brand" href="/"><img src="/logo.svg" alt=""/>Solrupt</a> <button class="menu-btn"${attr("aria-expanded", menu)} aria-controls="navlinks">Menu</button> <div id="navlinks"${attr_class("links", void 0, { "open": menu })}><a href="/learn">Learn</a> <a href="/rooms">Rooms</a> <a href="/board">Board</a> <button class="btn-ghost" title="Micro sound cues after clicks">Sound: ${escape_html("off")}</button></div></nav> <main class="wrap">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> <footer class="site">Solana-only training gym. <a href="mailto:team@nerv.example">support</a></footer>`);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-CtCSQ5z8.js.map
