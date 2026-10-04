import { e as escape_html } from './escaping-CqgfEcN3.js';
import './state.svelte-B2YL251E.js';
import './root-f2T38pft.js';
import { aq as getContext } from './index-MANu6bg9.js';

function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get status() {
    return context().page.status;
  }
};
const page = page$1;
function Error$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`);
  });
}

export { Error$1 as default };
//# sourceMappingURL=error.svelte-DzxcYTIg.js.map
