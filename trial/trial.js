// MRE·AI free trial · shared configuration, texts and API helper
'use strict';

const TRIAL = {
  API: 'https://mre-ai-trial.patient-hall-77b9.workers.dev',
  TURNSTILE_SITEKEY: '0x4AAAAAADGmyOYSzzt9bk0o',
  SESSION_KEY: 'mre_trial_session',
  LANG_KEY: 'ts_trial_lang',
};

const T = {
  en: {
    nav_back: 'Back to site',
    s_label: 'MRE·AI · Free trial',
    s_title: 'Rank your candidates with AI, on your own vacancy',
    s_lead: 'Paste a job description, add up to 5 CVs and get a ranking with scores, strengths, gaps and evidence in under a minute.',
    f1_t: '3 free comparisons for 14 days', f1_d: 'Each comparison: one job description against up to 5 CVs.',
    f2_t: 'Privacy first', f2_d: 'CVs are read in your browser; names, e-mails, phones, CPF and links are removed before anything is sent. CV text is never stored.',
    f3_t: 'Objective and explainable', f3_d: 'Every score comes with strengths, gaps and quotes from the CV. It supports your decision; it does not replace it.',
    tab_signup: 'Start free trial', tab_login: 'I already have an account',
    l_name: 'Full name', l_email: 'Work e-mail', l_company: 'Company', l_title: 'Job title (optional)',
    hint_email: 'Company e-mails get access immediately. Personal addresses (Gmail, Hotmail…) are reviewed first.',
    c_terms: 'I accept the trial terms and the <a href="../privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I confirm my company has a legal basis to process the CVs I upload.',
    c_marketing: 'I would like to receive news about Tecnologia Santos products (optional).',
    b_signup: 'Send my access link', b_login: 'Send sign-in link',
    login_lead: 'Already signed up? Enter the e-mail you used and we will send you a new sign-in link. You do not need to register again.',
    ok_check: 'Check your e-mail. We sent a sign-in link that is valid for 30 minutes. It may take a minute to arrive; check the spam folder too.',
    ok_pending: 'Thank you! Because you used a personal e-mail address, our team reviews the request first. You will receive your sign-in link within one business day.',
    ok_title: 'Almost there',
    have_account: 'Already signed up?', have_account_link: 'Get a sign-in link',
    act_title: 'You are signed in', act_text: 'Your trial session is open in this tab. Continue where you left off.',
    b_open_app: 'Open my app', b_other_account: 'Use another e-mail',
    terms_title: 'Trial terms',
    terms: [
      'The trial is free, for evaluation only, and limited to 3 comparisons per company over 14 days.',
      'You must have a legal basis under the LGPD to process the CVs you upload. Your company is the controller of the candidates’ data; Tecnologia Santos processes it only to deliver the comparison.',
      'CV text is extracted and anonymized in your browser, sent to the Claude API (Anthropic) for the evaluation, and not stored. Rankings are kept for 30 days and then deleted.',
      'Results support, and never replace, a human hiring decision. Do not use them as the only basis for rejecting a candidate.',
      'You can delete your account and results at any time from the trial page, or by writing to support@tecnologiasantos.com.',
    ],
    a_title: 'MRE·AI free trial', a_credits: n => `${n} comparison${n === 1 ? '' : 's'} left`, a_until: d => `Trial until ${d}`,
    a_home: 'MRE·AI page', a_signout: 'Sign out', a_new: 'New comparison',
    l_job: 'Job description', ph_job: 'Paste the full job description: role, responsibilities, must-have and nice-to-have requirements.',
    l_cvs: 'Candidates’ CVs', drop: '<b>Choose files</b> or drop them here · PDF, DOCX or TXT · up to 5',
    cv_name: 'Candidate name (stays in your browser)', cv_chars: n => `${n.toLocaleString()} characters sent`,
    cv_trunc: 'Long CV: only the first 12,000 characters are used.', cv_empty: 'No text found. Is this a scanned image? Use a PDF with selectable text.',
    cv_preview: 'See exactly what is sent', cv_reading: 'Reading…', cv_err: 'This file could not be read.',
    b_run: 'Compare candidates', run_note: 'Uses 1 of your trial comparisons.',
    running: 'MRE·AI is reading the CVs…', r_title: 'Ranking', r_summary: 'Summary',
    r_strengths: 'Strengths', r_gaps: 'Gaps', r_evidence: 'From the CV',
    fit_strong: 'Strong fit', fit_partial: 'Partial fit', fit_weak: 'Weak fit',
    r_disclaimer: 'MRE·AI evaluates only job-related evidence and ignores age, gender, origin and other personal characteristics. The ranking supports, and does not replace, a human hiring decision.',
    b_print: 'Print or save as PDF',
    h_title: 'Previous comparisons (kept 30 days)', h_none: 'No comparisons yet.', h_cvs: n => `${n} CV${n === 1 ? '' : 's'}`,
    acc_title: 'Your data', acc_text: 'Delete your trial account and all your comparisons now. This cannot be undone.',
    b_delete: 'Delete my account', confirm_delete: 'Delete your trial account and all your comparisons? This cannot be undone.',
    deleted: 'Your account and comparisons were deleted.',
    gate_title: 'Please sign in', gate_text: 'Your session has ended or this link was already used. Request a new sign-in link.',
    gate_btn: 'Get a sign-in link', signing_in: 'Signing you in…',
    over_title: 'You have used your trial', over_text: 'Thank you for trying MRE·AI. Write to support@tecnologiasantos.com to set up the MIRA pilot or a plan for your team.',
    need_job: 'Paste the job description (at least 50 characters).', need_cv: 'Add at least one readable CV.',
    err: {
      turnstile_missing: 'Please complete the security check.', turnstile_failed: 'The security check failed. Please try again.',
      invalid_input: 'Please fill in name, a valid e-mail and company.', consent_required: 'Please accept the trial terms to continue.',
      rate_limited: 'Too many attempts. Please wait a minute and try again.', email_failed: 'We could not send the e-mail. Please try again in a few minutes.',
      link_expired: 'This link has expired or was already used. Request a new one.', invalid_link: 'This link is not valid. Request a new one.',
      session_expired: 'Your session has ended. Please sign in again.', unauthenticated: 'Please sign in.',
      no_credits: 'Your organization has used all trial comparisons.', trial_expired: 'Your trial period has ended.',
      paused: 'The trial is temporarily paused. Please try again tomorrow.', evaluation_failed: 'The evaluation could not be completed. Your credit was not used. Please try again.',
      job_too_short: 'Please paste the full job description.', job_too_long: 'The job description is too long (6,000 characters maximum).',
      cv_too_short: 'One CV has too little text.', cv_too_long: 'One CV is too long.', cv_count: 'Add between 1 and 5 CVs.',
      network: 'Could not reach the server. Check your connection and try again.', server_error: 'Unexpected error. Please try again.',
    },
  },
  pt: {
    nav_back: 'Voltar ao site',
    s_label: 'MRE·AI · Teste grátis',
    s_title: 'Classifique seus candidatos com IA, na sua própria vaga',
    s_lead: 'Cole a descrição da vaga, adicione até 5 currículos e receba um ranking com notas, pontos fortes, lacunas e evidências em menos de um minuto.',
    f1_t: '3 comparações grátis por 14 dias', f1_d: 'Cada comparação: uma descrição de vaga com até 5 currículos.',
    f2_t: 'Privacidade em primeiro lugar', f2_d: 'Os currículos são lidos no seu navegador; nomes, e-mails, telefones, CPF e links são removidos antes do envio. O texto dos currículos nunca é armazenado.',
    f3_t: 'Objetivo e explicável', f3_d: 'Cada nota vem com pontos fortes, lacunas e trechos do currículo. Ela apoia sua decisão; não a substitui.',
    tab_signup: 'Começar teste grátis', tab_login: 'Já tenho cadastro',
    l_name: 'Nome completo', l_email: 'E-mail corporativo', l_company: 'Empresa', l_title: 'Cargo (opcional)',
    hint_email: 'E-mails da empresa têm acesso imediato. Endereços pessoais (Gmail, Hotmail…) passam por análise antes.',
    c_terms: 'Aceito os termos do teste e a <a href="../privacy-policy.html" target="_blank" rel="noopener">Política de Privacidade</a>, e confirmo que minha empresa tem base legal para tratar os currículos que eu enviar.',
    c_marketing: 'Quero receber novidades sobre os produtos da Tecnologia Santos (opcional).',
    b_signup: 'Enviar meu link de acesso', b_login: 'Enviar link de acesso',
    login_lead: 'Já se cadastrou? Informe o e-mail usado no cadastro e enviaremos um novo link de acesso. Não é preciso se cadastrar de novo.',
    ok_check: 'Confira seu e-mail. Enviamos um link de acesso válido por 30 minutos. Pode levar um minuto para chegar; veja também a caixa de spam.',
    ok_pending: 'Obrigado! Como você usou um e-mail pessoal, nossa equipe analisa o pedido antes. Você receberá o link de acesso em até um dia útil.',
    ok_title: 'Quase lá',
    have_account: 'Já tem cadastro?', have_account_link: 'Receber link de acesso',
    act_title: 'Você já está conectado', act_text: 'Sua sessão do teste está aberta nesta aba. Continue de onde parou.',
    b_open_app: 'Abrir meu app', b_other_account: 'Usar outro e-mail',
    terms_title: 'Termos do teste',
    terms: [
      'O teste é gratuito, apenas para avaliação, e limitado a 3 comparações por empresa durante 14 dias.',
      'Você precisa ter base legal, nos termos da LGPD, para tratar os currículos que enviar. Sua empresa é a controladora dos dados dos candidatos; a Tecnologia Santos os trata apenas para entregar a comparação.',
      'O texto dos currículos é extraído e anonimizado no seu navegador, enviado à API do Claude (Anthropic) para a avaliação e não é armazenado. Os rankings ficam guardados por 30 dias e depois são excluídos.',
      'Os resultados apoiam, e nunca substituem, uma decisão humana de contratação. Não os use como única base para recusar um candidato.',
      'Você pode excluir sua conta e seus resultados a qualquer momento na página do teste, ou escrevendo para support@tecnologiasantos.com.',
    ],
    a_title: 'Teste grátis do MRE·AI', a_credits: n => `${n} ${n === 1 ? 'comparação restante' : 'comparações restantes'}`, a_until: d => `Teste até ${d}`,
    a_home: 'Página do MRE·AI', a_signout: 'Sair', a_new: 'Nova comparação',
    l_job: 'Descrição da vaga', ph_job: 'Cole a descrição completa da vaga: função, responsabilidades, requisitos obrigatórios e desejáveis.',
    l_cvs: 'Currículos dos candidatos', drop: '<b>Escolha os arquivos</b> ou arraste aqui · PDF, DOCX ou TXT · até 5',
    cv_name: 'Nome do candidato (fica no seu navegador)', cv_chars: n => `${n.toLocaleString('pt-BR')} caracteres enviados`,
    cv_trunc: 'Currículo longo: só os primeiros 12.000 caracteres são usados.', cv_empty: 'Nenhum texto encontrado. É uma imagem digitalizada? Use um PDF com texto selecionável.',
    cv_preview: 'Ver exatamente o que é enviado', cv_reading: 'Lendo…', cv_err: 'Não foi possível ler este arquivo.',
    b_run: 'Comparar candidatos', run_note: 'Usa 1 das suas comparações do teste.',
    running: 'O MRE·AI está lendo os currículos…', r_title: 'Ranking', r_summary: 'Resumo',
    r_strengths: 'Pontos fortes', r_gaps: 'Lacunas', r_evidence: 'Do currículo',
    fit_strong: 'Muito aderente', fit_partial: 'Parcialmente aderente', fit_weak: 'Pouco aderente',
    r_disclaimer: 'O MRE·AI avalia apenas evidências relacionadas à vaga e ignora idade, gênero, origem e outras características pessoais. O ranking apoia, e não substitui, uma decisão humana de contratação.',
    b_print: 'Imprimir ou salvar em PDF',
    h_title: 'Comparações anteriores (guardadas por 30 dias)', h_none: 'Nenhuma comparação ainda.', h_cvs: n => `${n} currículo${n === 1 ? '' : 's'}`,
    acc_title: 'Seus dados', acc_text: 'Exclua agora sua conta de teste e todas as suas comparações. Não é possível desfazer.',
    b_delete: 'Excluir minha conta', confirm_delete: 'Excluir sua conta de teste e todas as suas comparações? Não é possível desfazer.',
    deleted: 'Sua conta e suas comparações foram excluídas.',
    gate_title: 'Entre para continuar', gate_text: 'Sua sessão terminou ou este link já foi usado. Peça um novo link de acesso.',
    gate_btn: 'Receber link de acesso', signing_in: 'Entrando…',
    over_title: 'Você usou seu teste', over_text: 'Obrigado por experimentar o MRE·AI. Escreva para support@tecnologiasantos.com para preparar o piloto MIRA ou um plano para sua equipe.',
    need_job: 'Cole a descrição da vaga (pelo menos 50 caracteres).', need_cv: 'Adicione pelo menos um currículo legível.',
    err: {
      turnstile_missing: 'Conclua a verificação de segurança.', turnstile_failed: 'A verificação de segurança falhou. Tente novamente.',
      invalid_input: 'Preencha nome, um e-mail válido e empresa.', consent_required: 'Aceite os termos do teste para continuar.',
      rate_limited: 'Muitas tentativas. Aguarde um minuto e tente novamente.', email_failed: 'Não conseguimos enviar o e-mail. Tente novamente em alguns minutos.',
      link_expired: 'Este link expirou ou já foi usado. Peça um novo.', invalid_link: 'Este link não é válido. Peça um novo.',
      session_expired: 'Sua sessão terminou. Entre novamente.', unauthenticated: 'Entre para continuar.',
      no_credits: 'Sua organização usou todas as comparações do teste.', trial_expired: 'O período do seu teste terminou.',
      paused: 'O teste está temporariamente pausado. Tente novamente amanhã.', evaluation_failed: 'Não foi possível concluir a avaliação. Seu crédito não foi usado. Tente novamente.',
      job_too_short: 'Cole a descrição completa da vaga.', job_too_long: 'A descrição da vaga é longa demais (máximo de 6.000 caracteres).',
      cv_too_short: 'Um dos currículos tem pouco texto.', cv_too_long: 'Um dos currículos é longo demais.', cv_count: 'Adicione de 1 a 5 currículos.',
      network: 'Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.', server_error: 'Erro inesperado. Tente novamente.',
    },
  },
  es: {
    nav_back: 'Volver al sitio',
    s_label: 'MRE·AI · Prueba gratuita',
    s_title: 'Clasifica a tus candidatos con IA, en tu propia vacante',
    s_lead: 'Pega una descripción de vacante, agrega hasta 5 CVs y recibe un ranking con puntajes, fortalezas, brechas y evidencias en menos de un minuto.',
    f1_t: '3 comparaciones gratis por 14 días', f1_d: 'Cada comparación: una descripción de vacante con hasta 5 CVs.',
    f2_t: 'Privacidad primero', f2_d: 'Los CVs se leen en tu navegador; nombres, correos, teléfonos, documentos y enlaces se eliminan antes del envío. El texto de los CVs nunca se almacena.',
    f3_t: 'Objetivo y explicable', f3_d: 'Cada puntaje viene con fortalezas, brechas y citas del CV. Apoya tu decisión; no la reemplaza.',
    tab_signup: 'Empezar prueba gratis', tab_login: 'Ya tengo cuenta',
    l_name: 'Nombre completo', l_email: 'Correo corporativo', l_company: 'Empresa', l_title: 'Cargo (opcional)',
    hint_email: 'Los correos de empresa tienen acceso inmediato. Las direcciones personales (Gmail, Hotmail…) se revisan antes.',
    c_terms: 'Acepto los términos de la prueba y la <a href="../privacy-policy.html" target="_blank" rel="noopener">Política de Privacidad</a>, y confirmo que mi empresa tiene base legal para tratar los CVs que envíe.',
    c_marketing: 'Quiero recibir novedades sobre los productos de Tecnologia Santos (opcional).',
    b_signup: 'Enviar mi enlace de acceso', b_login: 'Enviar enlace de acceso',
    login_lead: '¿Ya te registraste? Escribe el correo que usaste y te enviaremos un nuevo enlace de acceso. No necesitas registrarte de nuevo.',
    ok_check: 'Revisa tu correo. Enviamos un enlace de acceso válido por 30 minutos. Puede tardar un minuto; revisa también la carpeta de spam.',
    ok_pending: '¡Gracias! Como usaste un correo personal, nuestro equipo revisa la solicitud primero. Recibirás tu enlace de acceso en un día hábil.',
    ok_title: 'Casi listo',
    have_account: '¿Ya tienes cuenta?', have_account_link: 'Recibir enlace de acceso',
    act_title: 'Ya iniciaste sesión', act_text: 'Tu sesión de prueba está abierta en esta pestaña. Continúa donde la dejaste.',
    b_open_app: 'Abrir mi app', b_other_account: 'Usar otro correo',
    terms_title: 'Términos de la prueba',
    terms: [
      'La prueba es gratuita, solo para evaluación, y limitada a 3 comparaciones por empresa durante 14 días.',
      'Debes tener base legal para tratar los CVs que envíes. Tu empresa es responsable de los datos de los candidatos; Tecnologia Santos los trata solo para entregar la comparación.',
      'El texto de los CVs se extrae y anonimiza en tu navegador, se envía a la API de Claude (Anthropic) para la evaluación y no se almacena. Los rankings se guardan 30 días y luego se eliminan.',
      'Los resultados apoyan, y nunca reemplazan, una decisión humana de contratación. No los uses como única base para rechazar a un candidato.',
      'Puedes eliminar tu cuenta y tus resultados en cualquier momento desde la página de la prueba, o escribiendo a support@tecnologiasantos.com.',
    ],
    a_title: 'Prueba gratuita de MRE·AI', a_credits: n => `${n} ${n === 1 ? 'comparación restante' : 'comparaciones restantes'}`, a_until: d => `Prueba hasta ${d}`,
    a_home: 'Página de MRE·AI', a_signout: 'Salir', a_new: 'Nueva comparación',
    l_job: 'Descripción de la vacante', ph_job: 'Pega la descripción completa: rol, responsabilidades, requisitos obligatorios y deseables.',
    l_cvs: 'CVs de los candidatos', drop: '<b>Elige archivos</b> o arrástralos aquí · PDF, DOCX o TXT · hasta 5',
    cv_name: 'Nombre del candidato (queda en tu navegador)', cv_chars: n => `${n.toLocaleString('es')} caracteres enviados`,
    cv_trunc: 'CV largo: solo se usan los primeros 12.000 caracteres.', cv_empty: 'No se encontró texto. ¿Es una imagen escaneada? Usa un PDF con texto seleccionable.',
    cv_preview: 'Ver exactamente lo que se envía', cv_reading: 'Leyendo…', cv_err: 'No se pudo leer este archivo.',
    b_run: 'Comparar candidatos', run_note: 'Usa 1 de tus comparaciones de prueba.',
    running: 'MRE·AI está leyendo los CVs…', r_title: 'Ranking', r_summary: 'Resumen',
    r_strengths: 'Fortalezas', r_gaps: 'Brechas', r_evidence: 'Del CV',
    fit_strong: 'Muy adecuado', fit_partial: 'Parcialmente adecuado', fit_weak: 'Poco adecuado',
    r_disclaimer: 'MRE·AI evalúa solo evidencias relacionadas con la vacante e ignora edad, género, origen y otras características personales. El ranking apoya, y no reemplaza, una decisión humana de contratación.',
    b_print: 'Imprimir o guardar en PDF',
    h_title: 'Comparaciones anteriores (se guardan 30 días)', h_none: 'Todavía no hay comparaciones.', h_cvs: n => `${n} CV${n === 1 ? '' : 's'}`,
    acc_title: 'Tus datos', acc_text: 'Elimina ahora tu cuenta de prueba y todas tus comparaciones. No se puede deshacer.',
    b_delete: 'Eliminar mi cuenta', confirm_delete: '¿Eliminar tu cuenta de prueba y todas tus comparaciones? No se puede deshacer.',
    deleted: 'Tu cuenta y tus comparaciones fueron eliminadas.',
    gate_title: 'Inicia sesión para continuar', gate_text: 'Tu sesión terminó o este enlace ya se usó. Pide un nuevo enlace de acceso.',
    gate_btn: 'Recibir enlace de acceso', signing_in: 'Entrando…',
    over_title: 'Usaste tu prueba', over_text: 'Gracias por probar MRE·AI. Escribe a support@tecnologiasantos.com para preparar el piloto MIRA o un plan para tu equipo.',
    need_job: 'Pega la descripción de la vacante (al menos 50 caracteres).', need_cv: 'Agrega al menos un CV legible.',
    err: {
      turnstile_missing: 'Completa la verificación de seguridad.', turnstile_failed: 'La verificación de seguridad falló. Inténtalo de nuevo.',
      invalid_input: 'Completa nombre, un correo válido y empresa.', consent_required: 'Acepta los términos de la prueba para continuar.',
      rate_limited: 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.', email_failed: 'No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.',
      link_expired: 'Este enlace expiró o ya se usó. Pide uno nuevo.', invalid_link: 'Este enlace no es válido. Pide uno nuevo.',
      session_expired: 'Tu sesión terminó. Inicia sesión de nuevo.', unauthenticated: 'Inicia sesión para continuar.',
      no_credits: 'Tu organización usó todas las comparaciones de la prueba.', trial_expired: 'El período de tu prueba terminó.',
      paused: 'La prueba está pausada temporalmente. Inténtalo de nuevo mañana.', evaluation_failed: 'No se pudo completar la evaluación. Tu crédito no se usó. Inténtalo de nuevo.',
      job_too_short: 'Pega la descripción completa de la vacante.', job_too_long: 'La descripción es demasiado larga (máximo 6.000 caracteres).',
      cv_too_short: 'Uno de los CVs tiene muy poco texto.', cv_too_long: 'Uno de los CVs es demasiado largo.', cv_count: 'Agrega entre 1 y 5 CVs.',
      network: 'No se pudo contactar al servidor. Revisa tu conexión e inténtalo de nuevo.', server_error: 'Error inesperado. Inténtalo de nuevo.',
    },
  },
};

// ── Language ────────────────────────────────────────────────────────────────
function detectLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && T[q]) return q;
  try { const s = localStorage.getItem(TRIAL.LANG_KEY); if (s && T[s]) return s; } catch (e) {}
  const n = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return T[n] ? n : 'en';
}
let LANG = detectLang();
const t = k => T[LANG][k];

function applyTexts(root = document) {
  document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : LANG;
  root.querySelectorAll('[data-t]').forEach(el => { const v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
  root.querySelectorAll('[data-th]').forEach(el => { const v = t(el.dataset.th); if (typeof v === 'string') el.innerHTML = v; });   // trusted static texts only
  root.querySelectorAll('[data-tp]').forEach(el => { const v = t(el.dataset.tp); if (typeof v === 'string') el.placeholder = v; });
  document.querySelectorAll('.langs button').forEach(b => b.classList.toggle('on', b.dataset.lang === LANG));
  document.querySelectorAll('a[data-keep-lang]').forEach(a => { const u = new URL(a.href, location.href); u.searchParams.set('lang', LANG); a.href = u.pathname + u.search + u.hash; });
}
function setupLangButtons(onChange) {
  document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => {
    LANG = b.dataset.lang;
    try { localStorage.setItem(TRIAL.LANG_KEY, LANG); } catch (e) {}
    applyTexts();
    if (onChange) onChange();
  }));
}

// ── API ─────────────────────────────────────────────────────────────────────
function getSession() { try { return sessionStorage.getItem(TRIAL.SESSION_KEY); } catch (e) { return null; } }
function setSession(v) { try { v ? sessionStorage.setItem(TRIAL.SESSION_KEY, v) : sessionStorage.removeItem(TRIAL.SESSION_KEY); } catch (e) {} }

async function api(method, path, body) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const s = getSession();
  if (s) headers.Authorization = 'Bearer ' + s;
  let res;
  try {
    res = await fetch(TRIAL.API + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (e) {
    const err = new Error(t('err').network); err.code = 'network'; throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data.error && data.error.code) || 'server_error';
    const err = new Error(t('err')[code] || (data.error && data.error.message) || t('err').server_error);
    err.code = code; err.status = res.status; throw err;
  }
  return data;
}

// ── Turnstile ───────────────────────────────────────────────────────────────
const turnstileReady = new Promise(resolve => { window.onTurnstileLoad = resolve; });
async function renderTurnstile(el) {
  await turnstileReady;
  return window.turnstile.render(el, { sitekey: TRIAL.TURNSTILE_SITEKEY, theme: 'light', language: LANG === 'pt' ? 'pt-br' : LANG });
}

function showMsg(el, kind, text) {
  el.hidden = false;
  el.className = 'msg ' + kind;
  el.textContent = text;
}
