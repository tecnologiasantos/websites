// MRE·AI: page title, meta description, Open Graph, canonical and footer links in the visitor's language.
// Follows <html lang>, which trial.js sets in applyTexts(), so it also updates when the language is switched.
(function () {
  var BASE = 'https://tecnologiasantos.com/mre-ai/';
  var M = {
    en: {
      title: 'MRE·AI free trial · Tecnologia Santos',
      desc: 'Try MRE·AI free: rank up to 5 CVs against your own job description with AI. 3 free comparisons, CVs anonymized in your browser.',
      locale: 'en_US', privacy: 'Privacy Policy', terms: 'Terms of Service'
    },
    pt: {
      title: 'MRE·AI teste grátis · Tecnologia Santos',
      desc: 'Teste o MRE·AI grátis: classifique até 5 currículos com IA na sua própria vaga. 3 comparações grátis, currículos anonimizados no seu navegador.',
      locale: 'pt_BR', privacy: 'Política de Privacidade', terms: 'Termos de Uso'
    },
    es: {
      title: 'MRE·AI prueba gratis · Tecnologia Santos',
      desc: 'Prueba MRE·AI gratis: clasifica hasta 5 CVs con IA en tu propia vacante. 3 comparaciones gratis, CVs anonimizados en tu navegador.',
      locale: 'es_ES', privacy: 'Política de Privacidad', terms: 'Términos de Uso'
    }
  };

  function meta(sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }

  function apply() {
    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    var m = M[lang] || M.en;
    var url = BASE + '?lang=' + (M[lang] ? lang : 'en');
    if (document.title !== m.title) document.title = m.title;
    meta('meta[name="description"]', 'content', m.desc);
    meta('meta[property="og:title"]', 'content', m.title);
    meta('meta[property="og:description"]', 'content', m.desc);
    meta('meta[property="og:locale"]', 'content', m.locale);
    meta('meta[property="og:url"]', 'content', url);
    meta('link[rel="canonical"]', 'href', url);
    var p = document.querySelector('footer a[href$="privacy-policy.html"]');
    var t = document.querySelector('footer a[href$="terms-of-service.html"]');
    if (p) p.textContent = m.privacy;
    if (t) t.textContent = m.terms;
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
