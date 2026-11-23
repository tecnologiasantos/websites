// ─── SANTOSBOT on the MRE·AI page ────────────────────────────────────────────
// Same assistant as the home page (tecnologiasantos.com): same proxy, same
// Turnstile site key, same knowledge.json. Self-contained so it works with this
// page's CSP (no inline scripts, no external CSS): it injects its own styles and
// markup and uses addEventListener instead of onclick attributes.
// Needs trial.js loaded first (uses its LANG and turnstileReady globals).
(function () {
  'use strict';

  const PROXY_URL = 'https://tecnologiasantos-proxy.patient-hall-77b9.workers.dev';
  const CF_SITEKEY = '0x4AAAAAADGmyOYSzzt9bk0o';
  const KNOWLEDGE_URL = '/knowledge.json';
  const MODEL = 'claude-haiku-4-5-20251001';

  const UI = {
    en: {
      name: 'Santos Assistant', status: 'Online · AI Assistant', placeholder: 'Type your message…',
      welcome: "Hi! 👋 I'm Santos, the Tecnologia Santos assistant. I can help with the MRE·AI free trial, plans and prices, your team's access or privacy. What's your name?",
      error: 'Something went wrong. Please try again or email support@tecnologiasantos.com',
      open: 'Open chat', close: 'Close chat', send: 'Send',
    },
    pt: {
      name: 'Assistente Santos', status: 'Online · Assistente IA', placeholder: 'Digite sua mensagem…',
      welcome: 'Olá! 👋 Sou o Santos, assistente da Tecnologia Santos. Posso ajudar com o teste grátis do MRE·AI, planos e preços, acesso da sua equipe ou privacidade. Qual é o seu nome?',
      error: 'Algo deu errado. Tente de novo ou escreva para support@tecnologiasantos.com',
      open: 'Abrir chat', close: 'Fechar chat', send: 'Enviar',
    },
    es: {
      name: 'Asistente Santos', status: 'Online · Asistente IA', placeholder: 'Escribe tu mensaje…',
      welcome: '¡Hola! 👋 Soy Santos, el asistente de Tecnologia Santos. Puedo ayudarte con la prueba gratuita de MRE·AI, planes y precios, el acceso de tu equipo o la privacidad. ¿Cómo te llamas?',
      error: 'Algo salió mal. Inténtalo de nuevo o escríbenos a support@tecnologiasantos.com',
      open: 'Abrir chat', close: 'Cerrar chat', send: 'Enviar',
    },
  };

  // Base identity — kept in sync with CHAT_SYSTEM_BASE in /index.html, plus page context.
  const SYSTEM_BASE = {
    en: `You are the AI assistant for Tecnologia Santos, a Cloud, AI & Technical Consulting company headquartered in Brazil with a global reach. Be friendly, professional, and concise (keep replies under 120 words unless asked for more detail).
Answer questions about services: Cloud Architecture (AWS, OCI, Azure, GCP, Kubernetes, GitOps, Terraform), AI & Automation (LLMs, pipelines, predictive analytics), DevOps & Platform Engineering (CI/CD, IaC), Cybersecurity (SOC2, ISO 27001), IT Talent Placement, Data & Analytics, Linux/Windows/Network Infrastructure, Tracking & Marketing Intelligence (GTM, GA4, Meta API).
Tecnologia Santos was approved in Anthropic's Claude for Startups program; its products (MiraTech, MRE·AI, Bogoboom, SantosBot) are built with Claude.
Tecnologia Santos does not sell industrial plant-monitoring products. If asked about them, say so politely, offer Tecnologia Santos's own infrastructure, cloud and security services, and invite the user to write to support@tecnologiasantos.com so the request can be routed to the right company. Do not name or describe third-party products.
Platforms: MIRATECH (IT talent matching, miratech.tecnologiasantos.com) and BOGOBOOM (international mobility/relocation, bogoboom.tecnologiasantos.com).
Contact: support@tecnologiasantos.com | Sites: tecnologiasantos.com and tecnologiasantos.com.br.
PAGE CONTEXT: the visitor is on the MRE·AI page (tecnologiasantos.com/mre-ai), where they can start the free trial, sign in, see the plans and download the user manual. Focus on MRE·AI (trial, plans, prices, billing, team access, privacy) unless they ask about something else. You already greeted them and asked their name.
Respond ONLY in English.`,

    pt: `Você é o assistente de IA da Tecnologia Santos, empresa de consultoria em Cloud, IA e Tecnologia sediada no Brasil com alcance global. Seja amigável, profissional e objetivo (respostas de até 120 palavras, salvo pedido de mais detalhes).
Responda sobre serviços: Arquitetura Cloud (AWS, OCI, Azure, GCP, Kubernetes, GitOps, Terraform), IA & Automação (LLMs, pipelines, analytics preditivo), DevOps & Engenharia de Plataforma (CI/CD, IaC), Cibersegurança (SOC2, ISO 27001), Recrutamento de TI, Dados & Analytics, Infraestrutura Linux/Windows/Rede, Tracking & Marketing Intelligence (GTM, GA4, API Meta).
A Tecnologia Santos foi aprovada no programa Claude for Startups, da Anthropic; seus produtos (MiraTech, MRE·AI, Bogoboom, SantosBot) são construídos com o Claude.
A Tecnologia Santos não vende produtos de monitoramento industrial de plantas. Se perguntarem, diga isso com educação, ofereça os serviços próprios da Tecnologia Santos (infraestrutura, nuvem e segurança) e convide o usuário a escrever para support@tecnologiasantos.com, para que o pedido seja encaminhado à empresa certa. Não cite nem descreva produtos de terceiros.
Plataformas: MIRATECH (matching de talentos TI, miratech.tecnologiasantos.com) e BOGOBOOM (mobilidade/realocação internacional, bogoboom.tecnologiasantos.com).
Contato: support@tecnologiasantos.com | Sites: tecnologiasantos.com e tecnologiasantos.com.br.
CONTEXTO DA PÁGINA: o visitante está na página do MRE·AI (tecnologiasantos.com/mre-ai), onde pode começar o teste grátis, entrar, ver os planos e baixar o manual do usuário. Foque no MRE·AI (teste, planos, preços, cobrança, acesso da equipe, privacidade), a menos que perguntem outra coisa. Você já cumprimentou e perguntou o nome.
Responda APENAS em Português.`,

    es: `Eres el asistente de IA de Tecnología Santos, empresa de consultoría en Cloud, IA y Tecnología con sede en Brasil y alcance global. Sé amigable, profesional y conciso (respuestas de hasta 120 palabras salvo que se solicite más detalle).
Responde sobre servicios: Arquitectura Cloud (AWS, OCI, Azure, GCP, Kubernetes, GitOps, Terraform), IA & Automatización (LLMs, pipelines, analítica predictiva), DevOps & Ingeniería de Plataforma (CI/CD, IaC), Ciberseguridad (SOC2, ISO 27001), Colocación de Talento IT, Datos & Analítica, Infraestructura Linux/Windows/Red, Marketing Intelligence (GTM, GA4, API Meta).
Tecnologia Santos fue aprobada en el programa Claude for Startups de Anthropic; sus productos (MiraTech, MRE·AI, Bogoboom, SantosBot) están construidos con Claude.
Tecnologia Santos no vende productos de monitoreo industrial de plantas. Si preguntan, dígalo con amabilidad, ofrezca los servicios propios de Tecnologia Santos (infraestructura, nube y seguridad) e invite al usuario a escribir a support@tecnologiasantos.com para que la solicitud se dirija a la empresa correcta. No nombre ni describa productos de terceros.
Plataformas: MIRATECH (matching talento IT, miratech.tecnologiasantos.com) y BOGOBOOM (movilidad/reubicación internacional, bogoboom.tecnologiasantos.com).
Contacto: support@tecnologiasantos.com | Sitios: tecnologiasantos.com y tecnologiasantos.com.br.
CONTEXTO DE LA PÁGINA: el visitante está en la página de MRE·AI (tecnologiasantos.com/mre-ai), donde puede empezar la prueba gratuita, entrar, ver los planes y descargar el manual del usuario. Enfócate en MRE·AI (prueba, planes, precios, cobro, acceso del equipo, privacidad) salvo que pregunte otra cosa. Ya lo saludaste y le preguntaste su nombre.
Responde SOLO en Español.`,
  };

  const lang = () => {
    const l = (typeof LANG !== 'undefined' && LANG) || (document.documentElement.lang || 'en').slice(0, 2);
    return UI[l] ? l : 'en';
  };

  // ── Styles (CSP allows inline styles) ──────────────────────────────────────
  const css = `
.sb-widget{position:fixed;bottom:28px;right:28px;z-index:9999;font-family:'Segoe UI',Arial,sans-serif}
.sb-fab{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#1a56db 0%,#0e3d9e 100%);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 22px rgba(26,86,219,.45);transition:transform .2s,box-shadow .2s}
.sb-fab:hover{transform:scale(1.08);box-shadow:0 6px 30px rgba(26,86,219,.55)}
.sb-fab svg,.sb-send svg,.sb-close svg,.sb-avatar svg{width:22px;height:22px;fill:currentColor}
.sb-send svg{width:16px;height:16px}.sb-close svg{width:18px;height:18px}.sb-avatar svg{width:18px;height:18px}
.sb-panel{display:none;flex-direction:column;position:absolute;bottom:74px;right:0;width:360px;height:510px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 8px 44px rgba(0,0,0,.16);overflow:hidden}
.sb-panel.open{display:flex}
.sb-head{background:linear-gradient(135deg,#1a56db 0%,#0e3d9e 100%);color:#fff;padding:14px 18px;display:flex;align-items:center;gap:10px}
.sb-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-info{flex:1;min-width:0}
.sb-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-status{font-size:11px;color:rgba(255,255,255,.78);display:flex;align-items:center;gap:5px;margin-top:2px}
.sb-dot{width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block}
.sb-close{background:none;border:none;color:rgba(255,255,255,.85);cursor:pointer;padding:2px 4px;display:flex}
.sb-close:hover{color:#fff}
.sb-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#f7f9fc}
.sb-msg{max-width:84%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.55;word-break:break-word}
.sb-msg.bot{background:#fff;border:1px solid #e2e8f0;color:#1a202c;align-self:flex-start;border-bottom-left-radius:4px}
.sb-msg.bot ul{margin:6px 0 2px 16px;padding:0;display:flex;flex-direction:column;gap:3px}
.sb-msg.user{background:#1a56db;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.sb-msg.typing{color:#4a5568;letter-spacing:3px}
.sb-bar{padding:12px 14px;border-top:1px solid #e2e8f0;display:flex;gap:8px;background:#fff;align-items:flex-end}
.sb-input{flex:1;border:1.5px solid #e2e8f0;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;resize:none;max-height:100px;line-height:1.4}
.sb-input:focus{border-color:#1a56db}
.sb-send{background:#1a56db;color:#fff;border:none;border-radius:8px;width:38px;height:38px;min-width:38px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.sb-send:hover{background:#1040b0}.sb-send:disabled{opacity:.45;cursor:not-allowed}
.sb-ts{position:fixed;top:-9999px;left:-9999px;width:0;height:0;pointer-events:none}
@media(max-width:480px){.sb-widget{bottom:16px;right:16px}.sb-panel{width:calc(100vw - 32px);height:460px}}`;

  const ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 6v2h2V9H7zm4 0v2h2V9h-2zm4 0v2h2V9h-2z"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21 23 12 2 3v7l15 2-15 2z"/></svg>';
  const ICON_BOT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a2 2 0 0 1 1 3.7V7h5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h5V5.7A2 2 0 0 1 12 2zM9 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>';

  let els = {};
  let open = false, started = false, history = [];
  let knowledge = { en: '', pt: '', es: '' };

  function build() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const w = document.createElement('div');
    w.className = 'sb-widget';
    w.innerHTML =
      '<div class="sb-panel" role="dialog" aria-live="polite">' +
        '<div class="sb-head"><div class="sb-avatar">' + ICON_BOT + '</div>' +
          '<div class="sb-info"><div class="sb-name"></div><div class="sb-status"><span class="sb-dot"></span><span class="sb-status-t"></span></div></div>' +
          '<button type="button" class="sb-close">' + ICON_X + '</button></div>' +
        '<div class="sb-msgs"></div>' +
        '<div class="sb-bar"><textarea class="sb-input" rows="1" maxlength="2000"></textarea>' +
          '<button type="button" class="sb-send">' + ICON_SEND + '</button></div>' +
      '</div>' +
      '<button type="button" class="sb-fab">' + ICON_CHAT + '</button>' +
      '<div class="sb-ts" id="sb-turnstile"></div>';
    document.body.appendChild(w);

    els = {
      panel: w.querySelector('.sb-panel'), msgs: w.querySelector('.sb-msgs'),
      input: w.querySelector('.sb-input'), send: w.querySelector('.sb-send'),
      fab: w.querySelector('.sb-fab'), close: w.querySelector('.sb-close'),
      name: w.querySelector('.sb-name'), status: w.querySelector('.sb-status-t'),
    };
    els.fab.addEventListener('click', toggle);
    els.close.addEventListener('click', toggle);
    els.send.addEventListener('click', send);
    els.input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    els.input.addEventListener('input', () => { els.input.style.height = 'auto'; els.input.style.height = els.input.scrollHeight + 'px'; });
    // trial.js updates LANG on these buttons first (its listeners were added earlier)
    document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', applyTexts));
    applyTexts();
  }

  function applyTexts() {
    const u = UI[lang()];
    els.name.textContent = u.name;
    els.status.textContent = u.status;
    els.input.placeholder = u.placeholder;
    els.fab.setAttribute('aria-label', u.open);
    els.close.setAttribute('aria-label', u.close);
    els.send.setAttribute('aria-label', u.send);
  }

  function toggle() {
    open = !open;
    els.panel.classList.toggle('open', open);
    if (open && !started) { started = true; addMsg('bot', UI[lang()].welcome); }
    if (open) setTimeout(() => els.input.focus(), 100);
  }

  function renderMarkdown(text) {
    let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1<em>$2</em>');
    s = s.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');
    s = s.replace(/(?:^|\n)[•\-]\s+(.+)/g, (_, item) => `<li>${item}</li>`);
    if (s.includes('<li>')) s = s.replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul>${m}</ul>`);
    return s.replace(/\n/g, '<br>');
  }

  function addMsg(who, text) {
    const el = document.createElement('div');
    el.className = 'sb-msg ' + who;
    if (who === 'bot') el.innerHTML = renderMarkdown(text); else el.textContent = text;
    els.msgs.appendChild(el);
    els.msgs.scrollTop = els.msgs.scrollHeight;
    return el;
  }

  // ── Turnstile (invisible, own widget; page's api.js is already loaded) ─────
  let cfToken = null, cfId = null;
  function cfRefresh() { if (cfId === null) return; try { turnstile.reset(cfId); turnstile.execute(cfId); } catch (e) {} }
  async function initTurnstile() {
    if (typeof turnstileReady !== 'undefined') await turnstileReady;
    else await new Promise(r => { const iv = setInterval(() => { if (window.turnstile) { clearInterval(iv); r(); } }, 200); });
    cfId = turnstile.render('#sb-turnstile', {
      sitekey: CF_SITEKEY, execution: 'execute', 'refresh-expired': 'manual', retry: 'auto',
      callback: tok => { cfToken = tok; },
      'expired-callback': () => { cfToken = null; cfRefresh(); },
      'error-callback': () => { cfToken = null; setTimeout(cfRefresh, 3000); },
    });
    turnstile.execute(cfId);
  }
  function getToken() {
    const take = () => { const t = cfToken; cfToken = null; cfRefresh(); return t; };
    if (cfToken) return Promise.resolve(take());
    cfRefresh();
    return new Promise((resolve, reject) => {
      let waited = 0;
      const iv = setInterval(() => {
        waited += 200;
        if (cfToken) { clearInterval(iv); resolve(take()); }
        else if (waited >= 15000) { clearInterval(iv); reject(new Error('turnstile_timeout')); }
      }, 200);
    });
  }

  function systemPrompt(l) {
    const docs = (knowledge[l] || knowledge.en || '').trim();
    return docs ? SYSTEM_BASE[l] + '\n\n## EXTENDED KNOWLEDGE BASE (use this to answer specific questions):\n' + docs : SYSTEM_BASE[l];
  }

  async function send() {
    const text = els.input.value.trim();
    if (!text || els.send.disabled) return;
    const l = lang();
    els.input.value = ''; els.input.style.height = 'auto';
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    els.send.disabled = true;
    const typing = addMsg('bot typing', '');
    typing.textContent = '•••';
    try {
      const token = await getToken();
      const res = await fetch(PROXY_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 500, system: systemPrompt(l), messages: history, cfToken: token }),
      });
      const data = await res.json();
      typing.remove();
      const reply = !data.error && data && data.content && data.content[0] && data.content[0].text;
      if (reply) { history.push({ role: 'assistant', content: reply }); addMsg('bot', reply); }
      else { history.pop(); addMsg('bot', UI[l].error); if (data.error) console.error('[SantosBot]', data.error); }
    } catch (err) {
      typing.remove(); history.pop();
      console.error('[SantosBot]', err);
      addMsg('bot', UI[l].error);
    }
    els.send.disabled = false;
    els.input.focus();
  }

  function start() {
    build();
    fetch(KNOWLEDGE_URL + '?v=' + Date.now())
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { knowledge = d; })
      .catch(() => console.warn('[SantosBot] knowledge.json not loaded — using base prompt only'));
    initTurnstile().catch(e => console.warn('[SantosBot] Turnstile', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
