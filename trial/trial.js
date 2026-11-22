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
    s_lead: 'Paste or upload a job description, add up to 5 CVs and get a ranking with scores, strengths, gaps and evidence in under a minute.',
    f1_t: '3 free comparisons for 14 days', f1_d: 'Each comparison: one job description against up to 5 CVs.',
    f2_t: 'Privacy first', f2_d: 'CVs are read in your browser; names, e-mails, phones, CPF and links are removed before anything is sent. CV text is never stored.',
    f3_t: 'Objective and explainable', f3_d: 'Every score comes with strengths, gaps and quotes from the CV. It supports your decision; it does not replace it.',
    f4_t: 'Built for hiring teams', f4_d: 'Invite your colleagues with roles: Account holder, Administrator and Recruiter. Recruiters see only their own comparisons; managers see everything, with usage per person and an audit log.',
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
    b_job_upload: 'Upload file (PDF, DOCX, TXT)', job_from: f => `Loaded from ${f}. Review and edit if needed.`, job_cut: 'The file was longer than 6,000 characters; only the start was kept.', job_err: 'This file could not be read. Paste the text instead.',
    del_title: 'Delete your trial account?', del_lead: 'This is permanent and cannot be undone. The following will be deleted right away:',
    del_li1: 'Your sign-in and profile', del_li2: n => `Your ${n} saved comparison${n === 1 ? '' : 's'} (rankings)`, del_li3: 'Your remaining trial comparisons are lost', del_li4: 'Already downloaded or printed PDFs are not affected',
    del_chk: 'I understand that this cannot be undone.', del_word: 'DELETE', del_type: w => `To confirm, type ${w}`, del_cancel: 'Cancel', del_ok: 'Delete permanently',
    role_owner: 'Account holder', role_admin: 'Administrator', role_member: 'Recruiter', role_you: 'you',
    consent_title: 'Before you start', consent_text: 'You were invited to your company’s MRE·AI account. Please read and accept the trial terms to continue.',
    consent_chk: 'I accept the trial terms and the <a href="../../privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I confirm my company has a legal basis to process the CVs I upload.',
    consent_mk: 'I would like to receive news about Tecnologia Santos products (optional).', consent_btn: 'Accept and continue',
    team_title: 'Team', team_lead: 'Everyone shares the company’s comparisons. Recruiters see only their own; the account holder and administrators see all of them.',
    team_pending: n => `${n} request${n === 1 ? '' : 's'} to join waiting for approval`,
    t_invite: 'Invite someone', t_name: 'Name', t_email: 'Work e-mail', t_role: 'Role', b_invite: 'Send invitation',
    t_invite_hint: d => `Only e-mails at @${d}. The person receives a sign-in link valid for 3 days.`, t_invite_ok: e => `Invitation sent to ${e}.`,
    t_no_invite: 'Accounts created with a personal e-mail cannot invite people. Write to support@tecnologiasantos.com to set up a team.',
    st_active: 'Active', st_pending_email: 'Invited, not signed in yet', st_pending_team: 'Asked to join',
    t_last: d => `Last sign-in ${d}`, t_never: 'Never signed in', t_evals: n => `${n} comparison${n === 1 ? '' : 's'}`,
    b_approve: 'Approve', b_reject: 'Reject', b_resend: 'Resend invitation', b_remove: 'Remove', b_cancel_invite: 'Cancel invitation',
    b_transfer: 'Make account holder', b_make_admin: 'Make administrator', b_make_member: 'Make recruiter',
    cf_remove_title: n => `Remove ${n} from the team?`, cf_remove_text: 'They lose access right away. The comparisons they made stay with the company, with their name as author.',
    cf_reject_title: n => `Reject ${n}’s request?`, cf_reject_text: 'The request is deleted. No e-mail is sent.',
    cf_transfer_title: n => `Make ${n} the account holder?`, cf_transfer_text: 'They will manage administrators and can delete the company account. You become an administrator. Only the new account holder can undo this.',
    cf_role_title: n => `Change ${n}’s role?`, cf_role_admin: 'Administrators invite and remove recruiters, see every comparison and the audit log.', cf_role_member: 'Recruiters run comparisons and see only their own.',
    cf_cancel: 'Cancel', cf_confirm: 'Confirm', cf_type_email: 'To confirm, type their e-mail',
    ok_approved: 'Approved. The sign-in link was sent.', ok_resent: 'Invitation sent again.', ok_removed: 'Removed.', ok_role: 'Role changed.', ok_transferred: 'Done. You are now an administrator.', ok_rejected: 'Request rejected.',
    h_by: n => `by ${n}`, h_removed: 'former team member', u_title: 'Usage by person', u_total: n => `${n} comparison${n === 1 ? '' : 's'} in total`,
    audit_title: 'Audit log', audit_lead: 'Who did what in your company’s account in the last 180 days.', b_audit_load: 'Show audit log', b_audit_csv: 'Export CSV', audit_none: 'No events yet.',
    act: { 'evaluation.create': 'Ran a comparison', 'session.login': 'Signed in', 'account.signup': 'Signed up', 'account.consent': 'Accepted the terms', 'account.approve': 'Approved by Tecnologia Santos', 'account.transfer': 'Transferred the account', 'member.request': 'Asked to join', 'member.invite': 'Invited', 'member.approve': 'Approved a request', 'member.reject': 'Rejected a request', 'member.role': 'Changed a role', 'member.remove': 'Removed from the team', 'member.resend': 'Resent an invitation', 'member.leave': 'Deleted their own access', admin: 'Tecnologia Santos support' },
    del_lead_member: 'This deletes only your own access. It cannot be undone.', del_m1: 'Your sign-in and profile are deleted', del_m2: 'The comparisons you made stay with your company', del_m3: 'To come back, someone on your team must invite you again',
    del_owner_team: n => `You are the account holder and ${n} other ${n === 1 ? 'person is' : 'people are'} on the team. To leave and keep the team, make someone else the account holder in Team first. Or delete the whole company account:`,
    del_o1: n => `${n} ${n === 1 ? 'person loses' : 'people lose'} access, including you`, del_o2: 'Every comparison and the audit log of the company are deleted', del_word_org: 'DELETE COMPANY', del_ok_org: 'Delete company account',
    ok_pending_team: 'Thank you! Your company already has an MRE·AI account, so we asked its account holder to approve your access. You will receive your sign-in link by e-mail as soon as they approve.',
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
      pending_team: 'Your request to join is waiting for the account holder’s approval.', blocked: 'This account is not active. Write to support@tecnologiasantos.com.',
      owner_has_team: 'Make someone else the account holder first, or delete the whole company account.', invite_domain: 'Invite only people with your company’s e-mail domain.',
      already_exists: 'This e-mail already has access or a pending request.', forbidden_role: 'Your role cannot do this.', not_found: 'Not found. Refresh the page.',
      not_pending: 'This was already handled. Refresh the page.', team_full: 'Your team has reached the maximum number of people.',
      transfer_target: 'Choose someone who has already signed in.', confirm_mismatch: 'The confirmation text does not match.',
      network: 'Could not reach the server. Check your connection and try again.', server_error: 'Unexpected error. Please try again.',
    },
  },
  pt: {
    nav_back: 'Voltar ao site',
    s_label: 'MRE·AI · Teste grátis',
    s_title: 'Classifique seus candidatos com IA, na sua própria vaga',
    s_lead: 'Cole ou envie a descrição da vaga, adicione até 5 currículos e receba um ranking com notas, pontos fortes, lacunas e evidências em menos de um minuto.',
    f1_t: '3 comparações grátis por 14 dias', f1_d: 'Cada comparação: uma descrição de vaga com até 5 currículos.',
    f2_t: 'Privacidade em primeiro lugar', f2_d: 'Os currículos são lidos no seu navegador; nomes, e-mails, telefones, CPF e links são removidos antes do envio. O texto dos currículos nunca é armazenado.',
    f3_t: 'Objetivo e explicável', f3_d: 'Cada nota vem com pontos fortes, lacunas e trechos do currículo. Ela apoia sua decisão; não a substitui.',
    f4_t: 'Feito para equipes de recrutamento', f4_d: 'Convide colegas com papéis: Titular, Administrador e Recrutador. Recrutadores veem só as próprias comparações; os gestores veem todas, com o uso por pessoa e a auditoria.',
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
    b_job_upload: 'Enviar arquivo (PDF, DOCX, TXT)', job_from: f => `Carregado de ${f}. Revise e edite se precisar.`, job_cut: 'O arquivo passava de 6.000 caracteres; só o início foi mantido.', job_err: 'Não foi possível ler este arquivo. Cole o texto.',
    del_title: 'Excluir sua conta de teste?', del_lead: 'É permanente e não pode ser desfeito. Será excluído imediatamente:',
    del_li1: 'Seu acesso e seu cadastro', del_li2: n => `${n === 1 ? 'Sua comparação salva' : `Suas ${n} comparações salvas`} (rankings)`, del_li3: 'As comparações restantes do teste são perdidas', del_li4: 'PDFs já baixados ou impressos não são afetados',
    del_chk: 'Entendo que isso não pode ser desfeito.', del_word: 'EXCLUIR', del_type: w => `Para confirmar, digite ${w}`, del_cancel: 'Cancelar', del_ok: 'Excluir definitivamente',
    role_owner: 'Titular', role_admin: 'Administrador', role_member: 'Recrutador', role_you: 'você',
    consent_title: 'Antes de começar', consent_text: 'Você foi convidado para a conta do MRE·AI da sua empresa. Leia e aceite os termos do teste para continuar.',
    consent_chk: 'Aceito os termos do teste e a <a href="../../privacy-policy.html" target="_blank" rel="noopener">Política de Privacidade</a>, e confirmo que minha empresa tem base legal para tratar os currículos que eu enviar.',
    consent_mk: 'Quero receber novidades sobre os produtos da Tecnologia Santos (opcional).', consent_btn: 'Aceitar e continuar',
    team_title: 'Equipe', team_lead: 'Todos usam as comparações da empresa. Recrutadores veem só as próprias; o titular e os administradores veem todas.',
    team_pending: n => `${n} ${n === 1 ? 'pedido' : 'pedidos'} de acesso aguardando aprovação`,
    t_invite: 'Convidar alguém', t_name: 'Nome', t_email: 'E-mail corporativo', t_role: 'Papel', b_invite: 'Enviar convite',
    t_invite_hint: d => `Somente e-mails @${d}. A pessoa recebe um link de acesso válido por 3 dias.`, t_invite_ok: e => `Convite enviado para ${e}.`,
    t_no_invite: 'Contas criadas com e-mail pessoal não podem convidar pessoas. Escreva para support@tecnologiasantos.com para montar uma equipe.',
    st_active: 'Ativo', st_pending_email: 'Convidado, ainda não entrou', st_pending_team: 'Pediu acesso',
    t_last: d => `Último acesso ${d}`, t_never: 'Nunca entrou', t_evals: n => `${n} ${n === 1 ? 'comparação' : 'comparações'}`,
    b_approve: 'Aprovar', b_reject: 'Recusar', b_resend: 'Reenviar convite', b_remove: 'Remover', b_cancel_invite: 'Cancelar convite',
    b_transfer: 'Tornar titular', b_make_admin: 'Tornar administrador', b_make_member: 'Tornar recrutador',
    cf_remove_title: n => `Remover ${n} da equipe?`, cf_remove_text: 'A pessoa perde o acesso na hora. As comparações que ela fez continuam com a empresa, com o nome dela como autora.',
    cf_reject_title: n => `Recusar o pedido de ${n}?`, cf_reject_text: 'O pedido é excluído. Nenhum e-mail é enviado.',
    cf_transfer_title: n => `Tornar ${n} titular da conta?`, cf_transfer_text: 'A pessoa passa a gerenciar os administradores e pode excluir a conta da empresa. Você vira administrador. Só o novo titular pode desfazer.',
    cf_role_title: n => `Mudar o papel de ${n}?`, cf_role_admin: 'Administradores convidam e removem recrutadores, veem todas as comparações e a auditoria.', cf_role_member: 'Recrutadores fazem comparações e veem só as próprias.',
    cf_cancel: 'Cancelar', cf_confirm: 'Confirmar', cf_type_email: 'Para confirmar, digite o e-mail da pessoa',
    ok_approved: 'Aprovado. O link de acesso foi enviado.', ok_resent: 'Convite reenviado.', ok_removed: 'Removido.', ok_role: 'Papel alterado.', ok_transferred: 'Pronto. Agora você é administrador.', ok_rejected: 'Pedido recusado.',
    h_by: n => `por ${n}`, h_removed: 'ex-integrante da equipe', u_title: 'Uso por pessoa', u_total: n => `${n} ${n === 1 ? 'comparação' : 'comparações'} no total`,
    audit_title: 'Auditoria', audit_lead: 'Quem fez o quê na conta da sua empresa nos últimos 180 dias.', b_audit_load: 'Ver auditoria', b_audit_csv: 'Exportar CSV', audit_none: 'Nenhum evento ainda.',
    act: { 'evaluation.create': 'Fez uma comparação', 'session.login': 'Entrou', 'account.signup': 'Cadastrou-se', 'account.consent': 'Aceitou os termos', 'account.approve': 'Aprovado pela Tecnologia Santos', 'account.transfer': 'Transferiu a titularidade', 'member.request': 'Pediu acesso', 'member.invite': 'Convidou', 'member.approve': 'Aprovou um pedido', 'member.reject': 'Recusou um pedido', 'member.role': 'Mudou um papel', 'member.remove': 'Removeu da equipe', 'member.resend': 'Reenviou um convite', 'member.leave': 'Excluiu o próprio acesso', admin: 'Suporte Tecnologia Santos' },
    del_lead_member: 'Isto exclui só o seu acesso. Não é possível desfazer.', del_m1: 'Seu acesso e seu cadastro são excluídos', del_m2: 'As comparações que você fez continuam com a sua empresa', del_m3: 'Para voltar, alguém da equipe precisa convidar você de novo',
    del_owner_team: n => `Você é o titular e há ${n === 1 ? 'mais 1 pessoa' : `mais ${n} pessoas`} na equipe. Para sair mantendo a equipe, torne outra pessoa titular em Equipe antes. Ou exclua a conta inteira da empresa:`,
    del_o1: n => `${n} ${n === 1 ? 'pessoa perde' : 'pessoas perdem'} o acesso, incluindo você`, del_o2: 'Todas as comparações e a auditoria da empresa são excluídas', del_word_org: 'EXCLUIR EMPRESA', del_ok_org: 'Excluir a conta da empresa',
    ok_pending_team: 'Obrigado! Sua empresa já tem uma conta no MRE·AI, então pedimos ao titular que aprove seu acesso. Você receberá o link de acesso por e-mail assim que ele aprovar.',
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
      pending_team: 'Seu pedido de acesso aguarda a aprovação do titular da conta.', blocked: 'Esta conta não está ativa. Escreva para support@tecnologiasantos.com.',
      owner_has_team: 'Torne outra pessoa titular antes, ou exclua a conta inteira da empresa.', invite_domain: 'Convide só pessoas com o domínio de e-mail da sua empresa.',
      already_exists: 'Este e-mail já tem acesso ou um pedido pendente.', forbidden_role: 'Seu papel não permite esta ação.', not_found: 'Não encontrado. Atualize a página.',
      not_pending: 'Isso já foi resolvido. Atualize a página.', team_full: 'Sua equipe chegou ao número máximo de pessoas.',
      transfer_target: 'Escolha alguém que já entrou no app.', confirm_mismatch: 'O texto de confirmação não confere.',
      network: 'Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.', server_error: 'Erro inesperado. Tente novamente.',
    },
  },
  es: {
    nav_back: 'Volver al sitio',
    s_label: 'MRE·AI · Prueba gratuita',
    s_title: 'Clasifica a tus candidatos con IA, en tu propia vacante',
    s_lead: 'Pega o sube una descripción de vacante, agrega hasta 5 CVs y recibe un ranking con puntajes, fortalezas, brechas y evidencias en menos de un minuto.',
    f1_t: '3 comparaciones gratis por 14 días', f1_d: 'Cada comparación: una descripción de vacante con hasta 5 CVs.',
    f2_t: 'Privacidad primero', f2_d: 'Los CVs se leen en tu navegador; nombres, correos, teléfonos, documentos y enlaces se eliminan antes del envío. El texto de los CVs nunca se almacena.',
    f3_t: 'Objetivo y explicable', f3_d: 'Cada puntaje viene con fortalezas, brechas y citas del CV. Apoya tu decisión; no la reemplaza.',
    f4_t: 'Hecho para equipos de selección', f4_d: 'Invita a tus colegas con roles: Titular, Administrador y Reclutador. Los reclutadores ven solo sus comparaciones; los gestores ven todas, con el uso por persona y la auditoría.',
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
    b_job_upload: 'Subir archivo (PDF, DOCX, TXT)', job_from: f => `Cargado de ${f}. Revisa y edita si es necesario.`, job_cut: 'El archivo superaba 6.000 caracteres; solo se mantuvo el inicio.', job_err: 'No se pudo leer este archivo. Pega el texto.',
    del_title: '¿Eliminar tu cuenta de prueba?', del_lead: 'Es permanente y no se puede deshacer. Se eliminará de inmediato:',
    del_li1: 'Tu acceso y tu registro', del_li2: n => `${n === 1 ? 'Tu comparación guardada' : `Tus ${n} comparaciones guardadas`} (rankings)`, del_li3: 'Las comparaciones restantes de la prueba se pierden', del_li4: 'Los PDFs ya descargados o impresos no se ven afectados',
    del_chk: 'Entiendo que esto no se puede deshacer.', del_word: 'ELIMINAR', del_type: w => `Para confirmar, escribe ${w}`, del_cancel: 'Cancelar', del_ok: 'Eliminar definitivamente',
    role_owner: 'Titular', role_admin: 'Administrador', role_member: 'Reclutador', role_you: 'tú',
    consent_title: 'Antes de empezar', consent_text: 'Te invitaron a la cuenta de MRE·AI de tu empresa. Lee y acepta los términos de la prueba para continuar.',
    consent_chk: 'Acepto los términos de la prueba y la <a href="../../privacy-policy.html" target="_blank" rel="noopener">Política de Privacidad</a>, y confirmo que mi empresa tiene base legal para tratar los CVs que envíe.',
    consent_mk: 'Quiero recibir novedades sobre los productos de Tecnologia Santos (opcional).', consent_btn: 'Aceptar y continuar',
    team_title: 'Equipo', team_lead: 'Todos usan las comparaciones de la empresa. Los reclutadores ven solo las suyas; el titular y los administradores ven todas.',
    team_pending: n => `${n} ${n === 1 ? 'solicitud' : 'solicitudes'} de acceso esperando aprobación`,
    t_invite: 'Invitar a alguien', t_name: 'Nombre', t_email: 'Correo corporativo', t_role: 'Rol', b_invite: 'Enviar invitación',
    t_invite_hint: d => `Solo correos @${d}. La persona recibe un enlace de acceso válido por 3 días.`, t_invite_ok: e => `Invitación enviada a ${e}.`,
    t_no_invite: 'Las cuentas creadas con correo personal no pueden invitar personas. Escribe a support@tecnologiasantos.com para armar un equipo.',
    st_active: 'Activo', st_pending_email: 'Invitado, aún no entró', st_pending_team: 'Pidió acceso',
    t_last: d => `Último acceso ${d}`, t_never: 'Nunca entró', t_evals: n => `${n} ${n === 1 ? 'comparación' : 'comparaciones'}`,
    b_approve: 'Aprobar', b_reject: 'Rechazar', b_resend: 'Reenviar invitación', b_remove: 'Quitar', b_cancel_invite: 'Cancelar invitación',
    b_transfer: 'Hacer titular', b_make_admin: 'Hacer administrador', b_make_member: 'Hacer reclutador',
    cf_remove_title: n => `¿Quitar a ${n} del equipo?`, cf_remove_text: 'Pierde el acceso de inmediato. Las comparaciones que hizo quedan con la empresa, con su nombre como autor.',
    cf_reject_title: n => `¿Rechazar la solicitud de ${n}?`, cf_reject_text: 'La solicitud se elimina. No se envía ningún correo.',
    cf_transfer_title: n => `¿Hacer a ${n} titular de la cuenta?`, cf_transfer_text: 'Pasará a gestionar a los administradores y podrá eliminar la cuenta de la empresa. Tú pasas a administrador. Solo el nuevo titular puede deshacerlo.',
    cf_role_title: n => `¿Cambiar el rol de ${n}?`, cf_role_admin: 'Los administradores invitan y quitan reclutadores, ven todas las comparaciones y la auditoría.', cf_role_member: 'Los reclutadores hacen comparaciones y ven solo las suyas.',
    cf_cancel: 'Cancelar', cf_confirm: 'Confirmar', cf_type_email: 'Para confirmar, escribe el correo de la persona',
    ok_approved: 'Aprobado. Se envió el enlace de acceso.', ok_resent: 'Invitación reenviada.', ok_removed: 'Quitado.', ok_role: 'Rol cambiado.', ok_transferred: 'Listo. Ahora eres administrador.', ok_rejected: 'Solicitud rechazada.',
    h_by: n => `por ${n}`, h_removed: 'ex integrante del equipo', u_title: 'Uso por persona', u_total: n => `${n} ${n === 1 ? 'comparación' : 'comparaciones'} en total`,
    audit_title: 'Auditoría', audit_lead: 'Quién hizo qué en la cuenta de tu empresa en los últimos 180 días.', b_audit_load: 'Ver auditoría', b_audit_csv: 'Exportar CSV', audit_none: 'Todavía no hay eventos.',
    act: { 'evaluation.create': 'Hizo una comparación', 'session.login': 'Entró', 'account.signup': 'Se registró', 'account.consent': 'Aceptó los términos', 'account.approve': 'Aprobado por Tecnologia Santos', 'account.transfer': 'Transfirió la titularidad', 'member.request': 'Pidió acceso', 'member.invite': 'Invitó', 'member.approve': 'Aprobó una solicitud', 'member.reject': 'Rechazó una solicitud', 'member.role': 'Cambió un rol', 'member.remove': 'Quitó del equipo', 'member.resend': 'Reenvió una invitación', 'member.leave': 'Eliminó su propio acceso', admin: 'Soporte Tecnologia Santos' },
    del_lead_member: 'Esto elimina solo tu acceso. No se puede deshacer.', del_m1: 'Se eliminan tu acceso y tu registro', del_m2: 'Las comparaciones que hiciste quedan con tu empresa', del_m3: 'Para volver, alguien del equipo debe invitarte de nuevo',
    del_owner_team: n => `Eres el titular y hay ${n === 1 ? '1 persona más' : `${n} personas más`} en el equipo. Para salir manteniendo el equipo, haz titular a otra persona en Equipo antes. O elimina la cuenta completa de la empresa:`,
    del_o1: n => `${n} ${n === 1 ? 'persona pierde' : 'personas pierden'} el acceso, incluyéndote`, del_o2: 'Se eliminan todas las comparaciones y la auditoría de la empresa', del_word_org: 'ELIMINAR EMPRESA', del_ok_org: 'Eliminar la cuenta de la empresa',
    ok_pending_team: '¡Gracias! Tu empresa ya tiene una cuenta en MRE·AI, así que pedimos al titular que apruebe tu acceso. Recibirás tu enlace de acceso por correo en cuanto lo apruebe.',
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
      pending_team: 'Tu solicitud de acceso espera la aprobación del titular de la cuenta.', blocked: 'Esta cuenta no está activa. Escribe a support@tecnologiasantos.com.',
      owner_has_team: 'Haz titular a otra persona primero, o elimina la cuenta completa de la empresa.', invite_domain: 'Invita solo a personas con el dominio de correo de tu empresa.',
      already_exists: 'Este correo ya tiene acceso o una solicitud pendiente.', forbidden_role: 'Tu rol no permite esta acción.', not_found: 'No encontrado. Actualiza la página.',
      not_pending: 'Esto ya se resolvió. Actualiza la página.', team_full: 'Tu equipo llegó al número máximo de personas.',
      transfer_target: 'Elige a alguien que ya haya entrado.', confirm_mismatch: 'El texto de confirmación no coincide.',
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
