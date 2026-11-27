// MRE·AI · shortlist page for the hiring manager (no account; the link carries the token after "#")
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const fmtDate = ms => new Date(ms).toLocaleDateString(LANG === 'pt' ? 'pt-BR' : LANG, { day: 'numeric', month: 'short', year: 'numeric' });
  const m = location.hash.match(/t=([A-Za-z0-9_-]{20,100})/);
  const token = m ? m[1] : '';
  const NAME_KEY = 'mre_sl_reviewer';
  // Several people can answer the same link: each browser keeps its own random reviewer id.
  const RID_KEY = 'mre_sl_reviewer_id';
  let reviewerId = '';
  try { reviewerId = localStorage.getItem(RID_KEY) || ''; } catch (e) {}
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(reviewerId)) {
    reviewerId = [...crypto.getRandomValues(new Uint8Array(18))].map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[b % 64]).join('');
    try { localStorage.setItem(RID_KEY, reviewerId); } catch (e) {}
  }
  let data = null;
  const picks = {}, notes = {}, ratings = {};

  const label = c => c.label || (LANG === 'en' ? 'Candidate ' : 'Candidato ') + c.id;
  // The evaluation calls candidates "Candidate A"; show the label the recruiter chose instead.
  const restore = (c, s) => (c.label ? s.replace(new RegExp('\\b(?:Candidate|Candidat[oa])\\s+' + c.id + '\\b', 'g'), () => c.label) : s);

  function gone(text) {
    $('sp-loading').hidden = true; $('sp').hidden = true; $('sp-gone').hidden = false;
    $('sp-gone-text').textContent = text;
  }

  function render() {
    if (!data) return;
    $('sp-job').textContent = data.job_title || '';
    $('sp-from').textContent = t('sp_from')(data.author_name || '—', data.organization || '—');
    $('sp-note').hidden = !data.note;
    if (data.note) $('sp-note').textContent = `${t('sp_note')}: ${data.note}`;
    $('sp-valid').textContent = t('sp_valid')(fmtDate(data.expires_at));
    const list = $('sp-list'); list.textContent = '';
    data.candidates.forEach(c => {
      const card = el('div', 'cand');
      const top = el('div', 'cand-top');
      top.appendChild(el('div', 'rank', String(c.rank)));
      const nm = el('div', 'cand-name', label(c));
      nm.appendChild(el('div', 'muted small', t('sp_rank')(c.rank, c.of)));
      top.appendChild(nm);
      top.appendChild(el('span', 'fit ' + c.fit, t('fit_' + c.fit)));
      top.appendChild(el('div', 'score', String(c.score)));
      card.appendChild(top);
      const tr = el('div', 'track'); const bar = el('i'); bar.style.width = Math.max(2, c.score) + '%'; tr.appendChild(bar); card.appendChild(tr);
      // Criteria ratings and knock-outs (comparisons with criteria only)
      const crit = data.criteria || [];
      if (crit.length && c.criteria && c.criteria.length) {
        const nm = id => (crit.find(k => k.id === id) || {}).name || id;
        if (c.knockout_failed && c.knockout_failed.length) card.appendChild(el('div', 'ko', '⚠ ' + t('r_ko')(c.knockout_failed.map(nm).join(', '))));
        const box = el('div', 'crit-list');
        c.criteria.forEach(r => {
          const k = crit.find(x => x.id === r.id); if (!k) return;
          const chip = el('span', 'crit r' + r.rating + (k.required ? ' req' : ''));
          chip.title = `${k.name}: ${(t('cr_r') || [])[r.rating] || r.rating}`;
          chip.appendChild(el('span', 'dots', '●'.repeat(r.rating) + '○'.repeat(4 - r.rating)));
          chip.appendChild(document.createTextNode(' ' + k.name));
          box.appendChild(chip);
        });
        card.appendChild(box);
      }
      const cols = el('div', 'cols');
      [['s', 'r_strengths', c.strengths], ['g', 'r_gaps', c.gaps]].forEach(([k, key, items]) => {
        const col = el('div'); col.appendChild(el('h4', k, t(key)));
        const ul = el('ul'); (items || []).forEach(s => ul.appendChild(el('li', '', restore(c, s)))); col.appendChild(ul);
        cols.appendChild(col);
      });
      card.appendChild(cols);
      if (c.evidence && c.evidence.length) card.appendChild(el('div', 'ev', t('r_evidence') + ': “' + c.evidence.map(s => restore(c, s)).join('” · “') + '”'));
      if (c.interview_questions && c.interview_questions.length) {
        const d = el('details', 'iq');
        d.appendChild(el('summary', '', `${t('r_questions')} (${c.interview_questions.length})`));
        const ol = el('ol');
        c.interview_questions.forEach(q => {
          const li = el('li');
          li.appendChild(el('span', 'qt', (t('q_type') || {})[q.type] || q.type));
          li.appendChild(document.createTextNode(restore(c, q.q)));
          if (q.good_answer) li.appendChild(el('span', 'qa', `${t('r_good')}: ${restore(c, q.good_answer)}`));
          ol.appendChild(li);
        });
        d.appendChild(ol); card.appendChild(d);
      }
      // Answer
      card.appendChild(el('div', 'small', t('sp_answer'))).style.cssText = 'font-weight:700;margin-top:14px';
      const dec = el('div', 'decide');
      ['advance', 'maybe', 'reject'].forEach(v => {
        const lab = el('label'); const r = el('input'); r.type = 'radio'; r.name = 'dec-' + c.id; r.value = v; r.checked = picks[c.id] === v;
        r.addEventListener('change', () => { picks[c.id] = v; });
        lab.appendChild(r); lab.appendChild(el('span', '', t('dec')[v])); dec.appendChild(lab);
      });
      card.appendChild(dec);
      // Optional overall rating 1–5
      const rt = el('div', 'decide sp-rate');
      rt.appendChild(el('span', 'small muted', t('sp_rate')));
      for (let v = 1; v <= 5; v++) {
        const lab = el('label'); const r = el('input'); r.type = 'radio'; r.name = 'rate-' + c.id; r.value = v; r.checked = ratings[c.id] === v;
        r.addEventListener('change', () => { ratings[c.id] = v; });
        lab.appendChild(r); lab.appendChild(el('span', '', String(v))); rt.appendChild(lab);
      }
      card.appendChild(rt);
      const ta = el('textarea'); ta.maxLength = 500; ta.placeholder = t('sp_comment'); ta.setAttribute('aria-label', t('sp_comment'));
      ta.value = notes[c.id] || ''; ta.addEventListener('input', () => { notes[c.id] = ta.value; });
      card.appendChild(ta);
      list.appendChild(card);
    });
  }

  async function load() {
    if (!token) return gone(t('err').shortlist_not_found);
    try { data = await api('POST', '/api/s/view', { token, reviewer_id: reviewerId }); }
    catch (err) { return gone(err.message); }
    if (data.lang && T[data.lang] && !new URLSearchParams(location.search).get('lang')) {
      let chosen = null; try { chosen = localStorage.getItem(TRIAL.LANG_KEY); } catch (e) {}
      if (!chosen) { LANG = data.lang; applyTexts(); }
    }
    (data.responses || []).forEach(r => { picks[r.candidate_id] = r.decision; notes[r.candidate_id] = r.comment || ''; if (r.overall) ratings[r.candidate_id] = r.overall; if (r.reviewer_name && !$('sp-name').value) $('sp-name').value = r.reviewer_name; });
    try { const n = localStorage.getItem(NAME_KEY); if (n && !$('sp-name').value) $('sp-name').value = n; } catch (e) {}
    $('sp-panel').textContent = data.other_reviewers ? t('sp_others')(data.other_reviewers) : t('sp_panel');
    $('sp-loading').hidden = true; $('sp').hidden = false;
    render();
  }

  $('sp-send').addEventListener('click', async () => {
    const msg = $('sp-msg'); msg.hidden = true;
    const reviewer = $('sp-name').value.trim();
    const decisions = data.candidates.filter(c => picks[c.id]).map(c => ({ id: c.id, decision: picks[c.id], comment: (notes[c.id] || '').trim(), overall: ratings[c.id] || null }));
    if (!decisions.length) return showMsg(msg, 'err', t('sp_need_one'));
    if (!reviewer) { $('sp-name').focus(); return showMsg(msg, 'err', t('sp_need_name')); }
    const btn = $('sp-send'); btn.disabled = true;
    try {
      await api('POST', '/api/s/respond', { token, reviewer_name: reviewer, reviewer_id: reviewerId, decisions });
      try { localStorage.setItem(NAME_KEY, reviewer); } catch (e) {}
      showMsg(msg, 'ok', t('sp_sent'));
    } catch (err) {
      showMsg(msg, 'err', err.message);
      if (err.status === 410 || err.status === 404) gone(err.message);
    } finally { btn.disabled = false; }
  });

  setupLangButtons(render);
  applyTexts();
  load();
})();
