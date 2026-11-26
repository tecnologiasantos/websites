// MRE·AI app · "Ajuda": support chat for signed-in people.
// Talks only to the MRE·AI Worker (POST /api/support/chat, with the session; "Meus chamados" and
// cancelling use GET /api/support/tickets and POST /api/support/ticket/cancel), which
// adds the account facts (plan, comparisons, validity, payments) and asks SantosBot.
// No Turnstile and no system prompt here: both live on the server. The conversation
// stays in this page's memory only; CVs are never sent.
// Needs trial.js (LANG, api) and app.js, which fires "mre:me" with /api/me (null when signed out).
(function () {
  'use strict';

  const MAX_TURNS = 20, MAX_CHARS = 2000;
  const UI = {
    en: {
      mine: 'My tickets', mineTitle: 'Your tickets', none: 'You have no tickets.', loading: 'Loading…',
      st: { open: 'Open', in_progress: 'In progress', on_hold: 'On hold', resolved: 'Resolved', canceled: 'Canceled' },
      pick: 'Which ticket do you want to cancel?', noneActive: 'You have no open tickets to cancel. To see all of them, use "My tickets" at the top.',
      cancel: 'Cancel ticket', reasonQ: code => `Cancel ticket ${code}? Tell us why:`, reasonPh: 'E.g. it was solved, I opened it by mistake…',
      confirm: 'Confirm cancellation', back: 'Back',
      canceled: (code, r) => `Ticket ${code} canceled.\nReason: ${r}\n\nWe sent the confirmation to your e-mail.`,
      cancelErr: { reason_required: 'Please write the reason (at least 3 letters).', ticket_closed: 'This ticket is already closed.', not_found: 'Ticket not found.' },
      fab: 'Help', title: 'MRE·AI help', status: 'Santos · AI assistant', placeholder: 'Type your question…', send: 'Send', close: 'Close help',
      welcome: n => `Hi${n ? ', ' + n : ''}! I'm Santos, the MRE·AI assistant. I can help with your plan, comparisons, payments, your team's access or privacy. How can I help?`,
      note: 'Answers by AI, with your account details. Do not paste CVs here. Urgent? support@tecnologiasantos.com',
      ticket: (code, c, d) => `Ticket ${code} opened (${c}).\nDescription: ${d}\nStatus: Open\n\nWe also sent this to your e-mail. The Tecnologia Santos team will reply there; mention ${code} if you write to support@tecnologiasantos.com.`,
      ticketUpd: (code, c, d) => `Ticket ${code} updated (${c}).\nDescription: ${d}`,
      cat: { billing: 'payment', refund: 'refund', access: 'access', bug: 'app error', data_privacy: 'data and privacy', feature_request: 'suggestion', other: 'other' },
      err: {
        support_busy: 'The help chat is busy right now. Please try again in a few minutes or write to support@tecnologiasantos.com.',
        rate_limited: 'Too many messages in a short time. Please wait a little and try again.',
        support_unavailable: 'The help chat is not available right now. Please write to support@tecnologiasantos.com.',
        message_too_long: `Messages are limited to ${MAX_CHARS} characters.`,
        session: 'Your session has expired. Please sign in again.',
        other: 'The help chat could not answer. Please try again or write to support@tecnologiasantos.com.',
      },
    },
    pt: {
      mine: 'Meus chamados', mineTitle: 'Seus chamados', none: 'Você não tem chamados.', loading: 'Carregando…',
      st: { open: 'Aberto', in_progress: 'Em andamento', on_hold: 'Em espera', resolved: 'Resolvido', canceled: 'Cancelado' },
      pick: 'Qual chamado você quer cancelar?', noneActive: 'Você não tem chamados abertos para cancelar. Para ver todos, use "Meus chamados" no topo.',
      cancel: 'Cancelar chamado', reasonQ: code => `Cancelar o chamado ${code}? Conte o motivo:`, reasonPh: 'Ex.: já resolvi, abri por engano…',
      confirm: 'Confirmar cancelamento', back: 'Voltar',
      canceled: (code, r) => `Chamado ${code} cancelado.\nMotivo: ${r}\n\nEnviamos a confirmação para o seu e-mail.`,
      cancelErr: { reason_required: 'Escreva o motivo (pelo menos 3 letras).', ticket_closed: 'Este chamado já está encerrado.', not_found: 'Chamado não encontrado.' },
      fab: 'Ajuda', title: 'Ajuda do MRE·AI', status: 'Santos · assistente de IA', placeholder: 'Digite sua dúvida…', send: 'Enviar', close: 'Fechar ajuda',
      welcome: n => `Olá${n ? ', ' + n : ''}! Sou o Santos, assistente do MRE·AI. Posso ajudar com seu plano, comparações, pagamentos, acesso da equipe ou privacidade. Como posso ajudar?`,
      note: 'Respostas por IA, com os dados da sua conta. Não cole currículos aqui. Urgente? support@tecnologiasantos.com',
      ticket: (code, c, d) => `Chamado ${code} aberto (${c}).\nDescrição: ${d}\nSituação: Aberto\n\nEnviamos estes dados também para o seu e-mail. A equipe da Tecnologia Santos vai responder por lá; cite o número ${code} se escrever para support@tecnologiasantos.com.`,
      ticketUpd: (code, c, d) => `Chamado ${code} atualizado (${c}).\nDescrição: ${d}`,
      cat: { billing: 'pagamento', refund: 'reembolso', access: 'acesso', bug: 'erro no app', data_privacy: 'dados e privacidade', feature_request: 'sugestão', other: 'outro assunto' },
      err: {
        support_busy: 'A ajuda está ocupada agora. Tente de novo em alguns minutos ou escreva para support@tecnologiasantos.com.',
        rate_limited: 'Muitas mensagens em pouco tempo. Espere um pouco e tente de novo.',
        support_unavailable: 'A ajuda não está disponível agora. Escreva para support@tecnologiasantos.com.',
        message_too_long: `As mensagens têm no máximo ${MAX_CHARS} caracteres.`,
        session: 'Sua sessão expirou. Entre de novo.',
        other: 'A ajuda não conseguiu responder. Tente de novo ou escreva para support@tecnologiasantos.com.',
      },
    },
    es: {
      mine: 'Mis tickets', mineTitle: 'Tus tickets', none: 'No tienes tickets.', loading: 'Cargando…',
      st: { open: 'Abierto', in_progress: 'En curso', on_hold: 'En espera', resolved: 'Resuelto', canceled: 'Cancelado' },
      pick: '¿Qué ticket quieres cancelar?', noneActive: 'No tienes tickets abiertos para cancelar. Para ver todos, usa "Mis tickets" arriba.',
      cancel: 'Cancelar ticket', reasonQ: code => `¿Cancelar el ticket ${code}? Cuéntanos el motivo:`, reasonPh: 'Ej.: ya se resolvió, lo abrí por error…',
      confirm: 'Confirmar cancelación', back: 'Volver',
      canceled: (code, r) => `Ticket ${code} cancelado.\nMotivo: ${r}\n\nEnviamos la confirmación a tu correo.`,
      cancelErr: { reason_required: 'Escribe el motivo (al menos 3 letras).', ticket_closed: 'Este ticket ya está cerrado.', not_found: 'Ticket no encontrado.' },
      fab: 'Ayuda', title: 'Ayuda de MRE·AI', status: 'Santos · asistente de IA', placeholder: 'Escribe tu pregunta…', send: 'Enviar', close: 'Cerrar ayuda',
      welcome: n => `¡Hola${n ? ', ' + n : ''}! Soy Santos, el asistente de MRE·AI. Puedo ayudarte con tu plan, comparaciones, pagos, el acceso de tu equipo o la privacidad. ¿En qué te ayudo?`,
      note: 'Respuestas por IA, con los datos de tu cuenta. No pegues CVs aquí. ¿Urgente? support@tecnologiasantos.com',
      ticket: (code, c, d) => `Ticket ${code} abierto (${c}).\nDescripción: ${d}\nEstado: Abierto\n\nTambién enviamos estos datos a tu correo. El equipo de Tecnologia Santos responderá allí; menciona ${code} si escribes a support@tecnologiasantos.com.`,
      ticketUpd: (code, c, d) => `Ticket ${code} actualizado (${c}).\nDescripción: ${d}`,
      cat: { billing: 'pago', refund: 'reembolso', access: 'acceso', bug: 'error en la app', data_privacy: 'datos y privacidad', feature_request: 'sugerencia', other: 'otro tema' },
      err: {
        support_busy: 'La ayuda está ocupada ahora. Inténtalo de nuevo en unos minutos o escribe a support@tecnologiasantos.com.',
        rate_limited: 'Demasiados mensajes en poco tiempo. Espera un poco e inténtalo de nuevo.',
        support_unavailable: 'La ayuda no está disponible ahora. Escribe a support@tecnologiasantos.com.',
        message_too_long: `Los mensajes tienen como máximo ${MAX_CHARS} caracteres.`,
        session: 'Tu sesión expiró. Vuelve a entrar.',
        other: 'La ayuda no pudo responder. Inténtalo de nuevo o escribe a support@tecnologiasantos.com.',
      },
    },
  };
  const ui = () => UI[typeof LANG !== 'undefined' && UI[LANG] ? LANG : 'en'];

  const css = `
.hp-widget{position:fixed;bottom:22px;right:22px;z-index:900;font-family:inherit}
.hp-fab{display:flex;align-items:center;gap:8px;background:#1a56db;color:#fff;border:0;border-radius:999px;padding:11px 18px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 8px 24px rgba(26,86,219,.35)}
.hp-fab:hover{background:#1040b0}.hp-fab svg{width:18px;height:18px;fill:currentColor}
.hp-panel{position:absolute;bottom:58px;right:0;width:370px;height:520px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.22);display:none;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0}
.hp-panel.open{display:flex}
.hp-head{background:#0a1e33;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}
.hp-info{flex:1;min-width:0}.hp-name{font-size:14px;font-weight:700}
.hp-status{font-size:11px;color:rgba(255,255,255,.78);margin-top:2px}
.hp-close{background:none;border:0;color:rgba(255,255,255,.85);cursor:pointer;font-size:22px;line-height:1;padding:0 4px}
.hp-close:hover{color:#fff}
.hp-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f7f9fc}
.hp-msg{max-width:86%;padding:9px 13px;border-radius:12px;font-size:14px;line-height:1.5;word-break:break-word}
.hp-msg.bot{background:#fff;border:1px solid #e2e8f0;color:#1a202c;align-self:flex-start;border-bottom-left-radius:4px}
.hp-msg.bot ul{margin:6px 0 2px 16px;padding:0}
.hp-msg.user{background:#1a56db;color:#fff;align-self:flex-end;border-bottom-right-radius:4px;white-space:pre-wrap}
.hp-msg.info{align-self:stretch;max-width:none;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:13px;white-space:pre-line}
.hp-msg.err{align-self:stretch;max-width:none;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-size:13px}
.hp-msg.typing{color:#4a5568;letter-spacing:3px}
.hp-bar{padding:10px 12px;border-top:1px solid #e2e8f0;display:flex;gap:8px;background:#fff;align-items:flex-end}
.hp-input{flex:1;border:1.5px solid #e2e8f0;border-radius:8px;padding:9px 11px;font:inherit;font-size:14px;outline:none;resize:none;max-height:110px;line-height:1.4}
.hp-input:focus{border-color:#1a56db}
.hp-send{background:#1a56db;color:#fff;border:0;border-radius:8px;padding:0 14px;height:38px;font:inherit;font-weight:700;cursor:pointer}
.hp-send:disabled{opacity:.45;cursor:not-allowed}
.hp-note{font-size:11px;color:#64748b;padding:0 12px 10px;background:#fff}
.hp-mine{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:5px 11px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}
.hp-mine:hover{background:rgba(255,255,255,.22)}
.hp-card{align-self:stretch;max-width:none;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:13px;color:#1a202c}
.hp-card h4{margin:0 0 8px;font-size:13px}
.hp-tk{border-top:1px solid #eef2f7;padding:8px 0;display:flex;flex-direction:column;gap:4px}.hp-tk:first-of-type{border-top:0;padding-top:0}
.hp-tk-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hp-tk-code{font-weight:700;font-family:ui-monospace,monospace;font-size:12px}
.hp-tk-st{font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px;background:#eef2ff;color:#3730a3}
.hp-tk-st.closed{background:#f1f5f9;color:#475569}.hp-tk-d{color:#4a5568}
.hp-btn{align-self:flex-start;background:#fff;border:1.5px solid #e2e8f0;color:#1a202c;border-radius:8px;padding:5px 10px;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.hp-btn:hover{border-color:#1a56db}.hp-btn.danger{color:#b91c1c;border-color:#fecaca}.hp-btn.danger:hover{border-color:#b91c1c}
.hp-btn.primary{background:#b91c1c;border-color:#b91c1c;color:#fff}.hp-btn:disabled{opacity:.5;cursor:not-allowed}
.hp-card textarea{width:100%;box-sizing:border-box;border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 10px;font:inherit;font-size:13px;margin:6px 0 8px;resize:vertical;min-height:58px}
.hp-row{display:flex;gap:8px;flex-wrap:wrap}.hp-card .hp-err{color:#991b1b;font-size:12px;margin:0 0 6px}
@media(max-width:480px){.hp-widget{bottom:14px;right:14px}.hp-panel{width:calc(100vw - 28px);height:min(520px,calc(100vh - 100px))}}
@media print{.hp-widget{display:none}}`;
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 15.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm1.3-4.9v.65h-2.5v-1.1c0-1.2.8-1.8 1.5-2.3.6-.4 1-.7 1-1.35 0-.7-.6-1.2-1.4-1.2-.85 0-1.45.5-1.6 1.3l-2.4-.5C8.3 6.4 9.9 5.2 12 5.2c2.3 0 3.9 1.4 3.9 3.3 0 1.5-.95 2.2-1.7 2.75-.5.35-.9.65-.9 1.35z"/></svg>';

  let els = null, me = null, history = [], open = false, busy = false, greeted = false;

  function renderMarkdown(text) {
    let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
    s = s.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');
    s = s.replace(/(?:^|\n)[•\-]\s+(.+)/g, (_, item) => `<li>${item}</li>`);
    if (s.includes('<li>')) s = s.replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul>${m}</ul>`);
    return s.replace(/\n/g, '<br>');
  }
  function addMsg(kind, text) {
    const d = document.createElement('div');
    d.className = 'hp-msg ' + kind;
    if (kind === 'bot') d.innerHTML = renderMarkdown(text); // escaped above; only <strong>, <em>, <ul>, <li>, <br> are added
    else d.textContent = text;
    els.msgs.appendChild(d);
    els.msgs.scrollTop = els.msgs.scrollHeight;
    return d;
  }

  function build() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const w = document.createElement('div');
    w.className = 'hp-widget no-print';
    w.hidden = true;
    w.innerHTML =
      '<div class="hp-panel" role="dialog" aria-modal="false">' +
        '<div class="hp-head"><div class="hp-info"><div class="hp-name"></div><div class="hp-status"></div></div>' +
          '<button type="button" class="hp-mine"></button><button type="button" class="hp-close">×</button></div>' +
        '<div class="hp-msgs" aria-live="polite"></div>' +
        '<div class="hp-bar"><textarea class="hp-input" rows="1"></textarea><button type="button" class="hp-send"></button></div>' +
        '<div class="hp-note"></div>' +
      '</div>' +
      '<button type="button" class="hp-fab">' + ICON + '<span class="hp-fab-t"></span></button>';
    document.body.appendChild(w);
    els = {
      root: w, panel: w.querySelector('.hp-panel'), msgs: w.querySelector('.hp-msgs'), input: w.querySelector('.hp-input'),
      send: w.querySelector('.hp-send'), fab: w.querySelector('.hp-fab'), fabT: w.querySelector('.hp-fab-t'),
      close: w.querySelector('.hp-close'), mine: w.querySelector('.hp-mine'), name: w.querySelector('.hp-name'), status: w.querySelector('.hp-status'), note: w.querySelector('.hp-note'),
    };
    els.input.maxLength = MAX_CHARS;
    els.fab.addEventListener('click', toggle);
    els.close.addEventListener('click', toggle);
    els.mine.addEventListener('click', () => showTickets(false));
    els.send.addEventListener('click', send);
    els.input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    els.input.addEventListener('input', () => { els.input.style.height = 'auto'; els.input.style.height = els.input.scrollHeight + 'px'; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) toggle(); });
    // trial.js changes LANG on these buttons first (its listeners were added earlier).
    document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', texts));
    texts();
  }
  function texts() {
    const u = ui();
    els.fabT.textContent = u.fab; els.fab.setAttribute('aria-expanded', String(open));
    els.name.textContent = u.title; els.status.textContent = u.status;
    els.input.placeholder = u.placeholder; els.send.textContent = u.send;
    els.close.setAttribute('aria-label', u.close); els.panel.setAttribute('aria-label', u.title);
    els.note.textContent = u.note; els.mine.textContent = u.mine;
  }
  function toggle() {
    open = !open;
    els.panel.classList.toggle('open', open);
    els.fab.setAttribute('aria-expanded', String(open));
    if (open && !greeted) {
      greeted = true;
      const first = me && me.name ? String(me.name).trim().split(/\s+/)[0] : '';
      addMsg('bot', ui().welcome(first)); // shown only: the conversation sent to the server starts with the person
    }
    if (open) setTimeout(() => els.input.focus(), 50); else els.fab.focus();
  }

  // ── The person's tickets: list and cancel (works without SantosBot) ──
  // "cancel my ticket" typed in the chat (pt / en / es): the app answers with the list.
  const CANCEL_RE = /\b(cancel\w*|anul\w*)\b[\s\S]{0,40}\b(chamados?|tickets?|casos?|solicita\w*)\b|\b(chamados?|tickets?)\b[\s\S]{0,40}\b(cancel\w*|anul\w*)\b/i;
  const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const btn = (label, cls, fn) => { const b = mk('button', 'hp-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.addEventListener('click', fn); return b; };
  function card() { const c = mk('div', 'hp-card'); els.msgs.appendChild(c); els.msgs.scrollTop = els.msgs.scrollHeight; return c; }
  function errText(err) {
    const u = ui();
    return err && err.status === 401 ? u.err.session : (err && (u.cancelErr[err.code] || u.err[err.code])) || u.err.other;
  }
  async function showTickets(onlyCancel, hint) {
    const u = ui(), c = card();
    c.appendChild(mk('h4', '', onlyCancel ? u.pick : u.mineTitle));
    const wait = c.appendChild(mk('div', 'hp-tk-d', u.loading));
    let list;
    try { list = (await api('GET', '/api/support/tickets')).tickets || []; }
    catch (err) { wait.textContent = errText(err); return; }
    wait.remove();
    const shown = onlyCancel ? list.filter(t => t.can_cancel) : list;
    const named = hint && shown.find(t => t.code === hint);
    if (named) { c.remove(); return askReason(named); }
    if (!shown.length) { c.firstChild.textContent = onlyCancel ? u.noneActive : u.none; return; }
    if (onlyCancel && shown.length === 1) { c.remove(); return askReason(shown[0]); }
    shown.forEach(t => {
      const row = c.appendChild(mk('div', 'hp-tk')), top = row.appendChild(mk('div', 'hp-tk-top'));
      row.dataset.id = t.id;
      top.appendChild(mk('span', 'hp-tk-code', t.code));
      top.appendChild(mk('span', 'hp-tk-st' + (t.can_cancel ? '' : ' closed'), u.st[t.status] || t.status));
      row.appendChild(mk('div', 'hp-tk-d', t.summary || ''));
      if (t.can_cancel) row.appendChild(btn(u.cancel, 'danger', () => askReason(t)));
    });
    els.msgs.scrollTop = els.msgs.scrollHeight;
  }
  function askReason(t) {
    const u = ui(), c = card();
    c.appendChild(mk('h4', '', u.reasonQ(t.code)));
    if (t.summary) c.appendChild(mk('div', 'hp-tk-d', t.summary));
    const ta = c.appendChild(mk('textarea')); ta.maxLength = 500; ta.placeholder = u.reasonPh;
    const err = c.appendChild(mk('p', 'hp-err')); err.hidden = true;
    const row = c.appendChild(mk('div', 'hp-row'));
    const ok = row.appendChild(btn(u.confirm, 'primary', async () => {
      const reason = ta.value.trim();
      if (reason.length < 3) { err.textContent = u.cancelErr.reason_required; err.hidden = false; ta.focus(); return; }
      ok.disabled = true; back.disabled = true; err.hidden = true;
      try {
        const r = await api('POST', '/api/support/ticket/cancel', { id: t.id, reason });
        c.remove(); addMsg('info', u.canceled(r.code || t.code, reason));
        // Lists shown earlier in the chat: now canceled, no button
        els.msgs.querySelectorAll('.hp-tk').forEach(row => {
          if (row.dataset.id !== t.id) return;
          const st = row.querySelector('.hp-tk-st'); if (st) { st.textContent = u.st.canceled; st.classList.add('closed'); }
          row.querySelectorAll('.hp-btn').forEach(b => b.remove());
        });
        els.msgs.querySelectorAll('.hp-msg.info .hp-btn[data-id="' + t.id + '"]').forEach(b => b.remove());
      } catch (e) {
        err.textContent = errText(e); err.hidden = false; ok.disabled = false; back.disabled = false;
        if (e && e.code === 'ticket_closed') ok.disabled = true;
      }
    }));
    const back = row.appendChild(btn(u.back, '', () => c.remove()));
    els.msgs.scrollTop = els.msgs.scrollHeight;
    setTimeout(() => ta.focus(), 30);
  }

  async function send() {
    const text = els.input.value.trim();
    if (!text || busy) return;
    const u = ui();
    if (text.length > MAX_CHARS) { addMsg('err', u.err.message_too_long); return; }
    els.input.value = ''; els.input.style.height = 'auto';
    addMsg('user', text);
    if (CANCEL_RE.test(text)) {
      const m = text.match(/MRE-?\s?(\d{1,5})/i);
      await showTickets(true, m ? 'MRE-' + m[1].padStart(5, '0') : null); return;
    }
    history.push({ role: 'user', content: text });
    busy = true; els.send.disabled = true;
    const typing = addMsg('typing bot', ''); typing.textContent = '•••';
    try {
      const r = await api('POST', '/api/support/chat', { messages: history.slice(-MAX_TURNS), lang: LANG });
      typing.remove();
      history.push({ role: 'assistant', content: r.text });
      addMsg('bot', r.text);
      if (r.ticket) {
        const t = r.ticket, cat = u.cat[t.category] || u.cat.other;
        // Older Worker without numbers: keep a plain notice.
        const text = (t.created === false ? u.ticketUpd : u.ticket)(t.code || '', cat, t.summary || '').replace(/ {2,}/g, ' ');
        const box = addMsg('info', text);
        if (t.id && t.code && (t.status || 'open') !== 'canceled') {
          const b = btn(u.cancel, 'danger', () => askReason({ id: t.id, code: t.code, summary: t.summary }));
          b.style.marginTop = '8px'; b.dataset.id = t.id; box.appendChild(document.createElement('br')); box.appendChild(b);
        }
      }
    } catch (err) {
      typing.remove();
      history.pop();                                // not answered: the person can send it again
      if (!els.input.value) els.input.value = text;
      const code = err && err.code;
      addMsg('err', err && err.status === 401 ? u.err.session : u.err[code] || u.err.other);
      if (code === 'support_unavailable') { els.input.disabled = true; els.send.disabled = true; busy = false; return; }
    }
    busy = false; els.send.disabled = false;
    els.input.focus();
  }

  function onMe(e) {
    me = e.detail || null;
    if (!els) build();
    const show = !!(me && me.support && !me.needs_consent);
    els.root.hidden = !show;
    if (!show && open) toggle();
    if (!me) { history = []; greeted = false; els.msgs.textContent = ''; }   // signed out: forget the conversation
  }
  document.addEventListener('mre:me', onMe);
})();
