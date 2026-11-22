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
      list.appendChild(card);
    });
  }

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

  function renderMe() {
    $('org-name').textContent = me.organization;
    $('role').textContent = roleName(me.role);
    $('team').hidden = !isManager(); $('audit').hidden = !isManager();
    const c = $('credits'); c.textContent = t('a_credits')(me.credits_remaining); c.classList.toggle('warn', me.credits_remaining <= 1);
    $('until').textContent = me.trial_expires_at ? t('a_until')(fmtDate(me.trial_expires_at)) : '';
    const active = me.credits_remaining > 0 && me.trial_expires_at > Date.now();
    $('new').hidden = !active; $('over').hidden = active;
  }

  function rerender() { if (me) { renderMe(); renderCvs(); renderHistory(); renderTeam(); if (auditEvents) renderAudit(); if (current) renderResults(current); } }

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
      me.credits_remaining = r.credits_remaining;
      if (isManager()) await loadHistory();
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

  async function loadHistory() {
    const h = await api('GET', '/api/evaluations');
    past = h.evaluations || []; usage = h.usage || null;
  }

  function showApp() {
    $('loading').hidden = true; $('gate').hidden = true; $('consent').hidden = true; $('app').hidden = false; $('signout').hidden = false;
    rerender();
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
      if (me.needs_consent) {
        $('loading').hidden = true; $('consent').hidden = false; $('signout').hidden = false;
        return;
      }
      await loadHistory();
      if (isManager()) await loadTeam();
    } catch (err) { return gate(err.status === 401 ? undefined : err.message); }
    showApp();
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

  setupLangButtons(rerender);
  applyTexts();
  start();

})();
