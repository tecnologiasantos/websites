// MRE·AI free trial · pricing plans (Tabela de preços v1.0, 21/11/2026)
// Load AFTER trial.js. Renders into <div id="plans"></div>.
// On the public page the buttons open an e-mail. Inside the app, app.js sets window.TS_PLANS =
// { currency: 'BRL'|'USD'|null (fixed account currency), checkout({plan, cycle, currency}, btn), pack({currency}, btn) }
// and the buttons start Stripe Checkout instead. window.TSPlans.render() re-renders.
// R$ prices are set for the Brazilian market; they are not an exchange-rate conversion.
'use strict';

(function () {
  const CUR_KEY = 'ts_trial_currency';
  const CYCLE_KEY = 'ts_trial_cycle';
  const SUPPORT = 'support@tecnologiasantos.com';

  // Prices per plan: [monthly, 3 months, annual, annual per-month equivalent]
  const PRICES = {
    USD: {
      essencial: [9, 24, 78, 6.5],
      profissional: [19, 50, 164, 13.67],
      equipe: [39, 104, 337, 28.08],
      pacote: 5,
    },
    BRL: {
      essencial: [29, 77, 249, 21],
      profissional: [59, 157, 509, 42],
      equipe: [119, 316, 1029, 86],
      pacote: 19,
    },
  };
  const PLANS = [
    { id: 'essencial', credits: 40 },
    { id: 'profissional', credits: 150, featured: true },
    { id: 'equipe', credits: 500 },
  ];

  const TXT = {
    pt: {
      pl_label: 'Planos MRE·AI',
      pl_title: 'Gostou do teste? Escolha um plano',
      pl_lead: 'Cada comparação avalia 1 vaga com até 5 currículos e devolve um ranking de 0 a 100, com pontos fortes, lacunas e justificativa.',
      pl_monthly: 'Mensal', pl_quarterly: '3 meses', pl_annual: 'Anual',
      pl_save_q: 'economize ~11%', pl_save_a: 'economize ~28%',
      pl_currency: 'Moeda',
      pl_per_month: '/mês', pl_per_quarter: 'a cada 3 meses', pl_per_year: '/ano',
      pl_equiv: v => `equivale a ${v}/mês`,
      pl_credits: n => `${n.toLocaleString('pt-BR')} comparações por mês`,
      pl_popular: 'Mais escolhido',
      n_essencial: 'Essencial', n_profissional: 'Profissional', n_equipe: 'Equipe', n_pacote: 'Pacote avulso',
      d_essencial: 'Para quem contrata de vez em quando.',
      d_profissional: 'Para RH e recrutadores com vagas abertas todo mês.',
      d_equipe: 'Para equipes de recrutamento e consultorias.',
      d_pacote: '25 comparações, válidas por 60 dias. Para picos de contratação ou para completar o plano.',
      pl_cta: 'Contratar', pl_cta_pack: 'Comprar pacote',
      pl_rules: [
        'Créditos por empresa: colegas do mesmo domínio de e-mail dividem o saldo.',
        'Créditos mensais não passam para o mês seguinte.',
        'Quem assina em reais renova em reais; quem assina em dólar renova em dólar.',
        'Até 5 currículos por comparação e 1 avaliação por minuto por usuário.',
      ],
      pl_upgrade: 'Precisa de vagas, busca de talentos, chat e pipeline? O MiraTech Premium já inclui o MRE·AI, com 500 comparações por mês.',
      pl_upgrade_link: 'Conhecer a MiraTech',
      pl_note: 'Valores sujeitos a alteração. Dúvidas: ' + SUPPORT,
      pl_subject: (plan, cycle, cur) => `MRE·AI · Plano ${plan} (${cycle}, ${cur})`,
      pl_body: 'Olá! Quero contratar este plano do MRE·AI.\n\nEmpresa:\nNome:\n',
    },
    en: {
      pl_label: 'MRE·AI plans',
      pl_title: 'Liked the trial? Choose a plan',
      pl_lead: 'Each comparison scores 1 job description against up to 5 CVs and returns a 0–100 ranking with strengths, gaps and reasoning.',
      pl_monthly: 'Monthly', pl_quarterly: '3 months', pl_annual: 'Annual',
      pl_save_q: 'save ~11%', pl_save_a: 'save ~28%',
      pl_currency: 'Currency',
      pl_per_month: '/month', pl_per_quarter: 'every 3 months', pl_per_year: '/year',
      pl_equiv: v => `equals ${v}/month`,
      pl_credits: n => `${n.toLocaleString('en')} comparisons per month`,
      pl_popular: 'Most popular',
      n_essencial: 'Essential', n_profissional: 'Professional', n_equipe: 'Team', n_pacote: 'Top-up pack',
      d_essencial: 'For occasional hiring.',
      d_profissional: 'For HR and recruiters with open roles every month.',
      d_equipe: 'For recruiting teams and IT consultancies.',
      d_pacote: '25 comparisons, valid for 60 days. For hiring peaks or to top up your plan.',
      pl_cta: 'Subscribe', pl_cta_pack: 'Buy pack',
      pl_rules: [
        'Credits are per company: colleagues on the same e-mail domain share the balance.',
        'Monthly credits do not roll over to the next month.',
        'Plans renew in the currency you subscribed in (BRL or USD).',
        'Up to 5 CVs per comparison and 1 evaluation per minute per user.',
      ],
      pl_upgrade: 'Need job posts, talent search, chat and pipeline too? MiraTech Premium already includes MRE·AI, with 500 comparisons per month.',
      pl_upgrade_link: 'Discover MiraTech',
      pl_note: 'Prices subject to change. Questions: ' + SUPPORT,
      pl_subject: (plan, cycle, cur) => `MRE·AI · ${plan} plan (${cycle}, ${cur})`,
      pl_body: 'Hi! I would like to subscribe to this MRE·AI plan.\n\nCompany:\nName:\n',
    },
    es: {
      pl_label: 'Planes MRE·AI',
      pl_title: '¿Te gustó la prueba? Elige un plan',
      pl_lead: 'Cada comparación evalúa 1 vacante con hasta 5 CVs y devuelve un ranking de 0 a 100, con fortalezas, brechas y justificación.',
      pl_monthly: 'Mensual', pl_quarterly: '3 meses', pl_annual: 'Anual',
      pl_save_q: 'ahorra ~11%', pl_save_a: 'ahorra ~28%',
      pl_currency: 'Moneda',
      pl_per_month: '/mes', pl_per_quarter: 'cada 3 meses', pl_per_year: '/año',
      pl_equiv: v => `equivale a ${v}/mes`,
      pl_credits: n => `${n.toLocaleString('es')} comparaciones por mes`,
      pl_popular: 'Más elegido',
      n_essencial: 'Esencial', n_profissional: 'Profesional', n_equipe: 'Equipo', n_pacote: 'Paquete adicional',
      d_essencial: 'Para quien contrata de vez en cuando.',
      d_profissional: 'Para RR. HH. y reclutadores con vacantes abiertas cada mes.',
      d_equipe: 'Para equipos de reclutamiento y consultoras de TI.',
      d_pacote: '25 comparaciones, válidas por 60 días. Para picos de contratación o para completar tu plan.',
      pl_cta: 'Contratar', pl_cta_pack: 'Comprar paquete',
      pl_rules: [
        'Créditos por empresa: los colegas del mismo dominio de correo comparten el saldo.',
        'Los créditos mensuales no se acumulan para el mes siguiente.',
        'El plan se renueva en la moneda en que se contrató (BRL o USD).',
        'Hasta 5 CVs por comparación y 1 evaluación por minuto por usuario.',
      ],
      pl_upgrade: '¿Necesitas también vacantes, búsqueda de talento, chat y pipeline? MiraTech Premium ya incluye MRE·AI, con 500 comparaciones por mes.',
      pl_upgrade_link: 'Conocer MiraTech',
      pl_note: 'Valores sujetos a cambios. Dudas: ' + SUPPORT,
      pl_subject: (plan, cycle, cur) => `MRE·AI · Plan ${plan} (${cycle}, ${cur})`,
      pl_body: '¡Hola! Quiero contratar este plan de MRE·AI.\n\nEmpresa:\nNombre:\n',
    },
  };
  // Merge into the shared dictionary used by trial.js
  Object.keys(TXT).forEach(l => { if (T[l]) Object.assign(T[l], TXT[l]); });

  const CSS = `
.plans{margin-top:48px}
.plans-head{text-align:center;max-width:720px;margin:0 auto 20px}
.plans-head .lead{margin-bottom:0}
.plans-ctl{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin:0 0 24px}
.seg{display:inline-flex;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:4px;gap:4px}
.seg button{border:0;background:transparent;border-radius:7px;padding:7px 12px;font-weight:600;font-size:13px;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.seg button.on{background:var(--blue);color:#fff}
.seg .save{font-size:11px;font-weight:700;color:var(--teal);background:var(--teal-light);border-radius:999px;padding:1px 7px}
.seg button.on .save{background:rgba(255,255,255,.2);color:#fff}
.seg button{white-space:nowrap}
@media (max-width:520px){.seg button{flex-direction:column;gap:2px;padding:6px 10px}.seg .save{font-size:10px}}
.seg-label{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-right:4px}
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}
@media (max-width:900px){.plan-grid{grid-template-columns:1fr}}
.plan{position:relative;display:flex;flex-direction:column;gap:10px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px}
.plan.featured{border:2px solid var(--blue)}
.plan .pill{position:absolute;top:-13px;left:24px}
.plan-price{font-size:32px;font-weight:800;line-height:1.1}
.plan-price small{font-size:14px;font-weight:600;color:var(--muted);margin-left:4px}
.plan-eq{font-size:13px;color:var(--teal);font-weight:600;min-height:20px}
.plan-cr{font-weight:700;color:var(--blue)}
.plan .btn{margin-top:auto}
.pack{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-top:18px}
.pack .plan-price{font-size:24px}
.plans-foot{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;margin-top:18px}
@media (max-width:900px){.plans-foot{grid-template-columns:1fr}}
.plans-foot ul{margin-left:18px;font-size:14px;color:var(--muted);display:grid;gap:4px}
.upgrade{background:var(--blue-light);border-radius:var(--radius);padding:20px;color:#1e3a8a;font-size:14px}
.upgrade a{font-weight:700;display:inline-block;margin-top:8px}
.plans-note{text-align:center;font-size:12px;color:var(--muted);margin-top:16px}
@media print{.plans{display:none!important}}`;

  const tx = k => (T[LANG] && T[LANG][k]) || T.en[k];

  function ls(get, k, v) {
    try { return get ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; }
  }
  const state = {
    cur: ls(true, CUR_KEY),        // null = follow language (pt → BRL, en/es → USD)
    cycle: ls(true, CYCLE_KEY) || 'm',
  };
  const hook = () => window.TS_PLANS || null;
  const lockedCur = () => (hook() && (hook().currency === 'BRL' || hook().currency === 'USD')) ? hook().currency : null;
  const currency = () => lockedCur() || ((state.cur === 'BRL' || state.cur === 'USD') ? state.cur : (LANG === 'pt' ? 'BRL' : 'USD'));
  const CYCLE_API = { m: 'mensal', q: 'trimestral', a: 'anual' };

  function money(v, cur) {
    const loc = LANG === 'pt' ? 'pt-BR' : LANG === 'es' ? 'es' : 'en-US';
    const dec = Number.isInteger(v) ? 0 : 2;
    const n = v.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return (cur === 'BRL' ? 'R$ ' : 'US$ ') + n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function mailto(planName, cycleName, cur) {
    return 'mailto:' + SUPPORT +
      '?subject=' + encodeURIComponent(tx('pl_subject')(planName, cycleName, cur === 'BRL' ? 'R$' : 'US$')) +
      '&body=' + encodeURIComponent(tx('pl_body'));
  }

  function render() {
    const root = document.getElementById('plans');
    if (!root) return;
    const cur = currency();
    const P = PRICES[cur];
    const ci = { m: 0, q: 1, a: 2 }[state.cycle] || 0;
    const cycleName = tx(['pl_monthly', 'pl_quarterly', 'pl_annual'][ci]);
    const per = tx(['pl_per_month', 'pl_per_quarter', 'pl_per_year'][ci]);

    const packOnly = !!(hook() && hook().packOnly);   // in the app, for companies that already subscribe
    const cards = PLANS.map(p => {
      const pr = P[p.id];
      const name = tx('n_' + p.id);
      const eq = ci === 2 ? tx('pl_equiv')(money(pr[3], cur)) : '';
      return `<div class="plan${p.featured ? ' featured' : ''}">
        ${p.featured ? `<span class="pill">${esc(tx('pl_popular'))}</span>` : ''}
        <h3>${esc(name)}</h3>
        <div class="plan-price">${money(pr[ci], cur)}<small>${esc(per)}</small></div>
        <div class="plan-eq">${esc(eq)}</div>
        <div class="plan-cr">${esc(tx('pl_credits')(p.credits))}</div>
        <p class="muted small">${esc(tx('d_' + p.id))}</p>
        ${hook()
          ? `<button type="button" class="btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-block" data-buy="${p.id}">${esc(tx('pl_cta'))}</button>`
          : `<a class="btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-block" href="${mailto(name, cycleName, cur)}">${esc(tx('pl_cta'))}</a>`}
      </div>`;
    }).join('');

    const seg = (items, active, attr) => items.map(([v, label, extra]) =>
      `<button type="button" data-${attr}="${v}" class="${v === active ? 'on' : ''}">${esc(label)}${extra ? ` <span class="save">${esc(extra)}</span>` : ''}</button>`).join('');

    root.className = 'plans';
    root.innerHTML = `
      <div class="plans-head">
        <div class="label">${esc(tx('pl_label'))}</div>
        <h2>${esc(tx('pl_title'))}</h2>
        <p class="lead">${esc(tx('pl_lead'))}</p>
      </div>
      ${packOnly ? '' : `<div class="plans-ctl">
        <div class="seg">${seg([['m', tx('pl_monthly')], ['q', tx('pl_quarterly'), tx('pl_save_q')], ['a', tx('pl_annual'), tx('pl_save_a')]], state.cycle, 'cycle')}</div>
        <div class="seg"><span class="seg-label" style="align-self:center;padding-left:6px">${esc(tx('pl_currency'))}</span>${seg([['BRL', 'R$'], ['USD', 'US$']].filter(([v]) => !lockedCur() || v === lockedCur()), cur, 'cur')}</div>
      </div>
      <div class="plan-grid">${cards}</div>`}
      <div class="card pack">
        <div><h3>${esc(tx('n_pacote'))}</h3><p class="muted small">${esc(tx('d_pacote'))}</p></div>
        <div style="display:flex;gap:16px;align-items:center">
          <div class="plan-price">${money(P.pacote, cur)}</div>
          ${hook()
            ? `<button type="button" class="btn btn-ghost" data-pack>${esc(tx('pl_cta_pack'))}</button>`
            : `<a class="btn btn-ghost" href="${mailto(tx('n_pacote'), '25', cur)}">${esc(tx('pl_cta_pack'))}</a>`}
        </div>
      </div>
      <div class="plans-foot">
        <div class="card"><ul>${tx('pl_rules').map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
        <div class="upgrade">${esc(tx('pl_upgrade'))}<br><a href="https://miratech.tecnologiasantos.com" target="_blank" rel="noopener">${esc(tx('pl_upgrade_link'))} →</a></div>
      </div>
      <p class="plans-note">${esc(tx('pl_note'))}</p>`;

    root.querySelectorAll('[data-cycle]').forEach(b => b.addEventListener('click', () => {
      state.cycle = b.dataset.cycle; ls(false, CYCLE_KEY, state.cycle); render();
    }));
    root.querySelectorAll('[data-cur]').forEach(b => b.addEventListener('click', () => {
      state.cur = b.dataset.cur; ls(false, CUR_KEY, state.cur); render();
    }));
    const h = hook();
    if (h) {
      root.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () =>
        h.checkout({ plan: b.dataset.buy, cycle: CYCLE_API[state.cycle] || 'mensal', currency: cur.toLowerCase() }, b)));
      root.querySelectorAll('[data-pack]').forEach(b => b.addEventListener('click', () =>
        h.pack({ currency: cur.toLowerCase() }, b)));
    }
  }
  window.TSPlans = { render };

  function init() {
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    render();
    // Re-render after trial.js switches the language (its handler runs first)
    document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => setTimeout(render, 0)));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
