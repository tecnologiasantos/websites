// MRE·AI free trial · authenticated app page
// CVs are read and anonymized here, in the browser. Only anonymized text is sent.
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const MAX_CVS = 5, MAX_CV_CHARS = 12000, MAX_JOB = 6000, IDS = ['A', 'B', 'C', 'D', 'E'];
  let me = null, cvs = [], current = null, past = [];

  // ── Helpers ──────────────────────────────────────────────────────────────
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const fmtDate = ms => new Date(ms).toLocaleDateString(LANG === 'pt' ? 'pt-BR' : LANG, { day: 'numeric', month: 'short', year: 'numeric' });
  const namesKey = id => 'mre_trial_names_' + id;
  function saveNames(id, names) { try { sessionStorage.setItem(namesKey(id), JSON.stringify(names)); } catch (e) {} }
  function loadNames(id) { try { return JSON.parse(sessionStorage.getItem(namesKey(id)) || '{}'); } catch (e) { return {}; } }

  // ── Text extraction ──────────────────────────────────────────────────────
  let pdfjsPromise = null, mammothPromise = null;
  function loadPdfjs() {
    if (!pdfjsPromise) pdfjsPromise = import(new URL('../vendor/pdf.min.mjs', location.href).href).then(m => {
      m.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.mjs', location.href).href;
      return m;
    });
    return pdfjsPromise;
  }
  function loadMammoth() {
    if (!mammothPromise) mammothPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = new URL('../vendor/mammoth.browser.min.js', location.href).href;
      s.onload = () => resolve(window.mammoth); s.onerror = reject;
      document.head.appendChild(s);
    });
    return mammothPromise;
  }
  async function extractText(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
      let out = '';
      for (let p = 1; p <= Math.min(doc.numPages, 15); p++) {
        const page = await doc.getPage(p);
        const tc = await page.getTextContent();
        for (const it of tc.items) out += (it.str || '') + (it.hasEOL ? '\n' : ' ');
        out += '\n';
      }
      return out;
    }
    if (name.endsWith('.docx')) {
      const mammoth = await loadMammoth();
      const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return r.value || '';
    }
    if (name.endsWith('.txt') || file.type.startsWith('text/')) return await file.text();
    throw new Error('unsupported');
  }

  // ── Anonymization (before anything leaves the browser) ───────────────────
  const PERSONAL_LINE = /^.*\b(data de nascimento|nascimento|nascid[oa]|date of birth|birth ?date|born|fecha de nacimiento|idade|age|edad|estado civil|marital status|nacionalidade|nationality|nacionalidad|naturalidade|endere[cç]o|address|direcci[oó]n|sexo|g[eê]nero|gender|religi[aãoó]n?|religion|filhos|children|hijos|CNH|RG|CPF|DNI|passaporte|passport|pasaporte)\b.*$/gim;
  function guessName(text, fileName) {
    const first = (text.split('\n').map(s => s.trim()).find(s => s.length > 2) || '');
    if (/^[\p{L}][\p{L}'.\- ]{2,48}$/u.test(first) && first.split(/\s+/).length >= 2 && first.split(/\s+/).length <= 5) return first;
    return fileName.replace(/\.[^.]+$/, '').replace(/[_\-.]+/g, ' ').replace(/\b(cv|resume|r[eé]sum[eé]|curr[ií]culo|curriculum|vitae|final|novo|new|\d+)\b/gi, '').replace(/\s+/g, ' ').trim();
  }
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function anonymize(raw, name, label) {
    let s = raw.replace(/\r/g, '');
    s = s.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[e-mail]');
    s = s.replace(/\b(https?:\/\/|www\.)\S+/gi, '[link]');
    s = s.replace(/\b(linkedin\.com|github\.com|gitlab\.com|behance\.net|instagram\.com|facebook\.com)\/\S*/gi, '[link]');
    s = s.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[doc]');                  // CPF
    s = s.replace(/\b\d{5}-\d{3}\b/g, '[cep]');                                     // CEP
    s = s.replace(/(\+?\d{1,3}[\s.-]?)?(\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}\b/g, m => {
      const digits = m.replace(/\D/g, '');
      if (/^\s*(19|20)\d{2}\s*[-–.\/]\s*(19|20)\d{2}\s*$/.test(m)) return m;   // year range, e.g. 2019-2026
      return digits.length >= 8 ? '[phone]' : m;
    });
    s = s.replace(PERSONAL_LINE, '');
    const full = (name || '').trim();
    if (full) {
      s = s.replace(new RegExp(escRe(full), 'giu'), label);
      for (const part of full.split(/\s+/)) {
        if (part.length >= 3 && !/^(de|da|do|dos|das|del|van|von)$/i.test(part)) {
          s = s.replace(new RegExp('(?<![\\p{L}])' + escRe(part) + '(?![\\p{L}])', 'giu'), label);
        }
      }
    }
    s = s.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return s;
  }
  function prepare(cv, i) {
    const label = 'Candidate ' + IDS[i];
    const text = anonymize(cv.raw, cv.name, label);
    cv.truncated = text.length > MAX_CV_CHARS;
    cv.sent = text.slice(0, MAX_CV_CHARS);
  }

  // ── CV list ──────────────────────────────────────────────────────────────
  function renderCvs() {
    const box = $('cvs'); box.textContent = '';
    cvs.forEach((cv, i) => {
      if (cv.status === 'ok') prepare(cv, i);
      const card = el('div', 'cv');
      const head = el('div', 'cv-head');
      head.appendChild(el('div', 'cv-id', IDS[i]));
      const inp = el('input'); inp.value = cv.name; inp.placeholder = t('cv_name'); inp.title = t('cv_name'); inp.maxLength = 80;
      inp.addEventListener('change', () => { cv.name = inp.value.trim(); renderCvs(); });
      head.appendChild(inp);
      const x = el('button', 'x', '×'); x.type = 'button'; x.title = 'Remove';
      x.addEventListener('click', () => { cvs.splice(i, 1); renderCvs(); });
      head.appendChild(x);
      card.appendChild(head);
      const meta = el('div', 'cv-meta');
      meta.appendChild(el('span', '', cv.file));
      if (cv.status === 'reading') meta.appendChild(el('span', '', t('cv_reading')));
      else if (cv.status === 'error') meta.appendChild(el('span', 'bad', t('cv_err')));
      else if (cv.sent.length < 100) meta.appendChild(el('span', 'bad', t('cv_empty')));
      else {
        meta.appendChild(el('span', '', t('cv_chars')(cv.sent.length)));
        if (cv.truncated) meta.appendChild(el('span', 'warn', t('cv_trunc')));
      }
      card.appendChild(meta);
      if (cv.status === 'ok' && cv.sent.length >= 100) {
        const d = el('details'); d.appendChild(el('summary', '', t('cv_preview'))); d.appendChild(el('pre', '', cv.sent));
        card.appendChild(d);
      }
      box.appendChild(card);
    });
    $('drop').hidden = cvs.length >= MAX_CVS;
  }

  async function addFiles(list) {
    const files = [...list].slice(0, MAX_CVS - cvs.length);
    for (const f of files) {
      const cv = { file: f.name, name: '', raw: '', sent: '', status: 'reading' };
      cvs.push(cv); renderCvs();
      try {
        if (f.size > 15 * 1024 * 1024) throw new Error('too big');
        cv.raw = await extractText(f);
        cv.name = guessName(cv.raw, f.name);
        cv.status = 'ok';
      } catch (e) { cv.status = 'error'; }
      renderCvs();
    }
  }

  // ── Results ──────────────────────────────────────────────────────────────
  function renderResults(ev) {
    current = ev;
    const names = loadNames(ev.id);
    $('results').hidden = false;
    $('res-job').textContent = `${ev.job_title || ''} · ${fmtDate(ev.created_at)}`;
    const sum = $('res-sum'); sum.textContent = '';
    let summary = ev.ranking.summary;
    Object.entries(names).forEach(([id, nm]) => { summary = summary.split('Candidate ' + id).join(nm); });
    sum.appendChild(el('b', '', t('r_summary') + ': ')); sum.appendChild(document.createTextNode(summary));
    const list = $('res-list'); list.textContent = '';
    ev.ranking.candidates.forEach((c, i) => {
      const label = 'Candidate ' + c.id;
      const nm = names[c.id] || (LANG === 'pt' ? 'Candidato ' : LANG === 'es' ? 'Candidato ' : 'Candidate ') + c.id;
      const restore = s => (names[c.id] ? s.split(label).join(names[c.id]) : s);
      const card = el('div', 'cand');
      const top = el('div', 'cand-top');
      top.appendChild(el('div', 'rank', String(i + 1)));
      top.appendChild(el('div', 'cand-name', nm));
      top.appendChild(el('span', 'fit ' + c.fit, t('fit_' + c.fit)));
      top.appendChild(el('div', 'score', String(c.score)));
      card.appendChild(top);
      const tr = el('div', 'track'); const bar = el('i'); bar.style.width = Math.max(2, c.score) + '%'; tr.appendChild(bar); card.appendChild(tr);
      const cols = el('div', 'cols');
      [['s', 'r_strengths', c.strengths], ['g', 'r_gaps', c.gaps]].forEach(([k, key, items]) => {
        const col = el('div'); col.appendChild(el('h4', k, t(key)));
        const ul = el('ul'); (items || []).forEach(s => ul.appendChild(el('li', '', restore(s)))); col.appendChild(ul);
        cols.appendChild(col);
      });
      card.appendChild(cols);
      if (c.evidence && c.evidence.length) card.appendChild(el('div', 'ev', t('r_evidence') + ': “' + c.evidence.map(restore).join('” · “') + '”'));
      list.appendChild(card);
    });
  }

  function renderHistory() {
    const box = $('hist'); box.textContent = '';
    if (!past.length) { box.appendChild(el('p', 'muted small', t('h_none'))); return; }
    past.forEach(ev => {
      const b = el('button'); b.type = 'button';
      b.appendChild(el('span', '', ev.job_title || '—'));
      b.appendChild(el('span', 'muted small', `${t('h_cvs')(ev.cv_count)} · ${fmtDate(ev.created_at)}`));
      b.addEventListener('click', () => { renderResults(ev); $('results').scrollIntoView({ behavior: 'smooth' }); });
      box.appendChild(b);
    });
  }

  function renderMe() {
    $('org-name').textContent = me.organization;
    const c = $('credits'); c.textContent = t('a_credits')(me.credits_remaining); c.classList.toggle('warn', me.credits_remaining <= 1);
    $('until').textContent = me.trial_expires_at ? t('a_until')(fmtDate(me.trial_expires_at)) : '';
    const active = me.credits_remaining > 0 && me.trial_expires_at > Date.now();
    $('new').hidden = !active; $('over').hidden = active;
  }

  function rerender() { if (me) { renderMe(); renderCvs(); renderHistory(); if (current) renderResults(current); } }

  // ── Run ──────────────────────────────────────────────────────────────────
  async function run() {
    const msg = $('run-msg'); msg.hidden = true;
    const job = $('job').value.trim();
    const ready = cvs.filter(c => c.status === 'ok' && c.sent.length >= 100);
    if (job.length < 50) return showMsg(msg, 'err', t('need_job'));
    if (!ready.length) return showMsg(msg, 'err', t('need_cv'));
    // Keep only readable CVs, re-lettered A, B, C… in order.
    cvs = ready; renderCvs();
    const btn = $('run'); btn.disabled = true;
    $('run-label').textContent = t('running');
    const sp = el('span', 'spinner'); btn.prepend(sp);
    try {
      const r = await api('POST', '/api/evaluate', { job, lang: LANG, cvs: cvs.map(c => ({ text: c.sent })) });
      const names = {}; cvs.forEach((c, i) => { if (c.name) names[IDS[i]] = c.name; });
      saveNames(r.id, names);
      const ev = { id: r.id, created_at: r.created_at, job_title: r.job_title, cv_count: cvs.length, ranking: r.ranking };
      past.unshift(ev);
      me.credits_remaining = r.credits_remaining;
      renderMe(); renderHistory(); renderResults(ev);
      cvs = []; renderCvs();
      $('results').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      if (err.status === 401) return gate();
      showMsg(msg, 'err', err.message);
      if (err.code === 'no_credits' || err.code === 'trial_expired') { me.credits_remaining = 0; renderMe(); }
    } finally {
      btn.disabled = false; sp.remove(); $('run-label').textContent = t('b_run');
    }
  }

  // ── Session ──────────────────────────────────────────────────────────────
  function gate(textKey) {
    setSession(null);
    $('loading').hidden = true; $('app').hidden = true; $('signout').hidden = true; $('gate').hidden = false;
    if (textKey) $('gate-text').textContent = textKey;
  }

  async function start() {
    const m = location.hash.match(/token=([A-Za-z0-9_-]{20,100})/);
    if (m) {
      window.history.replaceState(null, '', location.pathname + location.search);
      try { const r = await api('POST', '/api/verify', { token: m[1] }); setSession(r.session); }
      catch (err) { return gate(err.message); }
    }
    if (!getSession()) return gate();
    try {
      me = await api('GET', '/api/me');
      if (me.lang && !new URLSearchParams(location.search).get('lang')) { try { if (!localStorage.getItem(TRIAL.LANG_KEY)) { LANG = me.lang; applyTexts(); } } catch (e) {} }
      const h = await api('GET', '/api/evaluations');
      past = h.evaluations || [];
    } catch (err) { return gate(err.status === 401 ? undefined : err.message); }
    $('loading').hidden = true; $('gate').hidden = true; $('app').hidden = false; $('signout').hidden = false;
    rerender();
  }

  // ── Wiring ───────────────────────────────────────────────────────────────
  const drop = $('drop'), file = $('file');
  drop.addEventListener('click', () => file.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  file.addEventListener('change', () => { addFiles(file.files); file.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));
  $('job').addEventListener('input', () => { $('job-count').textContent = `${$('job').value.length} / ${MAX_JOB}`; });
  $('run').addEventListener('click', run);
  $('print').addEventListener('click', () => window.print());
  $('signout').addEventListener('click', () => { setSession(null); location.href = '../'; });
  $('delete').addEventListener('click', async () => {
    if (!confirm(t('confirm_delete'))) return;
    try { await api('DELETE', '/api/me'); setSession(null); gate(t('deleted')); $('gate-title').textContent = t('deleted'); $('gate-btn').hidden = true; }
    catch (err) { alert(err.message); }
  });

  setupLangButtons(rerender);
  applyTexts();
  start();

})();
