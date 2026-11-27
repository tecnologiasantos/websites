// MRE·AI free trial · authenticated app page
// CVs are read and anonymized here, in the browser. Only anonymized text is sent.
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  // Up to MAX_ROUND CVs per comparison, sent in batches of BATCH (1 comparison each). Ids A … Z, AA … AX.
  const BATCH = 5, MAX_ROUND = 50, MAX_CV_CHARS = 12000, MAX_JOB = 6000, MAX_CRITERIA = 10, MAX_SHARE = 10;
  const IDS = Array.from({ length: MAX_ROUND }, (_, i) => (i < 26 ? '' : 'A') + String.fromCharCode(65 + (i % 26)));
  // A comparison interrupted mid-round: the next run adds the remaining CVs to it (same job text).
  let pending = null;   // { id, job, offset }
  let criteria = [];    // [{ name, required, weight }] for the next new comparison
  // Jobs (Vagas): the company's open positions; currentJob is the one the next new comparison is for.
  let jobs = [], jobsMailbox = null, canSetMailbox = false, showClosed = false, editingJob = null, currentJob = null;
  const offset = () => (pending ? pending.offset : 0);
  let me = null, cvs = [], current = null, past = [], usage = null, team = [], auditEvents = null;
  const isManager = () => me && (me.role === 'owner' || me.role === 'admin');
  const roleName = r => t('role_' + (r === 'owner' ? 'owner' : r === 'admin' ? 'admin' : 'member'));

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
  const looksLikeName = s => /^[\p{L}][\p{L}'.\- ]{2,48}$/u.test(s) && s.split(/\s+/).length >= 2 && s.split(/\s+/).length <= 5;
  function guessName(text, fileName) {
    const found = [];
    // "Nome: Maria Silva" / "Name: ..." / "Nombre: ..."
    const labeled = text.match(/^[ \t]*(?:nome(?: completo)?|full name|name|nombre(?: completo)?)[ \t]*[:\-–][ \t]*(.+)$/im);
    if (labeled) found.push(labeled[1]);
    // First line, also when it carries a title: "Maria Silva - Analista de TI", "Maria Silva | Engenheira"
    const first = text.split('\n').map(s => s.trim()).find(s => s.length > 2) || '';
    found.push(first, first.split(/\s+[-–—|·•,]\s+|\s*[|·•,]\s*/)[0]);
    for (const c of found) { const v = (c || '').trim(); if (looksLikeName(v)) return v; }
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
    const label = 'Candidate ' + IDS[offset() + i];
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
      head.appendChild(el('div', 'cv-id', IDS[offset() + i]));
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
    $('drop').hidden = offset() + cvs.length >= MAX_ROUND;
    runNote();
  }
  // How many comparisons the CVs on the list will use, next to the button.
  function runNote() {
    if (!me) return;
    const n = Math.ceil(cvs.length / BATCH);
    $('run-note').textContent = n > 1 ? t('run_cost')(cvs.length, n)
      : (isPaid() && t('run_note_paid')) || (hasPackOnly() && t('run_note_pack')) || t('run_note');
    $('run-label').textContent = pending ? t('b_continue') : t('b_run');
    $('round-note').hidden = !pending;
    if (pending) $('round-text').textContent = t('round_continue')(pending.title || '', pending.offset);
  }

  async function addFiles(list) {
    const room = MAX_ROUND - offset() - cvs.length;
    const files = [...list].slice(0, Math.max(0, room));
    if (list.length > files.length) showMsg($('run-msg'), 'info', t('cv_limit')(MAX_ROUND));
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
    $('res-job').textContent = `${ev.job_title || ''} · ${fmtDate(ev.created_at)} · ${t('h_cvs')(ev.cv_count)}` +
      (ev.delete_after ? ` · ${t('r_kept')(fmtDate(ev.delete_after))}` : '');
    $('add-cvs').hidden = !canAddTo(ev);
    $('crit-report').hidden = true; renderCritReport(ev);
    $('q-all').hidden = !canEditQ(ev);
    renderPrintHead(ev);
    const sum = $('res-sum'); sum.textContent = '';
    // The model may write the label in the result language: "Candidate A", "Candidato A", "Candidata A".
    const labelRe = id => new RegExp('\\b(?:Candidate|Candidat[oa])\\s+' + id + '\\b', 'g');
    let summary = ev.ranking.summary;
    Object.entries(names).forEach(([id, nm]) => { summary = summary.replace(labelRe(id), () => nm); });
    sum.appendChild(el('b', '', t('r_summary') + ': ')); sum.appendChild(document.createTextNode(summary));
    const list = $('res-list'); list.textContent = '';
    ev.ranking.candidates.forEach((c, i) => {
      const nm = names[c.id] || (LANG === 'pt' ? 'Candidato ' : LANG === 'es' ? 'Candidato ' : 'Candidate ') + c.id;
      const restore = s => (names[c.id] ? s.replace(labelRe(c.id), () => names[c.id]) : s);
      const card = el('div', 'cand'); card.dataset.cand = c.id;
      const top = el('div', 'cand-top');
      top.appendChild(el('div', 'rank', String(i + 1)));
      top.appendChild(el('div', 'cand-name', nm));
      top.appendChild(stageSelect(c.id));
      top.appendChild(el('span', 'fit ' + c.fit, t('fit_' + c.fit)));
      top.appendChild(el('div', 'score', String(c.score)));
      card.appendChild(top);
      const tr = el('div', 'track'); const bar = el('i'); bar.style.width = Math.max(2, c.score) + '%'; tr.appendChild(bar); card.appendChild(tr);
      criteriaBlock(card, ev.ranking.criteria, c);
      const cols = el('div', 'cols');
      [['s', 'r_strengths', c.strengths], ['g', 'r_gaps', c.gaps]].forEach(([k, key, items]) => {
        const col = el('div'); col.appendChild(el('h4', k, t(key)));
        const ul = el('ul'); (items || []).forEach(s => ul.appendChild(el('li', '', restore(s)))); col.appendChild(ul);
        cols.appendChild(col);
      });
      card.appendChild(cols);
      if (c.evidence && c.evidence.length) card.appendChild(el('div', 'ev', t('r_evidence') + ': “' + c.evidence.map(restore).join('” · “') + '”'));
      if ((c.interview_questions && c.interview_questions.length) || canEditQ(ev)) card.appendChild(questionsBlock(c, restore, nm, names[c.id]));
      const sc = el('div', 'sc'); sc.dataset.cand = c.id; card.appendChild(sc);
      list.appendChild(card);
    });
    loadShares(ev);
    loadScorecards(ev);
    loadStages(ev);
  }

  // ── Hiring stage per candidate ──────────────────────────────────────────
  // screening (default) → interview → offer → hired, or rejected / withdrew. Filter chips above the list.
  const STAGES = ['screening', 'interview', 'offer', 'hired', 'rejected', 'withdrew'];
  let stagesMap = {}, stagesFor = null, stageFilter = 'all';
  const stageOf = id => (stagesMap[id] && stagesMap[id].stage) || 'screening';
  async function loadStages(ev) {
    if (stagesFor !== ev.id) { stagesMap = {}; stagesFor = ev.id; stageFilter = 'all'; }
    renderStages();
    try { const r = await api('GET', '/api/stages?evaluation_id=' + encodeURIComponent(ev.id)); if (stagesFor === ev.id) { stagesMap = r.stages || {}; renderStages(); } }
    catch (err) { if (err.status === 401) return gate(); }
  }
  function stageSelect(id) {
    const sel = el('select', 'stage-sel'); sel.dataset.cand = id; sel.setAttribute('aria-label', t('st_label'));
    STAGES.forEach(v => { const o = el('option', '', t('st')[v]); o.value = v; sel.appendChild(o); });
    sel.disabled = !canEditQ(current);
    sel.addEventListener('change', async () => {
      const prev = stageOf(id), v = sel.value;
      stagesMap[id] = { stage: v }; renderStages();
      try { const r = await api('POST', '/api/stages', { evaluation_id: current.id, candidate_id: id, stage: v }); stagesMap[id] = r; renderStages(); }
      catch (err) { if (err.status === 401) return gate(); stagesMap[id] = { stage: prev }; renderStages(); showMsg($('q-all-msg'), 'err', err.message); }
    });
    return sel;
  }
  function renderStages() {
    document.querySelectorAll('#res-list .stage-sel').forEach(sel => {
      const st = stageOf(sel.dataset.cand); sel.value = st; sel.className = 'stage-sel st-' + st;
      const info = stagesMap[sel.dataset.cand];
      sel.title = info && info.updated_by_name ? t('st_by')(info.updated_by_name, fmtDate(info.updated_at)) : t('st_label');
    });
    const bar = $('stage-filter'); if (!bar || !current) return;
    bar.textContent = '';
    const counts = { all: current.ranking.candidates.length };
    current.ranking.candidates.forEach(c => { const st = stageOf(c.id); counts[st] = (counts[st] || 0) + 1; });
    if (stageFilter !== 'all' && !counts[stageFilter]) stageFilter = 'all';
    ['all', ...STAGES].forEach(v => {
      if (v !== 'all' && !counts[v]) return;
      const b = el('button', 'chip' + (stageFilter === v ? ' on' : ''), `${v === 'all' ? t('st_all') : t('st')[v]} (${counts[v]})`); b.type = 'button';
      b.addEventListener('click', () => { stageFilter = v; renderStages(); });
      bar.appendChild(b);
    });
    bar.hidden = Object.keys(counts).length <= 2;   // only "all" and "screening": nothing to filter yet
    document.querySelectorAll('#res-list .cand').forEach(card => { card.hidden = stageFilter !== 'all' && stageOf(card.dataset.cand) !== stageFilter; });
  }

  // ── Interview scorecards ────────────────────────────────────────────────
  // Each person who sees the comparison fills one scorecard per candidate; everyone sees all of them.
  let cards = null, cardsFor = null, openCard = null;
  async function loadScorecards(ev) {
    if (cardsFor !== ev.id) { cards = null; cardsFor = ev.id; }
    renderScorecards();
    try { const r = await api('GET', '/api/scorecards?evaluation_id=' + encodeURIComponent(ev.id)); if (cardsFor === ev.id) { cards = r; renderScorecards(); } }
    catch (err) { if (err.status === 401) return gate(); }
  }
  const labelRe2 = id => new RegExp('\\b(?:Candidate|Candidat[oa])\\s+' + id + '\\b', 'g');
  function renderScorecards() {
    if (!current) return;
    const names = loadNames(current.id);
    document.querySelectorAll('#res-list .sc').forEach(box => {
      const id = box.dataset.cand, c = current.ranking.candidates.find(x => x.id === id);
      if (!c) return;
      const restore = x => (names[id] ? String(x || '').replace(labelRe2(id), () => names[id]) : String(x || ''));
      box.textContent = '';
      const list = cards ? cards.scorecards.filter(x => x.candidate_id === id) : [];
      const sum = cards && cards.summary[id];
      const head = el('div', 'sc-head');
      head.appendChild(el('b', '', t('sc_title')));
      head.appendChild(el('span', 'muted small', sum ? t('sc_sum')(sum.count, sum.average.toLocaleString(LANG === 'en' ? 'en' : LANG === 'pt' ? 'pt-BR' : 'es'), sum.advance, sum.maybe, sum.reject) : t('sc_none')));
      const mine = list.find(x => x.mine);
      const fill = el('button', 'btn btn-ghost btn-sm no-print', mine ? t('sc_edit') : t('sc_fill')); fill.type = 'button';
      fill.addEventListener('click', () => { openCard = id; box.querySelector('.sc-form') || box.appendChild(scorecardForm(c, mine, restore, names[id])); fill.hidden = true; });
      head.appendChild(fill);
      box.appendChild(head);
      if (list.length) {
        const d = el('details', 'sc-list'); d.appendChild(el('summary', '', t('sc_see')(list.length)));
        list.forEach(x => {
          const it = el('div', 'sc-item');
          const top = el('div', 'sc-top');
          top.appendChild(el('b', '', x.interviewer_name || '—'));
          top.appendChild(el('span', 'sc-stars', '★'.repeat(x.overall) + '☆'.repeat(5 - x.overall)));
          top.appendChild(el('span', 'dec ' + x.recommendation, t('dec')[x.recommendation]));
          top.appendChild(el('span', 'muted small', fmtDate(x.updated_at)));
          if (x.can_delete) {
            const del = el('button', 'btn btn-ghost btn-sm no-print', t('sc_delete')); del.type = 'button';
            del.addEventListener('click', () => askConfirm({ title: t('sc_delete'), text: t('sc_del_text'), ok: t('sc_delete'), danger: true,
              action: async () => { await api('POST', '/api/scorecards/delete', { id: x.id }); await loadScorecards(current); } }));
            top.appendChild(del);
          }
          it.appendChild(top);
          if (x.notes) it.appendChild(el('p', 'small', restore(x.notes)));
          const ans = (x.answers || []).filter(a => a.rating || a.note);
          if (ans.length) {
            const ul = el('ul', 'small');
            ans.forEach(a => ul.appendChild(el('li', '', `${restore(a.q)}${a.rating ? ` — ${a.rating}/5` : ''}${a.note ? ` · ${restore(a.note)}` : ''}`)));
            it.appendChild(ul);
          }
          d.appendChild(it);
        });
        box.appendChild(d);
      }
      if (openCard === id && !box.querySelector('.sc-form')) { box.appendChild(scorecardForm(c, mine, restore, names[id])); fill.hidden = true; }
    });
  }
  // Pills 1–5 as radio buttons (keyboard friendly).
  function ratingPills(name, value, onPick) {
    const g = el('div', 'sc-pills'); g.setAttribute('role', 'radiogroup');
    for (let v = 1; v <= 5; v++) {
      const lab = el('label', 'sc-pill'); lab.title = t('sc_scale')[v];
      const r = el('input'); r.type = 'radio'; r.name = name; r.value = v; r.checked = value === v;
      r.addEventListener('change', () => onPick(v));
      lab.appendChild(r); lab.appendChild(el('span', '', String(v)));
      g.appendChild(lab);
    }
    return g;
  }
  let formSeq = 0;
  function scorecardForm(c, mine, restore, typedName) {
    const f = el('div', 'sc-form'), seq = ++formSeq;
    const unname = x => (typedName ? x.split(typedName).join('Candidate ' + c.id) : x);
    const prevAns = Object.fromEntries(((mine && mine.answers) || []).map(a => [a.q, a]));
    const state = { overall: mine ? mine.overall : null, recommendation: mine ? mine.recommendation : null,
      answers: (c.interview_questions || []).map(q => ({ q: q.q, rating: prevAns[q.q] ? prevAns[q.q].rating : null, note: prevAns[q.q] && prevAns[q.q].note ? restore(prevAns[q.q].note) : '' })) };
    state.answers.forEach((a, i) => {
      const row = el('div', 'sc-q');
      row.appendChild(el('div', 'sc-qt', `${i + 1}. ${restore(a.q)}`));
      const line = el('div', 'sc-line');
      line.appendChild(ratingPills(`sc${seq}q${i}`, a.rating, v => { a.rating = v; }));
      const n = el('input'); n.maxLength = 500; n.placeholder = t('sc_note_ph'); n.value = a.note;
      n.addEventListener('input', () => { a.note = n.value; });
      line.appendChild(n); row.appendChild(line); f.appendChild(row);
    });
    const ov = el('div', 'sc-q'); ov.appendChild(el('div', 'sc-qt', t('sc_overall')));
    ov.appendChild(ratingPills(`sc${seq}ov`, state.overall, v => { state.overall = v; })); f.appendChild(ov);
    const rec = el('div', 'sc-q'); rec.appendChild(el('div', 'sc-qt', t('sc_rec')));
    const rg = el('div', 'sc-pills');
    ['advance', 'maybe', 'reject'].forEach(v => {
      const lab = el('label', 'sc-pill wide'); const r = el('input'); r.type = 'radio'; r.name = `sc${seq}rec`; r.value = v; r.checked = state.recommendation === v;
      r.addEventListener('change', () => { state.recommendation = v; });
      lab.appendChild(r); lab.appendChild(el('span', '', t('dec')[v])); rg.appendChild(lab);
    });
    rec.appendChild(rg); f.appendChild(rec);
    const notes = el('textarea'); notes.maxLength = 2000; notes.rows = 3; notes.placeholder = t('sc_notes'); notes.value = mine && mine.notes ? restore(mine.notes) : '';
    f.appendChild(notes);
    f.appendChild(el('p', 'muted small', t('sc_privacy')));
    const msg = el('div', 'msg'); msg.hidden = true;
    const bar = el('div', 'iq-acts');
    const save = el('button', 'btn btn-primary btn-sm', t('q_save')); save.type = 'button';
    save.addEventListener('click', async () => {
      if (!state.overall || !state.recommendation) return showMsg(msg, 'err', t('sc_need'));
      save.disabled = true;
      try {
        await api('POST', '/api/scorecards', { evaluation_id: current.id, candidate_id: c.id, overall: state.overall, recommendation: state.recommendation,
          notes: unname(notes.value.trim()), answers: state.answers.map(a => ({ q: a.q, rating: a.rating, note: unname((a.note || '').trim()) })) });
        openCard = null; await loadScorecards(current);
      } catch (err) { if (err.status === 401) return gate(); showMsg(msg, 'err', err.message); save.disabled = false; }
    });
    const cancel = el('button', 'btn btn-ghost btn-sm', t('q_cancel')); cancel.type = 'button';
    cancel.addEventListener('click', () => { openCard = null; renderScorecards(); });
    bar.appendChild(save); bar.appendChild(cancel); f.appendChild(bar); f.appendChild(msg);
    return f;
  }

  // ── Export: CSV for Excel / Google Sheets, and the print header for the PDF ─
  // Built here from what the page already has (names typed by the recruiter stay in this browser).
  // Every answer of every link, per candidate (a panel can answer the same link).
  function allAnswers() {
    const out = {};
    (shares || []).forEach(sl => (sl.responses || []).forEach(a => { (out[a.candidate_id] || (out[a.candidate_id] = [])).push(a); }));
    return out;
  }
  // "3 reviewers · Advance 2 · Maybe 1 · average 4.3"
  function panelSummary(list) {
    const n = k => list.filter(a => a.decision === k).length;
    const rated = list.filter(a => a.overall);
    const avg = rated.length ? Math.round(rated.reduce((x, a) => x + a.overall, 0) / rated.length * 10) / 10 : null;
    return t('panel_sum')(list.length, n('advance'), n('maybe'), n('reject'),
      avg === null ? null : avg.toLocaleString(LANG === 'en' ? 'en' : LANG === 'pt' ? 'pt-BR' : 'es'));
  }
  // Excel reads ';' in Portuguese and Spanish locales, ',' in English. A leading = + - @ would run as a formula: neutralize it.
  const csvCell = v => {
    let x = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(x)) x = "'" + x;
    return '"' + x.replace(/"/g, '""') + '"';
  };
  function exportCsv() {
    const ev = current; if (!ev) return;
    const names = loadNames(ev.id), crit = ev.ranking.criteria || [], answers = allAnswers();
    const labelRe = id => new RegExp('\\b(?:Candidate|Candidat[oa])\\s+' + id + '\\b', 'g');
    const H = t('csv_h');
    const head = [H.rank, H.candidate, H.stage, H.score, H.fit, ...crit.map(k => `${k.name} (${k.required ? t('cr_required') : t('cr_w')[k.weight]})`),
      H.ko, H.strengths, H.gaps, H.evidence, H.questions, H.decision, H.comment, H.interviews, H.average, H.recs];
    const rows = ev.ranking.candidates.map((c, i) => {
      const nm = names[c.id] || (LANG === 'en' ? 'Candidate ' : 'Candidato ') + c.id;
      const restore = x => (names[c.id] ? String(x).replace(labelRe(c.id), () => names[c.id]) : String(x));
      const byId = Object.fromEntries((c.criteria || []).map(r => [r.id, r.rating]));
      const a = answers[c.id];
      return [i + 1, nm, stagesFor === ev.id ? t('st')[stageOf(c.id)] : '', c.score, t('fit_' + c.fit), ...crit.map(k => (byId[k.id] === undefined ? '' : `${byId[k.id]}/4`)),
        (c.knockout_failed || []).map(id => (crit.find(k => k.id === id) || {}).name || id).join('; '),
        (c.strengths || []).map(restore).join('; '), (c.gaps || []).map(restore).join('; '), (c.evidence || []).map(restore).join('; '),
        (c.interview_questions || []).map(q => restore(q.q)).join(' | '),
        a ? (a.length > 1 ? panelSummary(a) + ' — ' : '') + a.map(x => `${x.reviewer_name || '—'}: ${t('dec')[x.decision]}${x.overall ? ` (${x.overall}/5)` : ''}`).join('; ') : '',
        a ? a.filter(x => x.comment).map(x => `${x.reviewer_name || '—'}: ${x.comment}`).join(' | ') : '',
        ...(() => { const sm = cards && cardsFor === ev.id && cards.summary[c.id];
          return sm ? [sm.count, sm.average, `${t('dec').advance}: ${sm.advance}; ${t('dec').maybe}: ${sm.maybe}; ${t('dec').reject}: ${sm.reject}`] : ['', '', '']; })()];
    });
    const sep = LANG === 'en' ? ',' : ';';
    const text = '\ufeff' + [head, ...rows].map(r => r.map(csvCell).join(sep)).join('\r\n');
    const slug = (ev.job_title || 'ranking').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40).toLowerCase();
    const a = el('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = `mre-ai_${slug || 'ranking'}_${new Date(ev.created_at).toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  // Printed header: company, job, date, number of CVs and the criteria with their weights.
  function renderPrintHead(ev) {
    const box = $('print-head'); box.textContent = '';
    box.appendChild(el('div', 'ph-brand', 'MRE·AI · ' + (me ? me.organization : '')));
    box.appendChild(el('h3', '', ev.job_title || ''));
    box.appendChild(el('div', 'muted small', `${fmtDate(ev.created_at)} · ${t('h_cvs')(ev.cv_count)}` + (ev.author && ev.author.name ? ` · ${ev.author.name}` : '')));
    const crit = ev.ranking.criteria || [];
    if (crit.length) box.appendChild(el('div', 'small', `${t('r_criteria')}: ` + crit.map(k => `${k.name} (${k.required ? t('cr_required') : t('cr_w')[k.weight]})`).join(' · ')));
  }

  // Saved jobs: more CVs can be added to a comparison whose job text was saved (from 27 Nov 2026),
  // by its author or a manager, until it holds MAX_ROUND CVs.
  const canAddTo = ev => !!(ev && ev.has_job && ev.cv_count < MAX_ROUND && ((ev.author && ev.author.mine) || isManager()));
  async function addToJob() {
    const ev = current; if (!canAddTo(ev)) return;
    const btn = $('add-cvs'); btn.disabled = true;
    try {
      const r = await api('GET', '/api/evaluations/job?id=' + encodeURIComponent(ev.id));
      $('job').value = r.job; $('job').dispatchEvent(new Event('input'));
      jx = null; renderJx();
      pending = { id: ev.id, job: r.job.trim(), offset: ev.cv_count, title: ev.job_title };
      cvs = []; renderCvs(); renderCriteria();
      $('run-msg').hidden = true;
      $('new').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      if (err.status === 401) return gate();
      showMsg($('run-msg'), 'err', err.message);
    } finally { btn.disabled = false; }
  }
  function newJob() {
    setCurrentJob(null);
    pending = null; $('job').value = ''; $('job').dispatchEvent(new Event('input'));
    cvs = []; criteria = []; renderCvs(); renderCriteria(); $('job').focus();
  }

  // Criteria ratings and knock-outs of a candidate (comparisons with criteria only).
  function criteriaBlock(card, list, c) {
    if (!list || !list.length || !c.criteria) return;
    const name = id => (list.find(k => k.id === id) || {}).name || id;
    if (c.knockout_failed && c.knockout_failed.length) card.appendChild(el('div', 'ko', '⚠ ' + t('r_ko')(c.knockout_failed.map(name).join(', '))));
    const box = el('div', 'crit-list'); box.setAttribute('aria-label', t('r_criteria'));
    c.criteria.forEach(r => {
      const k = list.find(x => x.id === r.id); if (!k) return;
      const chip = el('span', 'crit r' + r.rating + (k.required ? ' req' : ''));
      chip.title = `${k.name}: ${t('cr_r')[r.rating]}`;
      chip.appendChild(el('span', 'dots', '●'.repeat(r.rating) + '○'.repeat(4 - r.rating)));
      chip.appendChild(document.createTextNode(' ' + k.name));
      box.appendChild(chip);
    });
    card.appendChild(box);
  }

  // Interview questions per candidate (comparisons made before 2026-11-24 have none).
  // The author of the comparison or a manager can edit them (saved for the whole team and the hiring manager).
  const canEditQ = ev => !!(ev && ((ev.author && ev.author.mine) || isManager()));
  let openQ = null;   // candidate whose questions stay open after saving
  function questionsBlock(c, restore, name, typedName) {
    const qs = c.interview_questions || [];
    const d = el('details', 'iq');
    if (openQ === c.id) d.open = true;
    d.appendChild(el('summary', '', `${t('r_questions')} (${qs.length})`));
    const view = el('div');
    const ol = el('ol');
    qs.forEach(q => {
      const li = el('li');
      li.appendChild(el('span', 'qt', (t('q_type') || {})[q.type] || q.type));
      li.appendChild(document.createTextNode(restore(q.q)));
      if (q.good_answer) li.appendChild(el('span', 'qa', `${t('r_good')}: ${restore(q.good_answer)}`));
      ol.appendChild(li);
    });
    view.appendChild(ol);
    const acts = el('div', 'iq-acts');
    if (qs.length) {
      const b = el('button', 'btn btn-ghost btn-sm copy', t('b_copy_q')); b.type = 'button';
      b.addEventListener('click', () => copyText(
        `${name}\n` + qs.map((q, i) => `${i + 1}. ${restore(q.q)}` + (q.good_answer ? `\n   ${t('r_good')}: ${restore(q.good_answer)}` : '')).join('\n'), b));
      acts.appendChild(b);
    }
    if (canEditQ(current)) {
      const e = el('button', 'btn btn-ghost btn-sm copy', qs.length ? t('b_edit_q') : t('b_add_qs')); e.type = 'button';
      e.addEventListener('click', () => { view.hidden = true; d.appendChild(questionsEditor(c, restore, typedName, () => { view.hidden = false; })); });
      acts.appendChild(e);
    }
    view.appendChild(acts);
    d.appendChild(view);
    return d;
  }
  // Names typed by the recruiter stay in this browser: shown in the editor, turned back into "Candidate X" before saving.
  function questionsEditor(c, restore, typedName, onClose) {
    const box = el('div', 'iq-edit');
    const unname = x => (typedName ? x.split(typedName).join('Candidate ' + c.id) : x);
    const rows = (c.interview_questions || []).map(q => ({ ...q, q: restore(q.q), good_answer: restore(q.good_answer || '') }));
    const list = el('div'), msg = el('div', 'msg'); msg.hidden = true;
    const draw = () => {
      list.textContent = '';
      rows.forEach((r, i) => {
        const row = el('div', 'iq-row');
        const sel = el('select'); sel.setAttribute('aria-label', t('r_questions'));
        ['verify', 'gap', 'behavioral', 'custom'].forEach(v => { const o = el('option', '', t('q_type')[v]); o.value = v; o.selected = r.type === v; sel.appendChild(o); });
        sel.addEventListener('change', () => { r.type = sel.value; });
        const q = el('textarea'); q.rows = 2; q.maxLength = 300; q.value = r.q; q.placeholder = t('q_ph');
        q.addEventListener('input', () => { r.q = q.value; });
        const g = el('input'); g.maxLength = 200; g.value = r.good_answer || ''; g.placeholder = t('qa_ph');
        g.addEventListener('input', () => { r.good_answer = g.value; });
        const x = el('button', 'x', '×'); x.type = 'button'; x.title = t('cr_remove');
        x.addEventListener('click', () => { rows.splice(i, 1); draw(); });
        const main = el('div', 'iq-main'); main.appendChild(q); main.appendChild(g);
        row.appendChild(sel); row.appendChild(main); row.appendChild(x);
        list.appendChild(row);
      });
      add.disabled = rows.length >= 8;
    };
    const bar = el('div', 'iq-acts');
    const add = el('button', 'btn btn-ghost btn-sm', t('b_add_q')); add.type = 'button';
    add.addEventListener('click', () => { rows.push({ q: '', type: 'custom', good_answer: '' }); draw(); const ts = list.querySelectorAll('textarea'); ts[ts.length - 1].focus(); });
    const sug = el('button', 'btn btn-ghost btn-sm', t('b_suggest_q')); sug.type = 'button';
    sug.addEventListener('click', async () => {
      sug.disabled = true; msg.hidden = true;
      try {
        const r = await api('POST', '/api/evaluations/questions/suggest', { evaluation_id: current.id, candidate_id: c.id, lang: LANG });
        r.questions.forEach(q => { if (rows.length < 8) rows.push({ ...q, q: restore(q.q), good_answer: restore(q.good_answer || '') }); });
        draw(); showMsg(msg, 'info', t('q_suggested'));
      } catch (err) { if (err.status === 401) return gate(); showMsg(msg, 'err', err.message); }
      finally { sug.disabled = false; }
    });
    const save = el('button', 'btn btn-primary btn-sm', t('q_save')); save.type = 'button';
    save.addEventListener('click', async () => {
      save.disabled = true; msg.hidden = true;
      try {
        const qs = rows.filter(r => r.q.trim()).map(r => ({ q: unname(r.q.trim()), type: r.type, good_answer: unname((r.good_answer || '').trim()) }));
        const r = await api('POST', '/api/evaluations/questions', { evaluation_id: current.id, candidate_id: c.id, questions: qs });
        applyRanking(r.ranking); openQ = c.id; renderResults(current);
      } catch (err) { if (err.status === 401) return gate(); showMsg(msg, 'err', err.message); save.disabled = false; }
    });
    const cancel = el('button', 'btn btn-ghost btn-sm', t('q_cancel')); cancel.type = 'button';
    cancel.addEventListener('click', () => { box.remove(); onClose(); });
    bar.appendChild(add); bar.appendChild(sug); bar.appendChild(save); bar.appendChild(cancel);
    box.appendChild(list); box.appendChild(bar); box.appendChild(msg);
    draw();
    return box;
  }
  // A ranking changed on the server (questions edited): update the open comparison and the history.
  function applyRanking(ranking) {
    current.ranking = ranking;
    const p = past.find(x => x.id === current.id); if (p) p.ranking = ranking;
  }
  // One question for every candidate of the comparison (e.g. a standard question of the company).
  async function addQuestionToAll() {
    const inp = $('q-all-text'), msg = $('q-all-msg'); msg.hidden = true;
    const text = inp.value.trim(); if (!text || !current) return;
    const btn = $('q-all-btn'); btn.disabled = true;
    try {
      const r = await api('POST', '/api/evaluations/questions', { evaluation_id: current.id, add_to_all: { q: text, type: 'custom' } });
      applyRanking(r.ranking); renderResults(current); inp.value = '';
      showMsg($('q-all-msg'), 'ok', t('q_all_done')(r.changed));
    } catch (err) { if (err.status === 401) return gate(); showMsg(msg, 'err', err.message); }
    finally { btn.disabled = false; }
  }
  async function copyText(text, btn) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const a = el('textarea'); a.value = text; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (x) {} a.remove(); }
    if (btn) { const old = btn.textContent; btn.textContent = t('ok_copied'); setTimeout(() => { btn.textContent = old; }, 1600); }
  }

  // ── Shortlists shared with hiring managers ───────────────────────────────
  let shares = null, sharesFor = null;
  async function loadShares(ev) {
    if (sharesFor !== ev.id) { shares = null; sharesFor = ev.id; renderShares(); }
    try { const r = await api('GET', '/api/shortlists?evaluation_id=' + encodeURIComponent(ev.id)); if (sharesFor === ev.id) { shares = r.shortlists || []; renderShares(); } }
    catch (err) { if (err.status === 401) return gate(); shares = []; renderShares(); }
  }
  function renderShares() {
    const box = $('share-list'); box.textContent = '';
    $('shares').hidden = !(shares && shares.length && current);
    if ($('shares').hidden) return;
    const names = loadNames(current.id);
    const nameOf = (id, label) => label || names[id] || (LANG === 'en' ? 'Candidate ' : 'Candidato ') + id;
    shares.forEach(sl => {
      const card = el('div', 'share');
      const top = el('div', 'share-top');
      const state = sl.revoked ? t('sh_revoked') : !sl.active ? t('sh_expired')
        : [t('sh_until')(fmtDate(sl.expires_at)), sl.viewed_at ? t('sh_viewed')(fmtDate(sl.viewed_at)) : t('sh_not_viewed')].join(' · ');
      top.appendChild(el('span', 'muted', `${t('sh_by')(sl.mine ? t('role_you') : sl.author_name || t('h_removed'))} · ${fmtDate(sl.created_at)} · ${state}`));
      if (sl.can_revoke) {
        const b = el('button', 'btn btn-ghost btn-sm', t('b_revoke')); b.type = 'button';
        b.addEventListener('click', () => askConfirm({ title: t('cf_revoke_title'), text: t('cf_revoke_text'), ok: t('b_revoke'), danger: true,
          action: async () => { await api('POST', '/api/shortlists/revoke', { id: sl.id }); await loadShares(current); } }));
        top.appendChild(b);
      }
      card.appendChild(top);
      const ul = el('ul');
      sl.candidates.forEach(cand => {
        const li = el('li'); li.appendChild(el('b', '', nameOf(cand.id, cand.label)));
        // A panel can answer the same link: one line per reviewer, and the consensus when there are several.
        const all = sl.responses.filter(r => r.candidate_id === cand.id);
        if (!all.length) li.appendChild(el('span', 'muted small', ' — ' + t('sh_waiting')));
        else {
          if (all.length > 1) li.appendChild(el('span', 'muted small', ' — ' + panelSummary(all)));
          const sub = el('ul', 'panel');
          all.forEach(a => {
            const it = el('li');
            it.appendChild(el('span', 'dec ' + a.decision, t('dec')[a.decision]));
            it.appendChild(el('span', 'muted small', ' ' + t('sh_answer_by')(a.reviewer_name || '—') + (a.overall ? ` · ${a.overall}/5` : '') + (a.comment ? ` — “${a.comment}”` : '')));
            sub.appendChild(it);
          });
          li.appendChild(sub);
        }
        ul.appendChild(li);
      });
      card.appendChild(ul);
      box.appendChild(card);
    });
  }

  const shDlg = $('sh-dlg');
  function openShare() {
    if (!current) return;
    const names = loadNames(current.id);
    const pick = $('sh-pick'); pick.textContent = '';
    current.ranking.candidates.forEach((c, i) => {
      const lab = el('label', 'check'); lab.style.marginBottom = '0';
      const box = el('input'); box.type = 'checkbox'; box.value = c.id; box.checked = i < 3;
      lab.appendChild(box);
      lab.appendChild(el('span', '', `${i + 1}. ${names[c.id] || (LANG === 'en' ? 'Candidate ' : 'Candidato ') + c.id} · ${c.score}`));
      pick.appendChild(lab);
    });
    $('sh-names').checked = false; $('sh-names').disabled = !Object.keys(names).length;
    $('sh-evidence').checked = true; $('sh-note').value = '';
    $('sh-form').hidden = false; $('sh-done').hidden = true; $('sh-ok').hidden = false; $('sh-msg').hidden = true;
    if (shDlg.showModal) shDlg.showModal();
  }
  $('share').addEventListener('click', openShare);
  $('sh-cancel').addEventListener('click', () => shDlg.close());
  $('sh-ok').addEventListener('click', async () => {
    const ids = [...$('sh-pick').querySelectorAll('input:checked')].map(x => x.value);
    if (!ids.length) return showMsg($('sh-msg'), 'err', t('sh_need'));
    if (ids.length > MAX_SHARE) return showMsg($('sh-msg'), 'err', t('sh_max')(MAX_SHARE));
    const names = loadNames(current.id), withNames = $('sh-names').checked;
    $('sh-ok').disabled = true; $('sh-msg').hidden = true;
    try {
      const r = await api('POST', '/api/shortlists', { evaluation_id: current.id, lang: LANG, note: $('sh-note').value.trim(),
        show_evidence: $('sh-evidence').checked, candidates: ids.map(id => ({ id, label: withNames && names[id] ? names[id] : undefined })) });
      $('sh-form').hidden = true; $('sh-ok').hidden = true; $('sh-done').hidden = false;
      $('sh-ready').textContent = t('sh_ready')(fmtDate(r.expires_at));
      $('sh-url').value = r.url; $('sh-url').select();
      loadShares(current);
    } catch (err) {
      if (err.status === 401) { shDlg.close(); return gate(); }
      showMsg($('sh-msg'), 'err', err.message);
    } finally { $('sh-ok').disabled = false; }
  });
  $('sh-copy').addEventListener('click', e => copyText($('sh-url').value, e.currentTarget));

  // ── Refer and earn ───────────────────────────────────────────────────────
  let referral = null;
  async function loadReferral() {
    try { referral = await api('GET', '/api/referral'); renderReferral(); } catch (e) { $('referral').hidden = true; }
  }
  function renderReferral() {
    if (!referral || !t('ref_title')) { $('referral').hidden = true; return; }
    $('referral').hidden = false;
    $('ref-lead').textContent = t('ref_lead')(referral.bonus_referrer, referral.bonus_referred, referral.bonus_days, referral.max);
    $('ref-url').value = referral.url;
    $('ref-stats').textContent = t('ref_stats')(referral.rewarded, referral.max, referral.pending);
  }
  $('ref-copy').addEventListener('click', e => copyText(referral ? referral.url : '', e.currentTarget));
  $('ref-copy-msg').addEventListener('click', e => copyText(referral ? t('ref_msg')(referral.url) : '', e.currentTarget));

  // ── Promo code (owners and admins): bonus comparisons, spent after the monthly ones ──
  function renderBonus() {
    $('bonus').hidden = !(me && isManager() && !me.needs_consent && t('bn_title'));
    $('bn-code').placeholder = t('bn_ph') || '';
    renderBonusMine();
  }
  // What the company received: the balance still available and a short history.
  function renderBonusMine() {
    const box = $('bn-mine'), list = (me && me.bonuses) || [];
    box.hidden = !list.length || !t('bn_hist');
    if (box.hidden) return;
    const now = Date.now();
    const src = b => b.source === 'code' && b.code ? t('bn_src_code')(b.code) : t('bn_src_team');
    const active = list.filter(b => !b.revoked && b.expires_at > now);
    const packLeft = me.pack_expires_at > now ? (me.pack_credits || 0) : 0;
    const n = Math.min(packLeft, active.reduce((a, b) => a + b.comparisons, 0));
    const have = $('bn-have');
    have.hidden = !(n > 0);
    if (n > 0) have.textContent = t('bn_have')(n, fmtDate(me.pack_expires_at), [...new Set(active.map(src))].join(', '));
    $('bn-hist-t').textContent = t('bn_hist');
    const ul = $('bn-hist'); ul.textContent = '';
    list.forEach(b => {
      const st = b.revoked ? t('bn_st').revoked : b.expires_at > now ? t('bn_st').until(fmtDate(b.expires_at)) : t('bn_st').expired(fmtDate(b.expires_at));
      ul.appendChild(el('li', '', t('bn_item')(fmtDate(b.received_at), src(b), b.comparisons) + ' · ' + st));
    });
  }
  $('bn-form').addEventListener('submit', async e => {
    e.preventDefault();
    const code = $('bn-code').value.trim();
    if (!code) return;
    $('bn-btn').disabled = true; $('bn-msg').hidden = true;
    try {
      const r = await api('POST', '/api/bonus/redeem', { code });
      me.pack_credits = r.pack_credits; me.pack_expires_at = r.pack_expires_at;
      try { me = await api('GET', '/api/me'); } catch (e) { /* keep the local numbers */ }
      showMsg($('bn-msg'), 'ok', t('bn_ok')(r.comparisons, fmtDate(r.pack_expires_at)));
      $('bn-code').value = '';
      renderMe();
    } catch (err) {
      if (err.status === 401) return gate();
      const m = t('bn_err') || {};
      showMsg($('bn-msg'), 'err', m[err.code] || err.message);
    } finally { $('bn-btn').disabled = false; }
  });

  function renderHistory() {
    const box = $('hist'); box.textContent = '';
    const u = $('usage'); u.textContent = ''; u.hidden = !(isManager() && usage && usage.total);
    if (!u.hidden) {
      u.appendChild(el('b', '', t('u_title') + ' · ' + t('u_total')(usage.total)));
      const ul = el('ul');
      usage.by_user.forEach(r => {
        const li = el('li');
        li.appendChild(el('span', '', (r.name || t('h_removed')) + (r.email ? ' · ' + r.email : '')));
        li.appendChild(el('span', 'muted', t('t_evals')(r.count)));
        ul.appendChild(li);
      });
      u.appendChild(ul);
    }
    if (!past.length) { box.appendChild(el('p', 'muted small', t('h_none'))); return; }
    past.forEach(ev => {
      const b = el('button'); b.type = 'button';
      b.appendChild(el('span', '', ev.job_title || '—'));
      const meta = el('span', 'muted small');
      if (isManager() && ev.author) {
        const who = ev.author.mine ? t('role_you') : (ev.author.name || ev.author.email || t('h_removed'));
        const by = el('span', 'by', t('h_by')(who)); if (ev.author.email) by.title = ev.author.email;
        meta.appendChild(by); meta.appendChild(document.createTextNode(' · '));
      }
      const st = Object.entries(ev.stages || {}).filter(([k]) => k !== 'screening').map(([k, n]) => `${n} ${t('st')[k].toLowerCase()}`).join(', ');
      meta.appendChild(document.createTextNode(`${t('h_cvs')(ev.cv_count)} · ${fmtDate(ev.created_at)}` + (st ? ` · ${st}` : '')));
      b.appendChild(meta);
      b.addEventListener('click', () => { renderResults(ev); $('results').scrollIntoView({ behavior: 'smooth' }); });
      box.appendChild(b);
    });
  }

  // Comparisons the company can use now: this month's (or the trial's) plus an unexpired pack.
  const creditsLeft = () => (me.trial_expires_at > Date.now() ? me.credits_remaining : 0) +
    (me.pack_expires_at > Date.now() ? (me.pack_credits || 0) : 0);
  const isPaid = () => me.plan && me.plan !== 'trial' && me.plan !== 'canceled' && me.plan !== 'pilot';
  // A bought pack without a paid plan: the page stops calling itself a free trial.
  const hasPackOnly = () => !isPaid() && me.pack_expires_at > Date.now() && (me.pack_credits || 0) > 0 && !!t('s_label_pack');

  // ── Features for paid plans (deployed off; the Worker says which are on in me.features) ──
  const feat = k => !!(me && me.features && me.features[k]);
  // Leadership dashboard (account holder and administrators)
  let inDays = 30;
  async function loadInsights() {
    const box = $('insights');
    box.hidden = !(feat('leadership') && isManager());
    if (box.hidden) return;
    const per = $('in-period'); per.textContent = '';
    [30, 90].forEach(d => { const b = el('button', 'chip' + (inDays === d ? ' on' : ''), t('in_days')(d)); b.type = 'button';
      b.addEventListener('click', () => { inDays = d; loadInsights(); }); per.appendChild(b); });
    try {
      const r = await api('GET', '/api/insights?days=' + inDays);
      const cards = $('in-cards'); cards.textContent = '';
      const num = n => (n === null || n === undefined ? '—' : Number(n).toLocaleString(LANG === 'en' ? 'en' : LANG === 'pt' ? 'pt-BR' : 'es'));
      const card = (label, value, sub) => { const c = el('div', 'in-card'); c.appendChild(el('b', '', value)); c.appendChild(el('span', '', label)); if (sub) c.appendChild(el('span', 'muted small', sub)); cards.appendChild(c); };
      card(t('in_cvs'), num(r.cvs_evaluated), t('in_comparisons')(num(r.comparisons_used)));
      card(t('in_saved'), num(r.hours_saved) + ' h', t('in_saved_sub')(r.minutes_per_cv));
      card(t('in_jobs'), num(r.active_jobs), t('in_cands')(num(r.active_candidates)));
      card(t('in_interviews'), num(r.interviews), r.interview_avg ? t('in_avg')(num(r.interview_avg)) : '');
      card(t('in_hired'), num(r.hired), Object.entries(r.stages || {}).map(([k, n]) => `${t('st')[k]} ${n}`).join(' · '));
      card(t('in_links'), `${num(r.links_answered)}/${num(r.links_shared)}`, r.answer_hours !== null ? t('in_hours')(num(r.answer_hours)) : '');
      const pp = $('in-people'); pp.textContent = '';
      if (r.per_person.length) {
        pp.appendChild(el('h3', '', t('in_people')));
        const ul = el('ul', 'in-list'); r.per_person.forEach(x => ul.appendChild(el('li', '', `${x.name || '—'} · ${t('in_comparisons')(num(x.comparisons))}`))); pp.appendChild(ul);
      }
      $('in-note').textContent = t('in_note');
    } catch (err) { if (err.status === 401) return gate(); box.hidden = true; }
  }
  // Retention chosen by the company (paid plans)
  function renderRetention() {
    const box = $('retention');
    box.hidden = !(feat('retention') && isManager());
    if (box.hidden) return;
    const sel = $('ret-sel'); sel.textContent = '';
    (me.retention_choices || [30, 60, 90, 180]).forEach(d => { const o = el('option', '', t('in_days')(d)); o.value = d; o.selected = me.retention_days === d; sel.appendChild(o); });
  }
  // Criteria report of the open comparison: what weighed in the score, and what never does.
  function renderCritReport(ev) {
    const btn = $('crit-report-btn'), box = $('crit-report');
    btn.hidden = !(feat('criteria_report') && ev); if (btn.hidden) { box.hidden = true; return; }
    if (box.hidden) return;
    box.textContent = '';
    box.appendChild(el('h3', '', t('cr_rep_title')));
    const crit = ev.ranking.criteria || [];
    if (!crit.length) box.appendChild(el('p', 'small', t('cr_rep_none')));
    else {
      box.appendChild(el('p', 'small', t('cr_rep_formula')));
      const tb = el('table', 'cr-table'); const hr = el('tr');
      [t('r_criteria'), t('cr_rep_type'), t('cr_rep_avg'), t('cr_rep_ko')].forEach(h => hr.appendChild(el('th', '', h))); tb.appendChild(hr);
      crit.forEach(k => {
        const rs = ev.ranking.candidates.map(c => (c.criteria || []).find(r => r.id === k.id)).filter(Boolean);
        const avg = rs.length ? Math.round(rs.reduce((x, r) => x + r.rating, 0) / rs.length * 10) / 10 : null;
        const ko = ev.ranking.candidates.filter(c => (c.knockout_failed || []).includes(k.id)).length;
        const row = el('tr');
        [k.name, k.required ? t('cr_required') : t('cr_w')[k.weight], avg === null ? '—' : `${avg.toLocaleString(LANG === 'en' ? 'en' : 'pt-BR')}/4`, k.required ? String(ko) : '—']
          .forEach(v => row.appendChild(el('td', '', v)));
        tb.appendChild(row);
      });
      box.appendChild(tb);
    }
    const ul = el('ul', 'small'); t('cr_rep_never').forEach(x => ul.appendChild(el('li', '', x))); box.appendChild(el('h4', '', t('cr_rep_never_t'))); box.appendChild(ul);
    box.appendChild(el('p', 'muted small', t('cr_rep_meta')(ev.model || '—', fmtDate(ev.created_at), ev.cv_count, (ev.author && ev.author.name) || '—')));
  }

  function renderMe() {
    renderBonus();
    try { renderRetention(); } catch (e) {}
    $('org-name').textContent = me.organization;
    $('role').textContent = roleName(me.role);
    $('team').hidden = !isManager(); $('audit').hidden = !isManager();
    const left = creditsLeft();
    const c = $('credits'); c.textContent = t('a_credits')(left); c.classList.toggle('warn', left <= 1);
    $('until').textContent = hasPackOnly() ? t('a_pack_until')(fmtDate(me.pack_expires_at))
      : !me.trial_expires_at ? '' : (isPaid() ? t('b_paid_until') : t('a_until'))(fmtDate(me.trial_expires_at));
    const active = left > 0;
    $('new').hidden = !active; $('over').hidden = active;
    $('over').querySelector('h2').textContent = (isPaid() && t('over_paid_title')) || t('over_title');
    $('over').querySelector('p').textContent = (isPaid() && t('over_paid_text')) || t('over_text');
    const planLabel = t('b_plan') && t('b_plan')[me.plan];
    $('s-label').textContent = isPaid() && t('s_label_paid') && planLabel ? t('s_label_paid')(planLabel)
      : hasPackOnly() ? t('s_label_pack') : t('s_label');
    runNote(); renderCriteria();
    // Billing never breaks the rest of the page (e.g. an old cached trial.js without its texts).
    try { renderBilling(); } catch (e) { $('billing').hidden = true; $('plans').hidden = true; }
    try { renderJx(); } catch (e) { $('jx').hidden = true; }
  }

  // ── Plan and billing (Stripe Checkout, card only) ───────────────────────
  let billingFlag = null;
  function renderBilling() {
    const b = me.billing, box = $('billing'), plans = $('plans');
    const live = !!b && ['active', 'trialing', 'past_due'].includes(b.status);
    // The Worker turns billing on per user (test mode: only listed e-mails). Companies that
    // already have a Stripe customer keep the card so they can manage it.
    if (!me.billing_enabled && !(b && b.has_customer)) {
      box.hidden = true; plans.hidden = true; window.TS_PLANS = null;
      return;
    }
    box.hidden = false;
    const msg = $('billing-msg');
    if (b && b.status === 'past_due') showMsg(msg, 'err', t('b_past_due'));
    else if (billingFlag === 'success') showMsg(msg, 'ok', t('b_success'));
    else if (billingFlag === 'cancel') showMsg(msg, 'info', t('b_cancel'));
    else msg.hidden = true;
    const planName = t('b_plan')[me.plan] || me.plan;
    const parts = [t('b_status')(planName, live && b.cycle ? t('b_cycle')[b.cycle] : '')];
    if (live && b.next_refill_at > Date.now()) parts.push(t('b_refill')(fmtDate(b.next_refill_at)));
    if (me.pack_credits > 0 && me.pack_expires_at > Date.now()) parts.push(t('b_pack')(me.pack_credits, fmtDate(me.pack_expires_at)));
    if (!isManager()) parts.push(t('b_members'));
    $('billing-status').textContent = parts.join(' ');
    $('billing-portal').hidden = !(isManager() && b && b.has_customer);
    // Plan cards: managers without an active subscription. The pack card stays available to them too.
    window.TS_PLANS = isManager()
      ? { currency: b && b.currency ? b.currency.toUpperCase() : null, packOnly: live, checkout: buyPlan, pack: buyPack } : null;
    plans.hidden = !isManager();
    if (window.TSPlans) window.TSPlans.render();
  }

  async function goToStripe(path, body, btn) {
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = t('b_opening');
    try {
      const r = await api('POST', path, body);
      location.assign(r.url);
    } catch (err) {
      if (err.status === 401) return gate();
      btn.disabled = false; btn.textContent = label;
      showMsg($('billing-msg'), 'err', err.message);
      $('billing').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  const buyPlan = (body, btn) => goToStripe('/api/billing/checkout', body, btn);
  const buyPack = (body, btn) => goToStripe('/api/billing/pack', body, btn);

  // Back from Stripe: the webhook can take a few seconds, so reload /api/me until the change shows.
  async function afterCheckout() {
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 2500));
      try {
        const fresh = await api('GET', '/api/me');
        const changed = fresh.plan !== me.plan || fresh.pack_credits !== me.pack_credits || fresh.credits_remaining !== me.credits_remaining;
        me = fresh;
        if (changed) { renderMe(); return; }
      } catch (e) { return; }
    }
    renderMe();
  }

  function rerender() { if (me) { renderMe(); renderCvs(); renderHistory(); renderTeam(); if (auditEvents) renderAudit(); if (current) renderResults(current); renderReferral(); renderJobs(); if (currentJob) setCurrentJob(currentJob); } }

  // ── Job description analysis (Raio-X da Vaga inside MRE·AI) ─────────────
  // Only the job text is sent; CVs stay in this page. Free: never spends a comparison.
  let jx = null, jxOriginal = null;
  const prettyModel = m => {
    const s = String(m || '');
    if (/^deepseek/i.test(s)) return 'DeepSeek ' + s.replace(/^deepseek-?/i, '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (/^glm/i.test(s)) return s.toUpperCase();
    return s;
  };
  function renderJx() {
    const box = $('jx'), out = $('jx-out');
    box.hidden = !(me && me.job_analysis);
    if (!jx) { out.hidden = true; out.textContent = ''; return; }
    out.textContent = ''; out.hidden = false;
    const a = jx;
    const head = el('div', 'jx-head');
    const sc = el('div', 'jx-score' + (a.score >= 85 ? '' : a.score >= 60 ? ' mid' : ' low'), String(a.score));
    sc.setAttribute('aria-label', t('jx_score') + ': ' + a.score);
    head.appendChild(sc);
    const hw = el('div', 'grow');
    hw.appendChild(el('div', 'small muted', `${t('jx_score')} · ${t('jx_score_hint')(a.score)}`));
    if (a.title) hw.appendChild(el('b', '', a.title));
    if (a.summary) hw.appendChild(el('p', 'small', a.summary));
    head.appendChild(hw);
    head.appendChild(Object.assign(el('button', 'btn btn-ghost btn-sm', t('jx_close')), { type: 'button', onclick: () => { jx = null; renderJx(); } }));
    out.appendChild(head);

    const cols = el('div', 'jx-cols');
    const bias = el('div'); bias.appendChild(el('h3', '', t('jx_bias')));
    if (!a.bias || !a.bias.length) bias.appendChild(el('p', 'small muted', t('jx_bias_none')));
    else {
      const ul = el('ul');
      a.bias.forEach(b => {
        const li = el('li'); li.appendChild(el('span', 'jx-term', '“' + b.term + '”'));
        if (b.why) li.appendChild(document.createTextNode(' — ' + b.why));
        if (b.suggestion) { li.appendChild(el('br')); li.appendChild(el('span', 'small muted', `${t('jx_suggest')}: ${b.suggestion}`)); }
        ul.appendChild(li);
      });
      bias.appendChild(ul);
    }
    cols.appendChild(bias);
    const miss = el('div'); miss.appendChild(el('h3', '', t('jx_missing')));
    if (!a.missing || !a.missing.length) miss.appendChild(el('p', 'small muted', t('jx_missing_none')));
    else { const ch = el('div', 'jx-chips'); a.missing.forEach(k => ch.appendChild(el('span', 'jx-chip', (t('jx_m') || {})[k] || k))); miss.appendChild(ch); }
    cols.appendChild(miss);
    out.appendChild(cols);

    if ((a.must_have && a.must_have.length) || (a.nice_to_have && a.nice_to_have.length)) {
      const req = el('div', 'jx-cols');
      [['jx_must', a.must_have], ['jx_nice', a.nice_to_have]].forEach(([k, list]) => {
        const d = el('div'); if (list && list.length) { d.appendChild(el('h3', '', t(k))); const ul = el('ul'); list.forEach(x => ul.appendChild(el('li', '', x))); d.appendChild(ul); }
        req.appendChild(d);
      });
      out.appendChild(req);
      if (a.too_many_requirements) out.appendChild(el('p', 'small', a.requirements_note || t('jx_too_many')));
    }

    const imp = el('div'); imp.appendChild(el('h3', '', t('jx_improved')));
    imp.appendChild(el('div', 'jx-improved', a.improved));
    out.appendChild(imp);
    const acts = el('div', 'jx-actions');
    const usingImproved = jxOriginal !== null && $('job').value === a.improved.slice(0, MAX_JOB);
    if (!usingImproved) {
      acts.appendChild(Object.assign(el('button', 'btn btn-primary btn-sm', t('jx_use')), { type: 'button', onclick: () => {
        jxOriginal = $('job').value;
        $('job').value = a.improved.slice(0, MAX_JOB); $('job').dispatchEvent(new Event('input'));
        $('job-src').className = ''; $('job-src').textContent = '';
        showMsg($('jx-msg'), 'ok', t('jx_used')); renderJx();
      } }));
    } else {
      acts.appendChild(Object.assign(el('button', 'btn btn-ghost btn-sm', t('jx_undo')), { type: 'button', onclick: () => {
        $('job').value = jxOriginal; jxOriginal = null; $('job').dispatchEvent(new Event('input'));
        showMsg($('jx-msg'), 'info', t('jx_undone')); renderJx();
      } }));
    }
    out.appendChild(acts);
    out.appendChild(el('div', 'jx-foot', `${a.provider === 'claude' ? t('jx_by_claude') : t('jx_by_huawei')(prettyModel(a.model))} · ${t('jx_privacy')}`));
  }
  async function analyzeJob() {
    const msg = $('jx-msg'); msg.hidden = true;
    const job = $('job').value.trim();
    if (job.length < 80) return showMsg(msg, 'err', t('jx_need'));
    const btn = $('jx-btn'); btn.disabled = true;
    $('jx-label').textContent = t('jx_running');
    const sp = el('span', 'spinner'); btn.prepend(sp);
    try {
      jx = await api('POST', '/api/job-analysis', { job, lang: LANG });
      jxOriginal = null; renderJx();
    } catch (err) {
      if (err.status === 401) return gate();
      showMsg(msg, 'err', err.message);
      if (err.code === 'no_credits' || err.code === 'trial_expired') { me.credits_remaining = 0; me.pack_credits = 0; renderMe(); }
    } finally {
      btn.disabled = false; sp.remove(); $('jx-label').textContent = t('jx_btn');
    }
  }

  // ── Run ──────────────────────────────────────────────────────────────────
  async function run() {
    const msg = $('run-msg'); msg.hidden = true;
    const job = $('job').value.trim();
    const ready = cvs.filter(c => c.status === 'ok' && c.sent.length >= 100);
    if (job.length < 50) return showMsg(msg, 'err', t('need_job'));
    if (!ready.length) return showMsg(msg, 'err', t('need_cv'));
    if (pending && pending.job !== job) pending = null;
    // Keep only readable CVs, re-lettered in order (A, B, C… or after the ones already sent).
    cvs = ready; renderCvs();
    const start = offset(), total = start + cvs.length;
    const batches = [];
    for (let i = 0; i < cvs.length; i += BATCH) batches.push(cvs.slice(i, i + BATCH));
    if (batches.length > creditsLeft()) return showMsg(msg, 'err', t('need_credits')(batches.length, creditsLeft()));
    const crit = !pending ? criteriaForApi() : null;
    if (crit === false) return;
    const btn = $('run'); btn.disabled = true;
    const sp = el('span', 'spinner'); btn.prepend(sp);
    let ev = null, done = 0, appendTo = pending ? pending.id : null;
    try {
      for (let k = 0; k < batches.length; k++) {
        $('run-label').textContent = batches.length > 1 ? t('running_batch')(k + 1, batches.length) : t('running');
        const body = { job, lang: LANG, cvs: batches[k].map(c => ({ text: c.sent })) };
        if (appendTo) body.append_to = appendTo; else { if (crit) body.criteria = crit; if (currentJob) body.job_id = currentJob.id; }
        let r;
        try { r = await api('POST', '/api/evaluate', body); }
        catch (err) {
          // Another batch was being added at the same moment: it was refunded, send it once more.
          if (err.code !== 'round_busy') throw err;
          await new Promise(res => setTimeout(res, 1500));
          r = await api('POST', '/api/evaluate', body);
        }
        const names = loadNames(r.id);
        batches[k].forEach((c, i) => { if (c.name) names[IDS[start + done + i]] = c.name; });
        saveNames(r.id, names);
        appendTo = r.id; done += batches[k].length;
        ev = { id: r.id, created_at: r.created_at, job_title: r.job_title, cv_count: r.cv_count || done, ranking: r.ranking, author: r.author,
          has_job: r.has_job, delete_after: r.delete_after, model: r.model };
        if (me) me.credits_remaining = r.credits_remaining;
      }
      pending = null; cvs = [];
      // The job remembers the criteria of its first comparison.
      if (currentJob && crit && crit.length && !currentJob.criteria) {
        currentJob.criteria = crit;
        api('POST', '/api/jobs/update', { id: currentJob.id, criteria: crit }).catch(() => {});
      }
      if (currentJob) loadJobs().catch(() => {});
    } catch (err) {
      if (err.status === 401) return gate();
      if (appendTo) {
        // Part of the round is done: keep it, and let the person send the rest later.
        pending = { id: appendTo, job, offset: start + done, title: ev ? ev.job_title : (pending && pending.title) };
        cvs = cvs.slice(done);
        showMsg(msg, 'err', err.message + ' ' + t('round_partial')(start + done, total));
      } else showMsg(msg, 'err', err.message);
      if (err.code === 'no_credits' || err.code === 'trial_expired') { me.credits_remaining = 0; me.pack_credits = 0; }
    } finally {
      btn.disabled = false; sp.remove();
      if (ev) {
        past = past.filter(x => x.id !== ev.id); past.unshift(ev);
        try { me = await api('GET', '/api/me'); } catch (e) {}
        if (isManager()) { try { await loadHistory(); } catch (e) {} }
        renderMe(); renderHistory(); renderResults(ev);
        if (!pending) $('results').scrollIntoView({ behavior: 'smooth' });
      } else if (me) renderMe();
      renderCvs();
    }
  }

  // ── Job criteria (optional) ──────────────────────────────────────────────
  // Suggested from the job text for free, then edited here. Sent only with the first batch of a comparison.
  function criteriaForApi() {
    const list = criteria.map(k => ({ name: k.name.trim(), required: !!k.required, weight: k.weight })).filter(k => k.name);
    if (list.length > MAX_CRITERIA) { showMsg($('cr-msg'), 'err', t('cr_max')(MAX_CRITERIA)); return false; }
    return list.length ? list : null;
  }
  function renderCriteria() {
    const box = $('cr-list'); if (!box) return;
    box.textContent = '';
    const locked = !!pending;
    $('cr-bar').hidden = locked; $('cr-locked').hidden = !locked;
    criteria.forEach((k, i) => {
      const row = el('div', 'cr-row');
      const name = el('input'); name.value = k.name; name.placeholder = t('cr_ph'); name.maxLength = 80; name.disabled = locked;
      name.setAttribute('aria-label', t('cr_title'));
      name.addEventListener('input', () => { k.name = name.value; });
      row.appendChild(name);
      const req = el('label', 'check cr-req'); const box2 = el('input'); box2.type = 'checkbox'; box2.checked = !!k.required; box2.disabled = locked;
      box2.addEventListener('change', () => { k.required = box2.checked; });
      req.appendChild(box2); req.appendChild(el('span', '', t('cr_required'))); row.appendChild(req);
      const w = el('select'); w.disabled = locked; w.setAttribute('aria-label', t('cr_title'));
      [1, 2, 3].forEach(v => { const o = el('option', '', t('cr_w')[v]); o.value = v; o.selected = k.weight === v; w.appendChild(o); });
      w.addEventListener('change', () => { k.weight = Number(w.value); });
      row.appendChild(w);
      if (!locked) {
        const x = el('button', 'x', '×'); x.type = 'button'; x.title = t('cr_remove');
        x.addEventListener('click', () => { criteria.splice(i, 1); renderCriteria(); });
        row.appendChild(x);
      }
      box.appendChild(row);
    });
    $('cr-add').disabled = criteria.length >= MAX_CRITERIA;
  }
  async function suggestCriteria() {
    const msg = $('cr-msg'); msg.hidden = true;
    const job = $('job').value.trim();
    if (job.length < 50) return showMsg(msg, 'err', t('cr_need_job'));
    const btn = $('cr-suggest'); btn.disabled = true;
    $('cr-label').textContent = t('cr_running');
    const sp = el('span', 'spinner'); btn.prepend(sp);
    try {
      const r = await api('POST', '/api/criteria', { job, lang: LANG });
      criteria = r.criteria.map(k => ({ name: k.name, required: !!k.required, weight: k.weight || 1 }));
      renderCriteria(); showMsg(msg, 'info', t('cr_done'));
    } catch (err) {
      if (err.status === 401) return gate();
      showMsg(msg, 'err', err.message);
    } finally { btn.disabled = false; sp.remove(); $('cr-label').textContent = t('cr_suggest'); }
  }

  // ── Session ──────────────────────────────────────────────────────────────
  function gate(textKey) {
    setSession(null);
    announceMe(false);
    $('loading').hidden = true; $('app').hidden = true; $('signout').hidden = true; $('gate').hidden = false;
    if (textKey) $('gate-text').textContent = textKey;
  }


  // ── Jobs (Vagas) ─────────────────────────────────────────────────────────
  // Each job keeps its description and criteria; "Compare candidates" fills the new comparison with them.
  // With the company recruiting e-mail set, each job shows its address for the ad: local+slug@domain.
  const slugify = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
  // Same as jobs.js slugBase on the server: short words dropped, up to 38 characters at a word boundary.
  const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'para', 'em', 'a', 'o', 'the', 'of', 'and', 'for', 'y', 'del', 'la', 'el', 'en']);
  const slugBase = v => { let out = ''; for (const w of slugify(v).split('-').filter(w => w && !STOP.has(w))) { if ((out ? out.length + 1 : 0) + w.length > 38) break; out = out ? out + '-' + w : w; } return out || 'vaga'; };
  const addrFor = slug => { if (!jobsMailbox || !slug) return null; const [l, d] = jobsMailbox.split('@'); return `${l}+${slug}@${d}`; };

  async function loadJobs() {
    const r = await api('GET', '/api/jobs');
    jobs = r.jobs || []; jobsMailbox = r.mailbox || null; canSetMailbox = !!r.can_set_mailbox;
    renderJobs();
  }

  function renderJobs() {
    const list = $('j-list'); list.textContent = '';
    const open = jobs.filter(j => j.status === 'open'), closed = jobs.filter(j => j.status !== 'open');
    if (!jobs.length) list.appendChild(el('p', 'muted small', t('j_none')));
    for (const j of showClosed ? open.concat(closed) : open) {
      const box = el('div', 'j-item' + (j.status === 'open' ? '' : ' closed'));
      const top = el('div', 'j-top');
      const name = el('b', '', j.title);
      top.append(name, el('span', 'muted small', t('j_stats')(j.evaluations || 0, j.cvs || 0) + (j.status === 'open' ? '' : ' · ' + t('j_closed'))));
      box.appendChild(top);
      if (j.address) box.appendChild(el('div', 'j-addr', j.address));
      else box.appendChild(el('div', 'muted small', t('j_no_addr')));
      box.appendChild(el('div', 'muted small', t('j_by')(j.created_by_name || '—', fmtDate(j.created_at))));
      const acts = el('div', 'j-acts');
      if (j.status === 'open') {
        const cmp = el('button', 'btn btn-primary btn-sm', t('j_compare')); cmp.type = 'button';
        cmp.addEventListener('click', () => useJob(j.id, cmp));
        acts.appendChild(cmp);
        if (j.address) {
          const ad = el('button', 'btn btn-ghost btn-sm', t('j_copy_ad')); ad.type = 'button';
          ad.addEventListener('click', () => copyText(t('j_ad')(j.title, j.address), ad));
          acts.appendChild(ad);
        }
      }
      const ed = el('button', 'btn btn-ghost btn-sm', t('j_edit')); ed.type = 'button';
      ed.addEventListener('click', () => openJobForm(j));
      const st = el('button', 'btn btn-ghost btn-sm', j.status === 'open' ? t('j_close') : t('j_reopen')); st.type = 'button';
      st.addEventListener('click', () => j.status === 'open'
        ? askConfirm({ title: t('j_close_title'), text: t('j_close_text'), ok: t('j_close'), action: () => setJobStatus(j, 'closed') })
        : setJobStatus(j, 'open'));
      acts.append(ed, st);
      box.appendChild(acts);
      list.appendChild(box);
    }
    const cb = $('j-closed');
    cb.hidden = !closed.length;
    cb.textContent = showClosed ? t('j_hide_closed') : t('j_show_closed')(closed.length);
    // Company recruiting e-mail: managers edit it, the others see it.
    $('j-mb-in').hidden = $('j-mb-save').hidden = !canSetMailbox;
    if (canSetMailbox && document.activeElement !== $('j-mb-in')) $('j-mb-in').value = jobsMailbox || '';
    $('j-mb-text').textContent = canSetMailbox ? '' : (jobsMailbox ? t('j_mb_is')(jobsMailbox) : t('j_mb_none'));
    renderJobAddrPreview();
  }

  function renderJobAddrPreview() {
    const slug = slugify($('j-slug').value) || (editingJob && editingJob !== 'new' ? editingJob.slug : (slugify($('j-title').value) ? slugBase($('j-title').value) + '-…' : ''));
    const a = addrFor(slug);
    $('j-addr-prev').textContent = a ? t('j_addr_prev')(a) : '';
  }

  async function openJobForm(j) {
    editingJob = j || 'new';
    $('j-msg').hidden = true; $('j-form').hidden = false;
    if (j) {
      $('j-title').value = j.title; $('j-slug').value = j.slug; $('j-desc').value = '';
      try { const r = await api('GET', '/api/jobs/get?id=' + encodeURIComponent(j.id)); $('j-desc').value = r.job.job_text; } catch (err) { showMsg($('j-msg'), 'err', err.message); }
    } else {
      $('j-title').value = ''; $('j-slug').value = '';
      $('j-desc').value = $('job').value.trim();   // the description already typed in the comparison, if any
    }
    renderJobAddrPreview();
    $('j-title').focus();
  }
  function closeJobForm() { editingJob = null; $('j-form').hidden = true; }

  async function saveJob() {
    const title = $('j-title').value.trim(), job_text = $('j-desc').value.trim(), slug = slugify($('j-slug').value);
    if (title.length < 3 || job_text.length < 50) return showMsg($('j-msg'), 'err', t('j_need'));
    const btn = $('j-save'); btn.disabled = true;
    try {
      if (editingJob === 'new') {
        const body = { title, job_text };
        if (slug) body.slug = slug;
        await api('POST', '/api/jobs', body);
      } else {
        const body = { id: editingJob.id, title, job_text };
        if (slug && slug !== editingJob.slug) body.slug = slug;
        await api('POST', '/api/jobs/update', body);
        if (currentJob && currentJob.id === editingJob.id) setCurrentJob({ ...currentJob, title });
      }
      closeJobForm();
      await loadJobs();
    } catch (err) { if (err.status === 401) return gate(); showMsg($('j-msg'), 'err', err.message); }
    finally { btn.disabled = false; }
  }

  async function setJobStatus(j, status) {
    try {
      await api('POST', '/api/jobs/status', { id: j.id, status });
      if (status === 'closed' && currentJob && currentJob.id === j.id) setCurrentJob(null);
      await loadJobs();
    } catch (err) { if (err.status === 401) return gate(); showMsg($('j-mb-msg'), 'err', err.message); }
  }

  // Fill the new comparison with the job's description and criteria.
  async function useJob(id, btn) {
    if (btn) btn.disabled = true;
    try {
      const r = await api('GET', '/api/jobs/get?id=' + encodeURIComponent(id));
      pending = null; cvs = []; renderCvs();
      $('job').value = r.job.job_text; $('job').dispatchEvent(new Event('input'));
      criteria = (r.job.criteria || []).map(k => ({ name: k.name, required: !!k.required, weight: k.weight || 1 }));
      renderCriteria();
      setCurrentJob({ id: r.job.id, title: r.job.title, criteria: r.job.criteria && r.job.criteria.length ? r.job.criteria : null });
      $('new').scrollIntoView({ behavior: 'smooth' });
    } catch (err) { if (err.status === 401) return gate(); showMsg($('j-mb-msg'), 'err', err.message); }
    finally { if (btn) btn.disabled = false; }
  }

  function setCurrentJob(j) {
    currentJob = j;
    $('j-for').hidden = !j;
    $('j-for-text').textContent = j ? t('j_for')(j.title) : '';
  }

  $('j-new').addEventListener('click', () => openJobForm(null));
  $('j-cancel').addEventListener('click', closeJobForm);
  $('j-save').addEventListener('click', saveJob);
  $('j-title').addEventListener('input', renderJobAddrPreview);
  $('j-slug').addEventListener('input', renderJobAddrPreview);
  $('j-closed').addEventListener('click', () => { showClosed = !showClosed; renderJobs(); });
  $('j-for-x').addEventListener('click', () => setCurrentJob(null));
  $('j-mb-save').addEventListener('click', async () => {
    const btn = $('j-mb-save'); btn.disabled = true;
    try {
      const r = await api('POST', '/api/settings/intake', { mailbox: $('j-mb-in').value.trim() });
      jobsMailbox = r.mailbox; showMsg($('j-mb-msg'), 'ok', t('j_mb_saved'));
      await loadJobs();
    } catch (err) { if (err.status === 401) return gate(); showMsg($('j-mb-msg'), 'err', err.message); }
    finally { btn.disabled = false; }
  });

  async function loadHistory() {
    const h = await api('GET', '/api/evaluations');
    past = h.evaluations || []; usage = h.usage || null;
  }

  // The help chat (support.js) shows its button from /api/me ("support"); null when signed out.
  const announceMe = signedIn => document.dispatchEvent(new CustomEvent('mre:me', { detail: signedIn ? me : null }));

  function showApp() {
    $('loading').hidden = true; $('gate').hidden = true; $('consent').hidden = true; $('app').hidden = false; $('signout').hidden = false;
    rerender();
    announceMe(true);
  }

  async function start() {
    const q = new URLSearchParams(location.search);
    if (q.has('billing')) {
      billingFlag = q.get('billing') === 'success' ? 'success' : 'cancel';
      q.delete('billing');
      window.history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
    }
    const m = location.hash.match(/token=([A-Za-z0-9_-]{20,100})/);
    if (m) {
      window.history.replaceState(null, '', location.pathname + location.search);
      try { const r = await api('POST', '/api/verify', { token: m[1] }); setSession(r.session, r.expires_in); }
      catch (err) { return gate(err.message); }
    }
    if (!getSession()) return gate();
    try {
      me = await api('GET', '/api/me');
      if (me.lang && !new URLSearchParams(location.search).get('lang')) { try { if (!localStorage.getItem(TRIAL.LANG_KEY)) { LANG = me.lang; applyTexts(); } } catch (e) {} }
      if (me.needs_consent) {
        $('loading').hidden = true; $('consent').hidden = false; $('signout').hidden = false;
        return;
      }
      await loadHistory();
      if (isManager()) await loadTeam();
    } catch (err) { return gate(err.status === 401 ? undefined : err.message); }
    showApp();
    loadJobs().catch(() => {});
    loadReferral();
    renderBonus();
    loadInsights();
    if (billingFlag === 'success') afterCheckout();
  }

  // Invited people accept the terms on their first sign-in.
  $('c-terms').addEventListener('change', () => { $('c-btn').disabled = !$('c-terms').checked; });
  $('c-btn').addEventListener('click', async () => {
    $('c-btn').disabled = true; $('c-msg').hidden = true;
    try {
      await api('POST', '/api/consent', { accept: true, marketing: $('c-mk').checked });
      me.needs_consent = false;
      await loadHistory();
      if (isManager()) await loadTeam();
      showApp();
      loadJobs().catch(() => {});
      loadReferral();
      renderBonus();
    } catch (err) { showMsg($('c-msg'), 'err', err.message); $('c-btn').disabled = false; }
  });

  // ── Generic confirmation dialog ──────────────────────────────────────────
  function askConfirm({ title, text, ok, danger, typed, typedLabel, action }) {
    const d = $('cf-dlg'), okb = $('cf-ok'), w = $('cf-word'), msg = $('cf-msg');
    $('cf-title').textContent = title; $('cf-text').textContent = text || '';
    $('cf-title').className = danger ? '' : 'neutral';
    okb.textContent = ok || t('cf_confirm'); okb.className = 'btn btn-sm ' + (danger ? 'btn-danger-solid' : 'btn-primary');
    msg.hidden = true; w.value = '';
    $('cf-typed').hidden = !typed;
    if (typed) { $('cf-word-label').textContent = typedLabel || t('del_type')(typed); w.placeholder = typed; }
    const ready = () => { okb.disabled = !!typed && w.value.trim().toLowerCase() !== typed.toLowerCase(); };
    w.oninput = ready; ready();
    okb.onclick = async () => {
      okb.disabled = true;
      try { await action(); d.close(); }
      catch (err) { if (err.status === 401) { d.close(); return gate(); } showMsg(msg, 'err', err.message); ready(); }
    };
    $('cf-cancel').onclick = () => d.close();
    d.showModal();
    (typed ? w : $('cf-cancel')).focus();
  }

  // ── Team (account holder and administrators) ─────────────────────────────
  async function loadTeam() { const r = await api('GET', '/api/team'); team = r.members || []; }
  async function refreshTeam(okText) {
    await loadTeam(); me = await api('GET', '/api/me');
    renderMe(); renderTeam();
    if (okText) showMsg($('team-msg'), 'ok', okText);
  }
  const post = (path, body) => api('POST', path, body);

  function renderTeam() {
    if (!isManager()) return;
    const pend = $('team-pending');
    pend.hidden = !me.team_pending; if (me.team_pending) pend.textContent = t('team_pending')(me.team_pending);
    const box = $('members'); box.textContent = '';
    team.forEach(u => {
      const row = el('div', 'member');
      const who = el('div', 'who');
      who.appendChild(el('b', '', u.name + (u.me ? ` (${t('role_you')})` : '')));
      who.appendChild(el('span', 'muted small', u.email));
      const tags = el('div', 'tags');
      tags.appendChild(el('span', 'tg', roleName(u.role)));
      tags.appendChild(el('span', 'tg ' + (u.status === 'active' ? 'ok' : 'warn'), t('st_' + u.status) || u.status));
      tags.appendChild(el('span', 'muted small', u.last_login_at ? t('t_last')(fmtDate(u.last_login_at)) : t('t_never')));
      tags.appendChild(el('span', 'muted small', '· ' + t('t_evals')(u.evaluations)));
      who.appendChild(tags);
      row.appendChild(who);
      const acts = el('div', 'acts');
      const b = (label, cls, fn) => { const x = el('button', 'btn btn-sm ' + cls, label); x.type = 'button'; x.addEventListener('click', fn); acts.appendChild(x); };
      const done = key => () => refreshTeam(t(key));
      if (u.status === 'pending_team') {
        b(t('b_approve'), 'btn-primary', () => post('/api/team/approve', { user_id: u.id }).then(done('ok_approved')).catch(e => showMsg($('team-msg'), 'err', e.message)));
        b(t('b_reject'), 'btn-danger', () => askConfirm({ title: t('cf_reject_title')(u.name), text: t('cf_reject_text'), ok: t('b_reject'), danger: true,
          action: () => post('/api/team/reject', { user_id: u.id }).then(done('ok_rejected')) }));
      } else if (u.can_manage) {
        if (u.status === 'pending_email') b(t('b_resend'), 'btn-ghost', () => post('/api/team/resend', { user_id: u.id }).then(done('ok_resent')).catch(e => showMsg($('team-msg'), 'err', e.message)));
        if (me.role === 'owner') {
          const to = u.role === 'admin' ? 'member' : 'admin';
          b(t(to === 'admin' ? 'b_make_admin' : 'b_make_member'), 'btn-ghost', () => askConfirm({ title: t('cf_role_title')(u.name), text: t(to === 'admin' ? 'cf_role_admin' : 'cf_role_member'),
            action: () => post('/api/team/role', { user_id: u.id, role: to }).then(done('ok_role')) }));
          if (u.status === 'active') b(t('b_transfer'), 'btn-ghost', () => askConfirm({ title: t('cf_transfer_title')(u.name), text: t('cf_transfer_text'), danger: true,
            ok: t('b_transfer'), typed: u.email, typedLabel: t('cf_type_email'),
            action: () => post('/api/team/transfer', { user_id: u.id, confirm_email: u.email }).then(done('ok_transferred')) }));
        }
        b(u.status === 'pending_email' ? t('b_cancel_invite') : t('b_remove'), 'btn-danger', () => askConfirm({ title: t('cf_remove_title')(u.name), text: t('cf_remove_text'),
          ok: t('b_remove'), danger: true, action: () => post('/api/team/remove', { user_id: u.id }).then(done('ok_removed')) }));
      }
      row.appendChild(acts);
      box.appendChild(row);
    });
    // Invite form
    $('invite').hidden = !me.can_invite; $('invite-hint').hidden = !me.can_invite;
    $('invite-off').hidden = !!me.can_invite; $('invite-off').textContent = t('t_no_invite');
    if (me.can_invite) $('invite-hint').textContent = t('t_invite_hint')(me.invite_domain);
    $('i-role').querySelector('option[value="admin"]').hidden = me.role !== 'owner';
    if (me.role !== 'owner') $('i-role').value = 'member';
  }

  $('invite').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('team-msg'); msg.hidden = true;
    const name = $('i-name').value.trim(), email = $('i-email').value.trim().toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg(msg, 'err', t('err').invalid_input);
    if (me.invite_domain && email.split('@')[1] !== me.invite_domain) return showMsg(msg, 'err', t('err').invite_domain);
    $('i-btn').disabled = true;
    try {
      await post('/api/team/invite', { name, email, role: $('i-role').value, lang: LANG });
      $('i-name').value = ''; $('i-email').value = '';
      await refreshTeam(t('t_invite_ok')(email));
    } catch (err) { if (err.status === 401) return gate(); showMsg(msg, 'err', err.message); }
    finally { $('i-btn').disabled = false; }
  });

  // ── Audit log (account holder and administrators) ────────────────────────
  const actName = a => (a.actor_role === 'ts_admin' ? t('act').admin + ' · ' : '') + (t('act')[a.action] || (a.action.startsWith('admin.') ? t('act').admin : a.action));
  function auditDetail(a) {
    const d = a.detail || {};
    return [d.job_title, d.name && d.email ? `${d.name} · ${d.email}` : d.email || d.to_email, d.cv_count ? t('h_cvs')(d.cv_count) : '',
      d.from && d.to && typeof d.to === 'string' ? `${roleName(d.from)} → ${roleName(d.to)}` : '', d.role && !d.from ? roleName(d.role) : '']
      .filter(Boolean).join(' · ');
  }
  function renderAudit() {
    const box = $('audit-list'); box.textContent = '';
    if (!auditEvents.length) { box.appendChild(el('p', 'muted small', t('audit_none'))); return; }
    const tb = el('table', 'audit-t'), head = el('tr');
    const hdr = LANG === 'pt' ? ['Quando', 'Quem', 'Ação', 'Detalhes'] : LANG === 'es' ? ['Cuándo', 'Quién', 'Acción', 'Detalles'] : ['When', 'Who', 'Action', 'Details'];
    hdr.forEach(h => head.appendChild(el('th', '', h))); tb.appendChild(head);
    auditEvents.forEach(a => {
      const r = el('tr');
      r.appendChild(el('td', '', new Date(a.created_at).toLocaleString(LANG === 'pt' ? 'pt-BR' : LANG, { dateStyle: 'short', timeStyle: 'short' })));
      const who = el('td'); who.appendChild(el('div', '', a.actor_role === 'ts_admin' ? 'Tecnologia Santos' : (a.actor_name || '—')));
      if (a.actor_email && a.actor_role !== 'ts_admin') who.appendChild(el('div', 'muted', a.actor_email));
      r.appendChild(who);
      r.appendChild(el('td', '', actName(a)));
      r.appendChild(el('td', 'muted', auditDetail(a)));
      tb.appendChild(r);
    });
    box.appendChild(tb);
  }
  $('audit-load').addEventListener('click', async () => {
    $('audit-load').disabled = true;
    try { auditEvents = (await api('GET', '/api/audit')).events || []; renderAudit(); $('audit-csv').hidden = false; }
    catch (err) { if (err.status === 401) return gate(); showMsg($('team-msg'), 'err', err.message); }
    finally { $('audit-load').disabled = false; }
  });
  $('audit-csv').addEventListener('click', () => {
    const q = v => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    const rows = [['date', 'name', 'email', 'role', 'action', 'details'].map(q).join(',')].concat((auditEvents || []).map(a =>
      [new Date(a.created_at).toISOString(), a.actor_role === 'ts_admin' ? 'Tecnologia Santos' : a.actor_name, a.actor_role === 'ts_admin' ? '' : a.actor_email,
        a.actor_role === 'ts_admin' ? 'support' : roleName(a.actor_role), actName(a), auditDetail(a)].map(q).join(',')));
    const a = el('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'mre-ai-audit-' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  // ── Wiring ───────────────────────────────────────────────────────────────
  const drop = $('drop'), file = $('file');
  drop.addEventListener('click', () => file.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  file.addEventListener('change', () => { addFiles(file.files); file.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));
  $('job').addEventListener('input', () => {
    $('job-count').textContent = `${$('job').value.length} / ${MAX_JOB}`;
    // A different job text starts a new comparison (the interrupted one keeps what it has).
    if (pending && $('job').value.trim() !== pending.job) { pending = null; renderCvs(); renderCriteria(); }
  });
  $('cr-suggest').addEventListener('click', suggestCriteria);
  $('add-cvs').addEventListener('click', addToJob);
  $('export-csv').addEventListener('click', exportCsv);
  $('crit-report-btn').addEventListener('click', () => { const b = $('crit-report'); b.hidden = !b.hidden; renderCritReport(current); if (!b.hidden) b.scrollIntoView({ behavior: 'smooth' }); });
  $('ret-sel').addEventListener('change', async () => {
    const d = Number($('ret-sel').value); $('ret-msg').textContent = '';
    try { const r = await api('POST', '/api/settings/retention', { days: d }); me.retention_days = r.retention_days; $('ret-msg').textContent = t('ret_saved');
      await loadHistory(); renderHistory(); }
    catch (err) { if (err.status === 401) return gate(); $('ret-msg').textContent = err.message; renderRetention(); }
  });
  $('q-all-btn').addEventListener('click', addQuestionToAll);
  $('q-all-text').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addQuestionToAll(); } });
  $('round-new').addEventListener('click', newJob);
  $('cr-add').addEventListener('click', () => {
    if (criteria.length >= MAX_CRITERIA) return;
    criteria.push({ name: '', required: false, weight: 2 }); renderCriteria();
    const inputs = $('cr-list').querySelectorAll('input:not([type])'); if (inputs.length) inputs[inputs.length - 1].focus();
  });
  $('run').addEventListener('click', run);
  $('jx-btn').addEventListener('click', analyzeJob);
  $('print').addEventListener('click', () => window.print());
  // Printed rankings include the interview questions.
  window.addEventListener('beforeprint', () => document.querySelectorAll('details.iq').forEach(d => { d.open = true; }));
  $('signout').addEventListener('click', async () => { try { await api('POST', '/api/logout'); } catch (e) {} setSession(null); location.href = '../'; });
  // Job description from a file (same readers as the CVs; not anonymized: a job post is not personal data)
  const jobFile = $('job-file');
  $('job-upload').addEventListener('click', () => jobFile.click());
  jobFile.addEventListener('change', async () => {
    const f = jobFile.files[0]; jobFile.value = '';
    if (!f) return;
    const src = $('job-src'), btn = $('job-upload');
    btn.disabled = true; src.className = ''; src.textContent = t('cv_reading');
    try {
      if (f.size > 15 * 1024 * 1024) throw new Error('too big');
      let txt = (await extractText(f)).replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      if (txt.length < 50) throw new Error('empty');
      const cut = txt.length > MAX_JOB;
      $('job').value = txt.slice(0, MAX_JOB);
      $('job').dispatchEvent(new Event('input'));
      src.textContent = t('job_from')(f.name) + (cut ? ' ' + t('job_cut') : '');
      if (cut) src.className = 'warn';
    } catch (e) { src.className = 'bad'; src.textContent = t('job_err'); }
    finally { btn.disabled = false; }
  });

  // Delete account: explicit dialog with checkbox + typed word
  const dlg = $('del-dlg'), dChk = $('del-chk'), dWord = $('del-word'), dOk = $('del-ok');
  const dReady = () => { dOk.disabled = !(dChk.checked && dWord.value.trim().toUpperCase() === (dWord.dataset.word || t('del_word'))); };
  dChk.addEventListener('change', dReady); dWord.addEventListener('input', dReady);
  $('del-cancel').addEventListener('click', () => dlg.close());
  let delScope = 'user';
  $('delete').addEventListener('click', () => {
    dChk.checked = false; dWord.value = ''; $('del-msg').hidden = true;
    const others = me.team_others || 0;
    const li = (id, txt) => { $(id).textContent = txt || ''; $(id).hidden = !txt; };
    if (me.role === 'owner' && others > 0) {
      delScope = 'organization';
      $('del-lead').textContent = t('del_owner_team')(others);
      li('del-li1', t('del_o1')(others + 1)); li('del-li2', t('del_o2')); li('del-li3', t('del_li3')); li('del-li4', t('del_li4'));
    } else if (me.role === 'owner') {
      delScope = 'organization';
      $('del-lead').textContent = t('del_lead');
      li('del-li1', t('del_li1')); li('del-li2', t('del_li2')(past.length)); li('del-li3', t('del_li3')); li('del-li4', t('del_li4'));
    } else {
      delScope = 'user';
      $('del-lead').textContent = t('del_lead_member');
      li('del-li1', t('del_m1')); li('del-li2', t('del_m2')); li('del-li3', t('del_m3')); li('del-li4', '');
    }
    const word = delScope === 'organization' && others > 0 ? t('del_word_org') : t('del_word');
    dWord.dataset.word = word;
    $('del-word-label').textContent = t('del_type')(word);
    dWord.placeholder = word;
    dOk.textContent = delScope === 'organization' && others > 0 ? t('del_ok_org') : t('del_ok');
    dReady();
    if (dlg.showModal) dlg.showModal(); else if (confirm(t('confirm_delete'))) dOk.click();
    $('del-cancel').focus();
  });
  dOk.addEventListener('click', async () => {
    dOk.disabled = true;
    try {
      await api('DELETE', '/api/me', { scope: delScope });
      try { Object.keys(sessionStorage).filter(k => k.startsWith('mre_trial_names_')).forEach(k => sessionStorage.removeItem(k)); } catch (e) {}
      if (dlg.open) dlg.close();
      setSession(null); gate(t('deleted')); $('gate-title').textContent = t('deleted'); $('gate-btn').hidden = true;
    } catch (err) { showMsg($('del-msg'), 'err', err.message); dReady(); }
  });

  $('billing-portal').addEventListener('click', e => goToStripe('/api/billing/portal', {}, e.currentTarget));

  setupLangButtons(rerender);
  applyTexts();
  start();

})();
