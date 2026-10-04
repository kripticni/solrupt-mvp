import { k as attr, l as attr_class } from './index-Dz89ki_T.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    let menu = false;
    $$renderer2.push(`<nav class="topnav"><a class="brand" href="/"><img src="/logo.svg" alt=""/>Solana Security Gym</a> <button class="menu-btn"${attr("aria-expanded", menu)} aria-controls="navlinks">Menu</button> <div id="navlinks"${attr_class("links", void 0, { "open": menu })}><a href="/learn">Learn</a> <a href="/rooms">Rooms</a> <a href="/board">Board</a> <button class="btn-ghost" title="Micro sound cues after clicks">Sound: ${escape_html("off")}</button></div></nav> <main class="wrap">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> <footer class="site">Solana-only training gym. <a href="mailto:team@nerv.example">support</a></footer>`);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-DEWwsm0P.js.map
