/* ═══════════════════════════════════════════════════════════
   GARDENIA · PROPOSTA FLORENCA
   Motion system: reveals, hero, marquee, counters,
   scroll progress, custom cursor, fases rail.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Failsafe: depois de 4s, mostra tudo de qualquer jeito.
  setTimeout(function(){ html.classList.add('reveal-ready'); }, 4000);

  // ── HERO: dispara reveal logo de cara, sem esperar IO
  var hero = document.querySelector('.hero');
  var heroH1 = document.querySelector('.hero-h1');
  function fireHero(){
    if (heroH1) heroH1.classList.add('on');
    if (hero) hero.classList.add('on');
  }
  // Espera fontes carregarem (clip-reveal fica mais bonito sem FOUT)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fireHero);
    setTimeout(fireHero, 800); // failsafe
  } else {
    setTimeout(fireHero, 120);
  }

  // ── REVEAL via IntersectionObserver
  var revealEls = document.querySelectorAll('.rv, .img-full, .gi');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) {
          en.target.classList.add('on');
          io.unobserve(en.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -32px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('on'); });
  }

  // ── NAV scroll state + scroll progress + parallax hero
  var nav = document.getElementById('nav');
  var prog = document.getElementById('prog');
  var heroImg = document.querySelector('.hero-right img');
  var ticking = false;

  function onScrollFrame(){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (prog) prog.style.width = h > 0 ? ((y / h) * 100).toFixed(2) + '%' : '0%';
    // Parallax hero — suave
    if (heroImg && !reduce && y < window.innerHeight * 1.1) {
      heroImg.style.setProperty('--parallax-y', (y * 0.18).toFixed(1) + 'px');
      heroImg.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0) scale(1.02)';
    }
    ticking = false;
  }
  function onScroll(){
    if (!ticking) { requestAnimationFrame(onScrollFrame); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScrollFrame();

  // ── DARK-ZONE detection (troca cursor + cor)
  var darkZones = document.querySelectorAll('.s-dark, .gal-wrap, .mq, .split-text.green, .split-text.dark, .closing-wrap, footer');
  if ('IntersectionObserver' in window && darkZones.length) {
    var darkIo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.intersectionRatio > 0.5) {
          en.target.classList.add('zone-active');
        } else {
          en.target.classList.remove('zone-active');
        }
      });
      var anyDark = document.querySelector('.zone-active');
      html.classList.toggle('dark-zone', !!anyDark);
    }, { threshold:[0, 0.5, 1] });
    darkZones.forEach(function(el){ darkIo.observe(el); });
  }

  // ── CURSOR custom (somente em pointer fino)
  var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (canHover && !reduce) {
    var ring = document.getElementById('cur-ring');
    var dot  = document.getElementById('cur-dot');
    if (ring && dot) {
      var tx = 0, ty = 0, rx = 0, ry = 0, mx = 0, my = 0;
      window.addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        // dot grudado
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      }, { passive:true });
      // ring com lerp
      (function tick(){
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) translate(-50%,-50%)';
        requestAnimationFrame(tick);
      })();
      // hover-state
      document.querySelectorAll('a, button').forEach(function(el){
        el.addEventListener('mouseenter', function(){ html.classList.add('over-link'); });
        el.addEventListener('mouseleave', function(){ html.classList.remove('over-link'); });
      });
      document.querySelectorAll('.gi, .img-full, .split-img, .closing-img').forEach(function(el){
        el.addEventListener('mouseenter', function(){ html.classList.add('over-img'); });
        el.addEventListener('mouseleave', function(){ html.classList.remove('over-img'); });
      });
      // some quando sai da janela
      document.addEventListener('mouseleave', function(){
        ring.style.opacity = '0'; dot.style.opacity = '0';
      });
      document.addEventListener('mouseenter', function(){
        ring.style.opacity = ''; dot.style.opacity = '';
      });
    }
  }

  // ── COUNT-UP em numeros visiveis
  function formatNumber(n, fmt) {
    if (fmt === 'thousands') {
      return n.toLocaleString('pt-BR');
    }
    return String(n);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length && !reduce) {
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var prefix = el.getAttribute('data-count-prefix') || '';
        var suffix = el.getAttribute('data-count-suffix') || '';
        var fmt = el.getAttribute('data-count-format') || '';
        var dur = Math.min(1600, 600 + target * 0.6);
        var start = performance.now();
        function step(t){
          var p = Math.min(1, (t - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var current = Math.round(target * eased);
          el.textContent = prefix + formatNumber(current, fmt) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold:0.5 });
    counters.forEach(function(el){ cio.observe(el); });
  }

  // ── FASES rail fill + dot activation
  var fasesList = document.querySelector('.fases-list');
  var fasesItems = document.querySelectorAll('.fases-list .fase');
  if (fasesList && fasesItems.length && !reduce) {
    function updateFases(){
      var rect = fasesList.getBoundingClientRect();
      var vh = window.innerHeight;
      var trigger = vh * 0.55;
      var topY = rect.top;
      var bottomY = rect.bottom;
      var totalH = rect.height;
      // fill from where trigger meets the list
      var pct = 0;
      if (topY < trigger && bottomY > trigger) {
        pct = ((trigger - topY) / totalH) * 100;
      } else if (topY < trigger && bottomY <= trigger) {
        pct = 100;
      }
      pct = Math.max(0, Math.min(100, pct));
      fasesList.style.setProperty('--rail', pct + '%');
      fasesItems.forEach(function(f){
        var fr = f.getBoundingClientRect();
        var fmid = fr.top + fr.height * 0.45;
        if (fmid < trigger) f.classList.add('on');
        else f.classList.remove('on');
      });
    }
    var fasesTicking = false;
    function onFasesScroll(){
      if (!fasesTicking){ requestAnimationFrame(function(){ updateFases(); fasesTicking = false; }); fasesTicking = true; }
    }
    window.addEventListener('scroll', onFasesScroll, { passive:true });
    window.addEventListener('resize', onFasesScroll);
    updateFases();
  }
})();
