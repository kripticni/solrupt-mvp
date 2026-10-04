import { aq as ensure_array_like, an as attr, ar as stringify, a7 as derived } from './index-DxdwV7NI.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

function Quiz($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { quiz } = $$props;
    let questions = [];
    let total = 0;
    let picked = [];
    let nickname = "";
    const answered = derived(() => picked.filter((p) => p !== null).length);
    const ready = derived(() => picked.length > 0 && answered() === picked.length && nickname.trim().length > 0);
    $$renderer2.push(`<section aria-label="Lesson check" class="quiz"><h2>Check (${escape_html(total)} pts)</h2> `);
    if (questions.length > 0) {
      $$renderer2.push(`<!--[0--><p class="muted">Answered ${escape_html(answered())}/${escape_html(questions.length)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[-1--><!--[-->`);
      const each_array = ensure_array_like(questions);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let q = each_array[i];
        $$renderer2.push(`<fieldset><legend>${escape_html(q.q)} <span class="badge">${escape_html(q.severity)}</span></legend> <!--[-->`);
        const each_array_1 = ensure_array_like(q.choices);
        for (let k = 0, $$length2 = each_array_1.length; k < $$length2; k++) {
          let c = each_array_1[k];
          $$renderer2.push(`<label><input type="radio"${attr("name", `${stringify(quiz)}-${stringify(q.id)}`)}${attr("checked", picked[i] === k, true)}/> ${escape_html(c)}</label>`);
        }
        $$renderer2.push(`<!--]--></fieldset>`);
      }
      $$renderer2.push(`<!--]--> <label${attr("for", `quiz-nick-${stringify(quiz)}`)}>Nickname</label> <input${attr("id", `quiz-nick-${stringify(quiz)}`)}${attr("value", nickname)} placeholder="nickname"/> <div><button class="btn-ghost"${attr("disabled", !ready(), true)}>Submit answers</button></div> `);
      if (!ready() && questions.length > 0) {
        $$renderer2.push(`<!--[0--><p class="muted">Pick one choice per question and a nickname to submit.</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function LessonNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { prev, next } = $$props;
    $$renderer2.push(`<nav aria-label="Lesson path" class="lesson-nav">`);
    if (prev) {
      $$renderer2.push(`<!--[0--><a class="btn-ghost"${attr("href", prev.href)}>← ${escape_html(prev.label)}</a>`);
    } else {
      $$renderer2.push(`<!--[-1--><span></span>`);
    }
    $$renderer2.push(`<!--]--> <a class="btn-ghost" href="/learn">Path</a> `);
    if (next) {
      $$renderer2.push(`<!--[0--><a class="btn-ghost"${attr("href", next.href)}>${escape_html(next.label)} →</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></nav>`);
  });
}

export { LessonNav as L, Quiz as Q };
//# sourceMappingURL=LessonNav-DOIaH1t6.js.map
