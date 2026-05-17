/* ─────────────────────────────────────────────────────────
   Gardenia Jardins · Proposta Florenca
   1) Scroll reveal via IntersectionObserver
   2) Nav transparente → creme apos scroll
   ───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // 1) Scroll reveal
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  } else {
    // Fallback: revela tudo (navegadores antigos)
    els.forEach(function (el) { el.classList.add('on'); });
  }

  // 2) Nav scroll state (rAF para performance)
  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;
    function update() {
      nav.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }
})();
