// MRE·AI free trial · sign-up and sign-in link page
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  let tsSignup = null, tsLogin = null;

  function renderTerms() {
    const ol = $('terms-list');
    ol.textContent = '';
    t('terms').forEach(line => { const li = document.createElement('li'); li.textContent = line; ol.appendChild(li); });
  }

  function showTab(which) {
    const login = which === 'login';
    $('tab-signup').classList.toggle('on', !login);
    $('tab-login').classList.toggle('on', login);
    $('f-signup').hidden = login;
    $('f-login').hidden = !login;
    $('done').hidden = true;
    if (login && tsLogin === null) renderTurnstile($('ts-login')).then(id => { tsLogin = id; });
  }

  function done(text) {
    $('f-signup').hidden = true;
    $('f-login').hidden = true;
    $('done').hidden = false;
    $('done-text').textContent = text;
  }

  async function busy(btn, on) {
    btn.disabled = on;
    btn.style.opacity = on ? '.7' : '';
  }

  $('f-signup').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('s-msg'); msg.hidden = true;
    const name = $('s-name').value.trim(), email = $('s-email').value.trim(), company = $('s-company').value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !company) return showMsg(msg, 'err', t('err').invalid_input);
    if (!$('s-terms').checked) return showMsg(msg, 'err', t('err').consent_required);
    const cfToken = tsSignup !== null ? window.turnstile.getResponse(tsSignup) : '';
    if (!cfToken) return showMsg(msg, 'err', t('err').turnstile_missing);
    busy($('s-btn'), true);
    try {
      const r = await api('POST', '/api/signup', {
        name, email, company, job_title: $('s-title').value.trim(), lang: LANG,
        consent_terms: true, consent_marketing: $('s-marketing').checked,
        website: $('hp-website').value, email2: $('hp-email2').value, cfToken,
      });
      done(r.status === 'pending_approval' ? t('ok_pending') : t('ok_check'));
    } catch (err) {
      showMsg(msg, 'err', err.message);
      if (tsSignup !== null) window.turnstile.reset(tsSignup);
    } finally { busy($('s-btn'), false); }
  });

  $('f-login').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('l-msg'); msg.hidden = true;
    const email = $('l-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg(msg, 'err', t('err').invalid_input);
    const cfToken = tsLogin !== null ? window.turnstile.getResponse(tsLogin) : '';
    if (!cfToken) return showMsg(msg, 'err', t('err').turnstile_missing);
    busy($('l-btn'), true);
    try {
      await api('POST', '/api/login', { email, cfToken });
      done(t('ok_check'));
    } catch (err) {
      showMsg(msg, 'err', err.message);
      if (tsLogin !== null) window.turnstile.reset(tsLogin);
    } finally { busy($('l-btn'), false); }
  });

  $('tab-signup').addEventListener('click', () => showTab('signup'));
  $('tab-login').addEventListener('click', () => showTab('login'));

  setupLangButtons(renderTerms);
  applyTexts();
  renderTerms();
  renderTurnstile($('ts-signup')).then(id => { tsSignup = id; });
  if (location.hash === '#login') showTab('login');
  
  // Signed in already (same tab): offer to go back to the app instead of the forms
  $('to-login').addEventListener('click', e => { e.preventDefault(); showTab('login'); });
  $('other-account').addEventListener('click', () => {
    setSession(null);
    $('active').hidden = true;
    document.querySelector('.tabs').hidden = false;
    showTab('signup');
  });
  if (getSession() && location.hash !== '#login') {
    document.querySelector('.tabs').hidden = true;
    $('f-signup').hidden = true;
    $('f-login').hidden = true;
    $('active').hidden = false;
  }
})();
