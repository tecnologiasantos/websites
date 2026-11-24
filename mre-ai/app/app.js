// MRE·AI free trial · authenticated app page
// CVs are read and anonymized here, in the browser. Only anonymized text is sent.
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const MAX_CVS = 5, MAX_CV_CHARS = 12000, MAX_JOB = 6000, IDS = ['A', 'B', 'C', 'D', 'E'];
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
    // The model may write the label in the result language: "Candidate A", "Candidato A", "Candidata A".
    const labelRe = id => new RegExp('\\b(?:Candidate|Candidat[oa])\\s+' + id + '\\b', 'g');
    let summary = ev.ranking.summary;
    Object.entries(names).forEach(([id, nm]) => { summary = summary.replace(labelRe(id), () => nm); });
    sum.appendChild(el('b', '', t('r_summary') + ': ')); sum.appendChild(document.createTextNode(summary));
    const list = $('res-list'); list.textContent = '';
    ev.ranking.candidates.forEach((c, i) => {
      const nm = names[c.id] || (LANG === 'pt' ? 'Candidato ' : LANG === 'es' ? 'Candidato ' : 'Candidate ') + c.id;
      const restore = s => (names[c.id] ? s.replace(labelRe(c.id), () => names[c.id]) : s);
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
      if (c.interview_questions && c.interview_questions.length) card.appendChild(questionsBlock(c.interview_questions, restore, nm));
      list.appendChild(card);
    });
    loadShares(ev);
  }

  // Interview questions per candidate (comparisons made before 2026-11-24 have none).
  function questionsBlock(qs, restore, name) {
    const d = el('details', 'iq');
    d.appendChild(el('summary', '', `${t('r_questions')} (${qs.length})`));
    const ol = el('ol');
    qs.forEach(q => {
      const li = el('li');
      li.appendChild(el('span', 'qt', (t('q_type') || {})[q.type] || q.type));
      li.appendChild(document.createTextNode(restore(q.q)));
      if (q.good_answer) li.appendChild(el('span', 'qa', `${t('r_good')}: ${restore(q.good_answer)}`));
      ol.appendChild(li);
    });
    d.appendChild(ol);
    const b = el('button', 'btn btn-ghost btn-sm copy', t('b_copy_q')); b.type = 'button';
    b.addEventListener('click', () => copyText(
      `${name}\n` + qs.map((q, i) => `${i + 1}. ${restore(q.q)}` + (q.good_answer ? `\n   ${t('r_good')}: ${restore(q.good_answer)}` : '')).join('\n'), b));
    d.appendChild(b);
    return d;
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
        const a = sl.responses.find(r => r.candidate_id === cand.id);
        if (a) {
          li.appendChild(el('span', 'dec ' + a.decision, t('dec')[a.decision]));
          li.appendChild(el('span', 'muted small', ' ' + t('sh_answer_by')(a.reviewer_name || '—') + (a.comment ? ` — “${a.comment}”` : '')));
        } else li.appendChild(el('span', 'muted small', ' — ' + t('sh_waiting')));
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
      meta.appendChild(document.createTextNode(`${t('h_cvs')(ev.cv_count)} · ${fmtDate(ev.created_at)}`));
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

  function renderMe() {
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
    $('run-note').textContent = (isPaid() && t('run_note_paid')) || (hasPackOnly() && t('run_note_pack')) || t('run_note');
    // Billing never breaks the rest of the page (e.g. an old cached trial.js without its texts).
    try { renderBilling(); } catch (e) { $('billing').hidden = true; $('plans').hidden = true; }
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

  function rerender() { if (me) { renderMe(); renderCvs(); renderHistory(); renderTeam(); if (auditEvents) renderAudit(); if (current) renderResults(current); renderReferral(); } }

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
      const ev = { id: r.id, created_at: r.created_at, job_title: r.job_title, cv_count: cvs.length, ranking: r.ranking, author: r.author };
      past.unshift(ev);
      try { me = await api('GET', '/api/me'); } catch (e) { me.credits_remaining = r.credits_remaining; me.pack_credits = 0; }
      if (isManager()) await loadHistory();
      renderMe(); renderHistory(); renderResults(ev);
      cvs = []; renderCvs();
      $('results').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      if (err.status === 401) return gate();
      showMsg(msg, 'err', err.message);
      if (err.code === 'no_credits' || err.code === 'trial_expired') { me.credits_remaining = 0; me.pack_credits = 0; renderMe(); }
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

  async function loadHistory() {
    const h = await api('GET', '/api/evaluations');
    past = h.evaluations || []; usage = h.usage || null;
  }

  function showApp() {
    $('loading').hidden = true; $('gate').hidden = true; $('consent').hidden = true; $('app').hidden = false; $('signout').hidden = false;
    rerender();
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
      try { const r = await api('POST', '/api/verify', { token: m[1] }); setSession(r.session); }
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
    loadReferral();
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
      loadReferral();
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
  $('job').addEventListener('input', () => { $('job-count').textContent = `${$('job').value.length} / ${MAX_JOB}`; });
  $('run').addEventListener('click', run);
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
