/* ==========================================================================
   LA BELLA DONNA – animações e interações
   GSAP + ScrollTrigger (CDN). Com prefers-reduced-motion ou sem GSAP,
   o site continua 100% funcional e legível, só que sem movimento.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.LBD_CONFIG || {};
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasHover = window.matchMedia('(hover: hover)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var isDesktop = function () { return window.innerWidth >= 900; };

  /* ------------------------------------------------------------------
     Itens que não dependem de GSAP
     ------------------------------------------------------------------ */

  function applyConfig() {
    var num = String(CFG.whatsapp || '').replace(/\D/g, '');
    var msg = CFG.whatsappMensagem ? '?text=' + encodeURIComponent(CFG.whatsappMensagem) : '';
    $$('[data-wa]').forEach(function (a) {
      a.href = num ? 'https://wa.me/' + num + msg : 'https://wa.me/';
    });
    var h = $('[data-placeholder="horario"]');
    if (h && CFG.horario) { h.textContent = CFG.horario; h.classList.remove('placeholder'); }
    var t = $('[data-placeholder="telefone"]');
    if (t && CFG.telefoneExibicao) { t.textContent = CFG.telefoneExibicao; t.classList.remove('placeholder'); }
  }

  var nav = $('#nav');
  var fab = $('#fab');
  var introDone = false;
  function onScrollUi() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle('is-solid', y > 40);
    if (fab) fab.classList.toggle('is-on', introDone && y > 280);
  }
  function initUi() {
    window.addEventListener('scroll', onScrollUi, { passive: true });
    onScrollUi();
    // rolagem suave para âncoras (feita em JS para não brigar com o ScrollTrigger)
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = $(id);
        if (!el) return;
        e.preventDefault();
        var top = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

  /* ---------- Carrossel "elenco" ---------- */
  function initCarousel() {
    var track = $('#castTrack');
    if (!track) return;
    var prev = $('#castPrev'), next = $('#castNext'), bar = $('#castBar');
    var cards = $$('.card', track);
    var ticking = false;

    function stepSize() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return cards[0].getBoundingClientRect().width + gap;
    }
    function update() {
      ticking = false;
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      bar.style.transform = 'scaleX(' + Math.max(0.1, p).toFixed(3) + ')';
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
      if (isDesktop() && !reduced) {
        var vw = window.innerWidth;
        cards.forEach(function (c) {
          var r = c.getBoundingClientRect();
          var t = Math.min(1, Math.max(0, r.left / Math.max(1, vw - r.width)));
          c.style.setProperty('--px', (-t * 0.14 * r.width).toFixed(1) + 'px');
        });
      }
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    track.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    prev.addEventListener('click', function () { track.scrollBy({ left: -stepSize(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: stepSize(), behavior: 'smooth' }); });

    // arrastar com o mouse
    var down = false, moved = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-drag');
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    update();
  }

  /* ---------- Salgada ou doce (tela dividida) ---------- */
  function initSplitPanels() {
    var stage = $('#splitStage');
    if (!stage) return;
    var panels = $$('[data-panel]', stage);
    function open(p) { panels.forEach(function (x) { x.classList.toggle('is-open', x === p); }); }
    function closeAll() { panels.forEach(function (x) { x.classList.remove('is-open'); }); }

    panels.forEach(function (p) {
      p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') open(p); });
      p.addEventListener('focusin', function (e) {
        var vis = true;
        try { vis = e.target.matches(':focus-visible'); } catch (err) { /* navegador antigo */ }
        if (vis) open(p);
      });
      p.addEventListener('click', function (e) {
        if (e.target.closest('a') || hasHover) return; // no desktop quem manda é o hover
        if (p.classList.contains('is-open')) closeAll(); else open(p);
      });
      p.addEventListener('keydown', function (e) {
        if (e.target !== p || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        if (p.classList.contains('is-open')) closeAll(); else open(p);
      });
    });
    stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') closeAll(); });
    stage.addEventListener('focusout', function (e) { if (!stage.contains(e.relatedTarget)) closeAll(); });
  }

  /* ------------------------------------------------------------------
     Caminhos sem animação (movimento reduzido ou GSAP indisponível)
     ------------------------------------------------------------------ */
  applyConfig();
  initCarousel();
  initSplitPanels();
  initUi();

  if (reduced || !hasGsap) {
    root.classList.add(reduced ? 'reduced' : 'no-gsap');
    root.classList.remove('is-intro');
    introDone = true;
    onScrollUi();
    return;
  }

  /* ------------------------------------------------------------------
     A partir daqui: versão cinematográfica
     ------------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Cursor personalizado ---------- */
  function initCursor() {
    if (!finePointer) return;
    var c = $('.cursor');
    if (!c) return;
    root.classList.add('has-cursor');
    var xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
    var yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      c.classList.add('is-on');
      xTo(e.clientX); yTo(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { c.classList.remove('is-on'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      if (!t.closest) return;
      var link = t.closest('a, button, [data-panel]');
      var view = t.closest('[data-cursor="view"]');
      var isLink = link && !link.hasAttribute('data-cursor');
      c.classList.toggle('is-link', !!isLink);
      c.classList.toggle('is-view', !isLink && !!view);
    });
  }

  /* ---------- Texto linha a linha (com máscara) ---------- */
  function splitEl(el) {
    if (!el._orig) el._orig = el.innerHTML;
    el.innerHTML = el._orig;

    var nodes = [];          // sequência de nós (palavras e espaços)
    var words = [];
    (function walk(parent, wrap) {
      Array.prototype.forEach.call(parent.childNodes, function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { nodes.push(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.style.display = 'inline-block';
            var inner = document.createTextNode(part);
            if (wrap) { var cl = wrap.cloneNode(false); cl.appendChild(inner); w.appendChild(cl); } else { w.appendChild(inner); }
            nodes.push(w); words.push(w);
          });
        } else if (n.nodeType === 1) {
          walk(n, n);
        }
      });
    })(el, null);

    el.textContent = '';
    nodes.forEach(function (n) { el.appendChild(n); });

    // agrupa por linha visual
    var lines = [], lastTop = null;
    nodes.forEach(function (n) {
      if (n.nodeType === 1) {
        var top = n.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
      }
      if (!lines.length) lines.push([]);
      lines[lines.length - 1].push(n);
    });

    el.textContent = '';
    el._lines = lines.map(function (group) {
      var ln = document.createElement('span'); ln.className = 'ln';
      var inn = document.createElement('span'); inn.className = 'ln-in';
      // remove espaço no fim da linha
      while (group.length && group[group.length - 1].nodeType === 3) group.pop();
      group.forEach(function (n) { inn.appendChild(n); });
      ln.appendChild(inn); el.appendChild(ln);
      return inn;
    });
    el.classList.add('is-split');
    gsap.set(el._lines, { yPercent: el._shown ? 0 : 115 });
  }
  function revealEl(el) {
    if (!el._lines) return;
    el._shown = true;
    gsap.to(el._lines, { yPercent: 0, duration: 1.25, ease: 'power4.out', stagger: isDesktop() ? 0.13 : 0.09 });
  }

  /* ---------- Intro: letterbox 2.39:1 ---------- */
  var intro = $('#intro');
  var introTl, introFinished = false;
  var heroReady = null;

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    if (introTl) introTl.kill();
    gsap.to(intro, { opacity: 0, duration: 0.35, onComplete: function () { intro.style.display = 'none'; } });
    root.classList.remove('is-intro');
    introDone = true;
    onScrollUi();
    ScrollTrigger.refresh();
    heroReady.then(playHero);
  }

  function runIntro() {
    var bars = $$('.intro__bar', intro);
    var vw = window.innerWidth, vh = window.innerHeight;
    var slit = Math.max(0, (vh - vw / 2.39) / 2); // altura de cada barra com janela 2.39:1

    introTl = gsap.timeline({ onComplete: finishIntro });
    introTl
      .to(bars, { height: slit, duration: 1.3, ease: 'power3.inOut' }, 0.2)
      .to('.intro__logo', { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.55)
      .fromTo('.intro__logo', { scale: 1.07, y: 10 }, { scale: 1, y: 0, duration: 2.4, ease: 'power2.out' }, 0.55)
      .fromTo('.intro__slice-shine', { '--shine': '0%' }, { '--shine': '100%', duration: 1.3, ease: 'power2.inOut' }, 1.05)
      .to('.intro__logo', { opacity: 0, scale: 1.1, duration: 0.7, ease: 'power2.in' }, 2.65)
      .to('.intro__veil', { opacity: 0, duration: 0.9, ease: 'none' }, 2.65)
      .to(bars, { height: 0, duration: 1.1, ease: 'power4.inOut' }, 2.8);

    $('#introSkip').addEventListener('click', finishIntro);
    window.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter') { finishIntro(); window.removeEventListener('keydown', onKey); }
    });
  }

  function playHero() {
    gsap.fromTo('.hero__img', { scale: 1.22 }, { scale: 1.04, duration: 7, ease: 'power2.out' });
    var title = $('.hero__title');
    var tl = gsap.timeline({ delay: 0.1 });
    if (title && title._lines) { title._shown = true; tl.to(title._lines, { yPercent: 0, duration: 1.4, ease: 'power4.out', stagger: 0.14 }, 0); }
    tl.fromTo('[data-hero="fade"]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.16, clearProps: 'transform' }, 0.15);
  }


  /* ---------- Sequência de frames (reel tocando com a rolagem) ---------- */
  var SEQ = { total: 90, w: 720, h: 1280, split: 0.42, imgs: [], cv: {}, idx: {} };
  function seqSrc(i) { return 'assets/frames/f_' + ('000' + (i + 1)).slice(-4) + '.webp'; }
  function seqDraw(key, f) {
    var c = SEQ.cv[key]; if (!c) return;
    var i = Math.max(0, Math.min(SEQ.total - 1, Math.round(f)));
    var im = SEQ.imgs[i], k = 0;
    while ((!im || !im.complete || !im.naturalWidth) && k < SEQ.total) { // usa o quadro carregado mais próximo
      k++;
      im = SEQ.imgs[i - k];
      if (!im || !im.naturalWidth) im = SEQ.imgs[i + k];
    }
    if (!im || !im.naturalWidth || SEQ.idx[key] === i && SEQ.drawn[key]) return;
    c.getContext('2d').drawImage(im, 0, 0, SEQ.w, SEQ.h);
    SEQ.idx[key] = i; SEQ.drawn[key] = true;
  }
  function initSequence() {
    SEQ.drawn = {};
    [['hero', '.hero__img', 0], ['puxa', '.puxa__img', SEQ.split]].forEach(function (d) {
      var img = $(d[1]); if (!img) return;
      var c = document.createElement('canvas');
      c.width = SEQ.w; c.height = SEQ.h; c.className = img.className;
      c.setAttribute('role', 'img'); c.setAttribute('aria-label', img.alt || '');
      c.style.visibility = 'hidden';
      img.parentNode.insertBefore(c, img);
      SEQ.cv[d[0]] = c; SEQ.start = SEQ.start || {}; SEQ.start[d[0]] = d[2];
      c._img = img;
    });
    var next = 0, active = 0, MAX = 6;
    function pump() {
      while (active < MAX && next < SEQ.total) {
        (function (i) {
          var im = new Image(); active++;
          im.onload = im.onerror = function () {
            active--;
            if (im.naturalWidth) {
              Object.keys(SEQ.cv).forEach(function (key) {
                var c = SEQ.cv[key];
                var want = SEQ.cur && SEQ.cur[key] != null ? SEQ.cur[key] : SEQ.start[key] * (SEQ.total - 1);
                SEQ.drawn[key] = false; seqDraw(key, want);
                if (SEQ.drawn[key] && c.style.visibility === 'hidden') { c.style.visibility = ''; c._img.style.display = 'none'; }
              });
            }
            pump();
          };
          im.src = seqSrc(i); SEQ.imgs[i] = im;
        })(next++);
      }
    }
    SEQ.cur = {};
    pump();
  }
  function seqSet(key, f) { SEQ.cur[key] = f; seqDraw(key, f); }

  /* ---------- Cenas ---------- */
  function buildScenes() {
    initSequence();
    var last = SEQ.total - 1;
    /* Hero: parallax e saída */
    gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: function (self) { seqSet('hero', self.progress * SEQ.split * last); } });
    seqSet('hero', 0);
    gsap.to('.hero__content', { y: -70, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom 15%', scrub: true } });

    /* Cena 1 – puxa-queijo (pinned) */
    var puxa = $('.puxa');
    var ph = $$('.puxa__phrase .ln-in', puxa);
    var bar = $('.puxa__bar i', puxa);
    var idxEl = $('.puxa__idx', puxa);
    gsap.set(ph, { yPercent: 118 });
    var ptl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: puxa, start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * (isDesktop() ? 3.6 : 3.1)); },
        pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          gsap.set(bar, { scaleX: p });
          seqSet('puxa', (SEQ.split + p * (1 - SEQ.split)) * last);
          var i = p < 0.33 ? '01' : p < 0.68 ? '02' : '03';
          if (idxEl.textContent !== i) idxEl.textContent = i;
        }
      }
    });
    ptl.fromTo('.puxa__frame', { clipPath: 'inset(15% 11% 15% 11%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.4 }, 0)
       .fromTo('.puxa__img', { scale: 1 }, { scale: 1.22, duration: 4 }, 0)
       .to(ph[0], { yPercent: 0, duration: 0.45, ease: 'power3.out' }, 0.12)
       .to(ph[0], { yPercent: -118, duration: 0.35, ease: 'power2.in' }, 1.1)
       .to(ph[1], { yPercent: 0, duration: 0.45, ease: 'power3.out' }, 1.3)
       .to(ph[1], { yPercent: -118, duration: 0.35, ease: 'power2.in' }, 2.3)
       .to(ph[2], { yPercent: 0, duration: 0.5, ease: 'power3.out' }, 2.5);

    /* Cena 2 – cards entrando */
    gsap.fromTo('.card', { opacity: 0, x: 70 }, {
      opacity: 1, x: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12, clearProps: 'transform',
      scrollTrigger: { trigger: '.cast__track', start: 'top 85%', once: true }
    });

    /* Cena 4 – parallax em camadas + Ken Burns */
    $$('[data-parallax-y]').forEach(function (inner) {
      var v = parseFloat(inner.getAttribute('data-parallax-y')) || 0;
      gsap.fromTo(inner, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: inner.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-kenburns]').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.02 }, { scale: 1.16, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* Cena 5 – a caixa turquesa se abre */
    var lid = $('.box__lid');
    var btl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#boxStage', start: 'top 80%', end: 'bottom 45%', scrub: 0.8 } });
    btl.fromTo(lid, { rotateX: 0, transformPerspective: 1600 }, { rotateX: -112, transformPerspective: 1600, duration: 1, ease: 'power2.inOut' }, 0)
       .fromTo('.box__dark', { opacity: 0.92 }, { opacity: 0, duration: 0.8 }, 0.2)
       .fromTo('.box__pizza', { scale: 1.16, yPercent: 5 }, { scale: 1, yPercent: 0, duration: 1 }, 0)
       .to('.box__steam', { opacity: 1, duration: 0.3 }, 0.85);

    /* Galeria – entrada dos blocos */
    gsap.set('.tile', { opacity: 0, y: 60, scale: 0.97 });
    ScrollTrigger.batch('.tile', {
      start: 'top 92%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.1, clearProps: 'transform' }); }
    });

    /* Revelações genéricas */
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, clearProps: 'transform' }); }
    });

    /* Créditos: o texto sobe devagar */
    var credits = $('.credits'), roll = $('.credits__roll');
    root.classList.add('js-roll');
    function endY() {
      var vh = window.innerHeight, h = roll.offsetHeight;
      return h < vh * 0.8 ? (vh - h) / 2 : vh - h - vh * 0.13;
    }
    gsap.fromTo(roll, { y: function () { return window.innerHeight * 0.95; } }, {
      y: endY, ease: 'none',
      scrollTrigger: { trigger: credits, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
    });
  }

  function buildSplits() {
    var els = $$('[data-split]');
    els.forEach(splitEl);
    els.forEach(function (el) {
      if (el.hasAttribute('data-hero')) return;
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () { revealEl(el); } });
    });
  }

  /* ---------- Inicialização ---------- */
  initCursor();
  runIntro();

  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  heroReady = Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 2200); })]).then(function () {
    buildSplits();
    buildScenes();
    ScrollTrigger.refresh();
  });

  // reajusta linhas quando a largura muda (rotação do celular, redimensionar)
  var lastW = window.innerWidth, rzT;
  window.addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      $$('[data-split]').forEach(splitEl);
      ScrollTrigger.refresh();
    }, 250);
  });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
