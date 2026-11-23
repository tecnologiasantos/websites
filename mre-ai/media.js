// MRE·AI: mostra o bloco de vídeo/manual do idioma ativo (segue o <html lang> que o trial.js define).
(function () {
  var root = document.getElementById('mre-media');
  if (!root) return;
  var blocks = root.querySelectorAll('[data-media-lang]');
  function current() {
    var l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return (l === 'pt' || l === 'es') ? l : 'en';
  }
  function sync() {
    var lang = current();
    blocks.forEach(function (b) {
      var on = b.getAttribute('data-media-lang') === lang;
      b.hidden = !on;
      var v = b.querySelector('video');
      if (!v) return;
      if (on) { if (v.preload !== 'metadata') { v.preload = 'metadata'; v.load(); } }
      else if (!v.paused) v.pause();
    });
  }
  sync();
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
