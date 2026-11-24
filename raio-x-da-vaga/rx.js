// Raio-X da Vaga · Tecnologia Santos · page script (no inline code, CSP-friendly)
'use strict';
(function () {
  const API = 'https://raio-x-vaga.patient-hall-77b9.workers.dev';
  const SITEKEY = '0x4AAAAAADGmyOYSzzt9bk0o';
  const LANG_KEY = 'ts_trial_lang';
  const $ = id => document.getElementById(id);

  const T = {
    pt: {
      nav_mre: 'MRE·AI', label: 'Ferramenta gratuita · by MRE·AI', title: 'Raio-X da Vaga',
      lead: 'Cole a descrição de uma vaga e receba em segundos: requisitos obrigatórios e desejáveis, linguagem que pode afastar candidatos, o que está faltando e uma versão melhorada, pronta para publicar.',
      b1: 'Grátis, sem cadastro', b2: 'PT · EN · ES', b3: 'Modelos GLM e DeepSeek na Huawei Cloud, via Digiti',
      l_job: 'Descrição da vaga', b_sample: 'Usar uma vaga de exemplo',
      ph_job: 'Cole aqui a descrição completa: cargo, responsabilidades, requisitos, benefícios, modelo de trabalho…',
      hint_job: 'Não inclua dados pessoais (nomes, e-mails, telefones).', b_run: 'Analisar vaga', running: 'Analisando a vaga…',
      privacy_short: 'O texto não é guardado.',
      privacy_long: 'Como funciona: o texto da vaga é enviado ao nosso servidor (Cloudflare) e analisado por modelos de IA (GLM e DeepSeek) na Huawei Cloud, fornecidos pela parceira brasileira Digiti. O texto não é armazenado: guardamos apenas números de uso (tamanho do texto, idioma, modelo e tempo de resposta). Não cole dados pessoais. O resultado é uma sugestão; revise antes de publicar. Mais em nossa Política de Privacidade.',
      r_label: 'Resultado', r_must: 'Obrigatórios', r_nice: 'Desejáveis', r_bias: 'Linguagem que pode afastar candidatos',
      r_missing: 'O que está faltando', r_improved: 'Versão melhorada', b_copy: 'Copiar', copied: 'Copiado!',
      no_bias: 'Nenhum termo problemático encontrado.', no_missing: 'Nada importante faltando.', none: '—',
      meta: (m, s) => `Analisado por ${m} em ${s} s · Huawei Cloud via Digiti`,
      missing: { salary: 'Faixa salarial', work_model: 'Modelo de trabalho', location: 'Local', seniority: 'Senioridade', responsibilities: 'Responsabilidades', benefits: 'Benefícios', hiring_process: 'Etapas do processo', contract_type: 'Tipo de contrato' },
      cta_title: 'Vaga pronta? Agora ranqueie os candidatos.',
      cta_text: 'O MRE·AI compara até 5 currículos com a sua vaga e entrega um ranking com notas, pontos fortes, lacunas e perguntas de entrevista. 3 comparações grátis.',
      cta_btn: 'Testar o MRE·AI grátis',
      closed_title: 'A demonstração foi encerrada', closed_text: 'O Raio-X da Vaga funcionou como demonstração durante o programa com a Digiti e a Huawei Cloud. Obrigado a todos que testaram! Para avaliar candidatos com IA, conheça o MRE·AI.',
      err: { job_too_short: 'Cole a descrição completa da vaga (pelo menos 80 caracteres).', job_too_long: 'A descrição passa de 6.000 caracteres.',
        turnstile_missing: 'Conclua a verificação de segurança.', turnstile_failed: 'A verificação de segurança falhou. Tente de novo.',
        rate_limited: 'Você fez muitas análises nesta hora. Tente mais tarde.', daily_limit: 'O limite diário foi atingido. Volte amanhã.',
        analysis_failed: 'Não foi possível concluir a análise. Tente de novo.', network: 'Não foi possível falar com o servidor. Verifique sua conexão.', server_error: 'Erro inesperado. Tente de novo.' },
      sample: `Vaga: Desenvolvedor(a) Backend Sênior — Empresa Exemplo (fictícia)

Buscamos um rockstar jovem e dinâmico para nosso time de tecnologia!

Requisitos:
- 10 anos de experiência com Node.js
- AWS, Kubernetes, Go, Rust, Java e Python
- Inglês e alemão fluentes
- Disponibilidade total, inclusive fins de semana
- Formação em universidade de primeira linha

Diferenciais: ter trabalhado em startup unicórnio.

Benefícios: ambiente descontraído e frutas à vontade.`,
    },
    en: {
      nav_mre: 'MRE·AI', label: 'Free tool · by MRE·AI', title: 'Job Description X-Ray',
      lead: 'Paste a job description and get, in seconds: must-have and nice-to-have requirements, wording that may turn candidates away, what is missing and an improved version, ready to post.',
      b1: 'Free, no sign-up', b2: 'PT · EN · ES', b3: 'GLM and DeepSeek models on Huawei Cloud, via Digiti',
      l_job: 'Job description', b_sample: 'Use a sample job',
      ph_job: 'Paste the full description: role, responsibilities, requirements, benefits, work model…',
      hint_job: 'Do not include personal data (names, e-mails, phones).', b_run: 'Analyze job', running: 'Analyzing the job…',
      privacy_short: 'The text is not stored.',
      privacy_long: 'How it works: the job text is sent to our server (Cloudflare) and analyzed by AI models (GLM and DeepSeek) on Huawei Cloud, provided by the Brazilian partner Digiti. The text is not stored: we keep only usage numbers (text length, language, model and response time). Do not paste personal data. The result is a suggestion; review it before posting. More in our Privacy Policy.',
      r_label: 'Result', r_must: 'Must-have', r_nice: 'Nice-to-have', r_bias: 'Wording that may turn candidates away',
      r_missing: 'What is missing', r_improved: 'Improved version', b_copy: 'Copy', copied: 'Copied!',
      no_bias: 'No problematic wording found.', no_missing: 'Nothing important missing.', none: '—',
      meta: (m, s) => `Analyzed by ${m} in ${s} s · Huawei Cloud via Digiti`,
      missing: { salary: 'Salary range', work_model: 'Work model', location: 'Location', seniority: 'Seniority', responsibilities: 'Responsibilities', benefits: 'Benefits', hiring_process: 'Hiring steps', contract_type: 'Contract type' },
      cta_title: 'Job ready? Now rank the candidates.',
      cta_text: 'MRE·AI compares up to 5 CVs with your job and returns a ranking with scores, strengths, gaps and interview questions. 3 free comparisons.',
      cta_btn: 'Try MRE·AI free',
      closed_title: 'The demonstration has ended', closed_text: 'Job Description X-Ray ran as a demonstration during the program with Digiti and Huawei Cloud. Thank you to everyone who tried it! To evaluate candidates with AI, meet MRE·AI.',
      err: { job_too_short: 'Paste the full job description (at least 80 characters).', job_too_long: 'The description is longer than 6,000 characters.',
        turnstile_missing: 'Please complete the security check.', turnstile_failed: 'The security check failed. Please try again.',
        rate_limited: 'You ran many analyses this hour. Try again later.', daily_limit: 'The daily limit was reached. Come back tomorrow.',
        analysis_failed: 'The analysis could not be completed. Please try again.', network: 'Could not reach the server. Check your connection.', server_error: 'Unexpected error. Please try again.' },
      sample: `Job: Senior Backend Developer — Example Company (fictional)

We are looking for a young, energetic rockstar to join our tech team!

Requirements:
- 10 years of experience with Node.js
- AWS, Kubernetes, Go, Rust, Java and Python
- Fluent English and German
- Full availability, including weekends
- Degree from a top-tier university

Nice to have: worked at a unicorn startup.

Benefits: relaxed environment and free fruit.`,
    },
    es: {
      nav_mre: 'MRE·AI', label: 'Herramienta gratuita · by MRE·AI', title: 'Rayos X de la Vacante',
      lead: 'Pega la descripción de una vacante y recibe en segundos: requisitos obligatorios y deseables, lenguaje que puede alejar candidatos, lo que falta y una versión mejorada, lista para publicar.',
      b1: 'Gratis, sin registro', b2: 'PT · EN · ES', b3: 'Modelos GLM y DeepSeek en Huawei Cloud, vía Digiti',
      l_job: 'Descripción de la vacante', b_sample: 'Usar una vacante de ejemplo',
      ph_job: 'Pega aquí la descripción completa: cargo, responsabilidades, requisitos, beneficios, modalidad de trabajo…',
      hint_job: 'No incluyas datos personales (nombres, correos, teléfonos).', b_run: 'Analizar vacante', running: 'Analizando la vacante…',
      privacy_short: 'El texto no se guarda.',
      privacy_long: 'Cómo funciona: el texto de la vacante se envía a nuestro servidor (Cloudflare) y lo analizan modelos de IA (GLM y DeepSeek) en Huawei Cloud, provistos por el socio brasileño Digiti. El texto no se almacena: guardamos solo números de uso (tamaño del texto, idioma, modelo y tiempo de respuesta). No pegues datos personales. El resultado es una sugerencia; revísalo antes de publicar. Más en nuestra Política de Privacidad.',
      r_label: 'Resultado', r_must: 'Obligatorios', r_nice: 'Deseables', r_bias: 'Lenguaje que puede alejar candidatos',
      r_missing: 'Lo que falta', r_improved: 'Versión mejorada', b_copy: 'Copiar', copied: '¡Copiado!',
      no_bias: 'No se encontraron términos problemáticos.', no_missing: 'No falta nada importante.', none: '—',
      meta: (m, s) => `Analizado por ${m} en ${s} s · Huawei Cloud vía Digiti`,
      missing: { salary: 'Rango salarial', work_model: 'Modalidad de trabajo', location: 'Ubicación', seniority: 'Seniority', responsibilities: 'Responsabilidades', benefits: 'Beneficios', hiring_process: 'Etapas del proceso', contract_type: 'Tipo de contrato' },
      cta_title: '¿Vacante lista? Ahora clasifica a los candidatos.',
      cta_text: 'MRE·AI compara hasta 5 CVs con tu vacante y entrega un ranking con puntajes, fortalezas, brechas y preguntas de entrevista. 3 comparaciones gratis.',
      cta_btn: 'Probar MRE·AI gratis',
      closed_title: 'La demostración terminó', closed_text: 'Rayos X de la Vacante funcionó como demostración durante el programa con Digiti y Huawei Cloud. ¡Gracias a todos los que la probaron! Para evaluar candidatos con IA, conoce MRE·AI.',
      err: { job_too_short: 'Pega la descripción completa (al menos 80 caracteres).', job_too_long: 'La descripción supera los 6.000 caracteres.',
        turnstile_missing: 'Completa la verificación de seguridad.', turnstile_failed: 'La verificación de seguridad falló. Inténtalo de nuevo.',
        rate_limited: 'Hiciste muchos análisis en esta hora. Inténtalo más tarde.', daily_limit: 'Se alcanzó el límite diario. Vuelve mañana.',
        analysis_failed: 'No se pudo completar el análisis. Inténtalo de nuevo.', network: 'No se pudo contactar al servidor. Revisa tu conexión.', server_error: 'Error inesperado. Inténtalo de nuevo.' },
      sample: `Vacante: Desarrollador(a) Backend Senior — Empresa Ejemplo (ficticia)

¡Buscamos un rockstar joven y dinámico para nuestro equipo de tecnología!

Requisitos:
- 10 años de experiencia con Node.js
- AWS, Kubernetes, Go, Rust, Java y Python
- Inglés y alemán fluidos
- Disponibilidad total, incluso fines de semana
- Título de una universidad de primer nivel

Deseable: haber trabajado en una startup unicornio.

Beneficios: ambiente relajado y fruta libre.`,
    },
  };

  function detectLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && T[q]) return q;
    try { const s = localStorage.getItem(LANG_KEY); if (s && T[s]) return s; } catch (e) {}
    const n = (navigator.language || 'pt').slice(0, 2).toLowerCase();
    return T[n] ? n : 'pt';
  }
  let LANG = detectLang(), last = null, tsId = null;
  const t = k => T[LANG][k];

  function applyTexts() {
    document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : LANG;
    document.title = t('title') + ' · Tecnologia Santos';
    document.querySelectorAll('[data-t]').forEach(el => { const v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
    document.querySelectorAll('[data-tp]').forEach(el => { el.placeholder = t(el.dataset.tp); });
    document.querySelectorAll('.langs button').forEach(b => b.classList.toggle('on', b.dataset.lang === LANG));
    document.querySelectorAll('a[data-keep-lang]').forEach(a => { const u = new URL(a.href, location.href); u.searchParams.set('lang', LANG); a.href = u.pathname + u.search; });
    if (last) render(last);
  }
  document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => {
    LANG = b.dataset.lang; try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {} applyTexts();
  }));

  function showMsg(kind, text) { const m = $('msg'); m.hidden = false; m.className = 'msg ' + kind; m.textContent = text; }
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // Turnstile (explicit render, like the MRE·AI page)
  // The Turnstile script loads async and may finish before this deferred script runs: render either way, once.
  window.onTurnstileLoad = () => {
    if (tsId !== null || !window.turnstile) return;
    tsId = window.turnstile.render($('ts'), { sitekey: SITEKEY, theme: 'light', language: LANG === 'pt' ? 'pt-br' : LANG });
  };
  if (window.turnstile) window.onTurnstileLoad();

  function closed() { $('form-card').hidden = true; $('result').hidden = true; $('closed').hidden = false; }

  function render(r) {
    $('result').hidden = false;
    const s = Math.max(0, Math.min(100, r.score));
    $('score').textContent = s;
    const ring = $('score-ring');
    ring.style.setProperty('--p', s);
    ring.style.setProperty('--c', s >= 85 ? '#0e9f6e' : s >= 60 ? '#d97706' : '#e02424');
    $('r-title').textContent = r.title || '';
    $('r-summary').textContent = r.summary || '';
    $('r-meta').textContent = t('meta')(r.model, (r.ms / 1000).toLocaleString(LANG === 'en' ? 'en' : 'pt-BR', { maximumFractionDigits: 1 }));
    for (const [id, items] of [['r-must', r.must_have], ['r-nice', r.nice_to_have]]) {
      const ul = $(id); ul.textContent = '';
      (items && items.length ? items : [t('none')]).forEach(x => ul.appendChild(el('li', '', x)));
    }
    const req = $('r-req'); req.hidden = !(r.too_many_requirements || r.requirements_note);
    req.textContent = r.requirements_note || '';
    const bias = $('r-bias'); bias.textContent = '';
    if (!r.bias || !r.bias.length) bias.appendChild(el('p', 'rx-ok', '✓ ' + t('no_bias')));
    (r.bias || []).forEach(b => {
      const d = el('div', 'rx-bias');
      d.appendChild(el('b', '', '“' + b.term + '”'));
      if (b.suggestion) { d.appendChild(el('span', 'arrow', '  →  ')); d.appendChild(el('span', '', b.suggestion)); }
      if (b.why) d.appendChild(el('span', 'why', b.why));
      bias.appendChild(d);
    });
    const miss = $('r-missing'); miss.textContent = '';
    if (!r.missing || !r.missing.length) miss.appendChild(el('p', 'rx-ok', '✓ ' + t('no_missing')));
    (r.missing || []).forEach(k => miss.appendChild(el('span', '', t('missing')[k] || k)));
    $('r-improved').textContent = r.improved || '';
  }

  async function run() {
    $('msg').hidden = true;
    const job = $('job').value.trim();
    if (job.length < 80) return showMsg('err', t('err').job_too_short);
    const cfToken = tsId !== null && window.turnstile ? window.turnstile.getResponse(tsId) : '';
    if (!cfToken) return showMsg('err', t('err').turnstile_missing);
    const btn = $('run'); btn.disabled = true; btn.textContent = t('running');
    try {
      let res;
      try { res = await fetch(API + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job, lang: LANG, cfToken }) }); }
      catch (e) { throw Object.assign(new Error(t('err').network), { code: 'network' }); }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = (data.error && data.error.code) || 'server_error';
        if (code === 'demo_closed') return closed();
        throw Object.assign(new Error(t('err')[code] || t('err').server_error), { code });
      }
      last = data; render(data);
      $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showMsg('err', err.message);
    } finally {
      btn.disabled = false; btn.textContent = t('b_run');
      if (tsId !== null && window.turnstile) window.turnstile.reset(tsId);
    }
  }

  $('run').addEventListener('click', run);
  $('job').addEventListener('input', () => { $('count').textContent = `${$('job').value.length} / 6000`; });
  $('sample').addEventListener('click', () => { $('job').value = t('sample'); $('job').dispatchEvent(new Event('input')); $('job').focus(); });
  $('copy').addEventListener('click', async e => {
    const b = e.currentTarget, txt = $('r-improved').textContent;
    try { await navigator.clipboard.writeText(txt); } catch (x) { const a = el('textarea'); a.value = txt; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (y) {} a.remove(); }
    b.textContent = t('copied'); setTimeout(() => { b.textContent = t('b_copy'); }, 1500);
  });
  applyTexts();
  // Already closed? Show it right away instead of after a first try.
  fetch(API + '/api/status').then(r => r.json()).then(s => { if (s.mode === 'closed') closed(); }).catch(() => {});
})();
