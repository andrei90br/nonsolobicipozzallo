(function () {
  'use strict';

  // --- Configurazione -------------------------------------------------------
  var WA_NUMBER = '393318380840';              // prefisso 39 + cellulare del negozio
  var MAP_SRC = 'https://www.openstreetmap.org/export/embed.html' +
    '?bbox=14.8440%2C36.7290%2C14.8600%2C36.7380&layer=mapnik&marker=36.7336496%2C14.8522478';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var waUrl = function (text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); };

  // --- Link WhatsApp con messaggio precompilato -----------------------------
  $$('.wa-link').forEach(function (a) {
    var msg = a.getAttribute('data-msg');
    if (msg) a.href = waUrl(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // --- Menu mobile ----------------------------------------------------------
  var burger = $('.burger');
  var nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);   // blocca lo scroll della pagina sotto il menu
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1040) setMenu(false); });

  // --- Barra azioni (Chiama / WhatsApp / Indicazioni) su smartphone -----------
  // Compare quando i pulsanti dell'hero sono usciti dallo schermo; si nasconde mentre si scrive (tastiera aperta).
  var dock = $('.dock');
  var heroCta = $('.hero-cta');
  if (dock && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var en = entries[0];
      dock.classList.toggle('show', !en.isIntersecting && en.boundingClientRect.top < 0);
    }).observe(heroCta);
  } else if (dock) {
    dock.classList.add('show');
  }
  var isField = function (el) { return el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName); };
  document.addEventListener('focusin', function (e) { if (isField(e.target)) document.documentElement.classList.add('typing'); });
  document.addEventListener('focusout', function (e) { if (isField(e.target)) document.documentElement.classList.remove('typing'); });

  // Apre WhatsApp: nuova scheda; se il browser (es. quello interno di Facebook/Instagram) la blocca, nella stessa scheda.
  function openWhatsApp(text) {
    var url = waUrl(text);
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (err) { /* ignora */ } } else { window.location.href = url; }
  }

  // --- Moduli -> WhatsApp ---------------------------------------------------
  function markInvalid(field, bad) {
    field.setAttribute('aria-invalid', bad ? 'true' : 'false');
    field.style.borderColor = bad ? 'var(--red)' : '';
  }
  function requireFields(form, names) {
    var ok = true, first = null;
    names.forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim();
      markInvalid(f, bad);
      if (bad) { ok = false; first = first || f; }
    });
    if (first) first.focus();
    return ok;
  }
  function formatDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  var repair = $('#repair-form');
  repair.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!requireFields(repair, ['name', 'msg'])) return;
    var f = repair.elements;
    var lines = [
      'Ciao Non Solo Bici! Sono ' + f.name.value.trim() + '.',
      'Vorrei far riparare: ' + f.type.value + '.',
      'Problema: ' + f.msg.value.trim()
    ];
    if (f.tel.value.trim()) lines.push('Il mio numero: ' + f.tel.value.trim());
    openWhatsApp(lines.join('\n'));
  });

  var rent = $('#rent-form');
  var today = new Date();
  var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  rent.elements.date.min = iso;
  rent.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!requireFields(rent, ['name'])) return;
    var f = rent.elements;
    var qty = Math.max(1, parseInt(f.qty.value, 10) || 1);
    var lines = [
      'Ciao Non Solo Bici! Sono ' + f.name.value.trim() + '.',
      'Vorrei noleggiare: ' + qty + ' × ' + f.kind.value + '.',
      'Durata: ' + f.dur.value + (f.date.value ? ', a partire dal ' + formatDate(f.date.value) : '') + '.',
      'Mi dite disponibilità e tariffa? Grazie!'
    ];
    openWhatsApp(lines.join('\n'));
  });
  $$('input, textarea', document).forEach(function (el) {
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') markInvalid(el, false); });
  });

  // --- Mappa: caricata solo su richiesta (niente richieste a terzi prima) ---
  var mapBtn = $('#map-load');
  mapBtn.addEventListener('click', function () {
    var ph = $('#map-ph');
    var frame = document.createElement('iframe');
    frame.src = MAP_SRC;
    frame.title = 'Mappa: Non Solo Bici, Viale Europa, Pozzallo';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer';
    $('#map').appendChild(frame);
    ph.remove();
  });

  // --- Galleria foto: filtri per categoria + visualizzatore a schermo intero ---
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var photoItems = $$('.photo-item');
  var filterBtns = $$('.filter');
  // Con "Tutte" la galleria parte compatta (6 foto, 8 su schermi larghi) e si espande col pulsante.
  var moreBtn = $('#photos-more');
  var currentFilter = 'all', expanded = false;
  var collapsedLimit = function () { return window.matchMedia('(min-width: 980px)').matches ? 8 : 6; };
  function refreshPhotos() {
    var matches = photoItems.filter(function (li) { return currentFilter === 'all' || li.getAttribute('data-cat') === currentFilter; });
    var limit = (currentFilter === 'all' && !expanded) ? collapsedLimit() : matches.length;
    photoItems.forEach(function (li) { li.hidden = matches.indexOf(li) === -1 || matches.indexOf(li) >= limit; });
    if (moreBtn) {
      moreBtn.hidden = !(currentFilter === 'all' && !expanded && matches.length > limit);
      moreBtn.textContent = 'Mostra tutte le ' + matches.length + ' foto';
    }
  }
  function applyFilter(f) {
    currentFilter = f;
    if (f !== 'all') expanded = false;
    refreshPhotos();
    filterBtns.forEach(function (b) {
      var on = b.getAttribute('data-filter') === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  if (moreBtn) moreBtn.addEventListener('click', function () { expanded = true; refreshPhotos(); });
  window.addEventListener('resize', function () { if (!expanded && currentFilter === 'all') refreshPhotos(); });
  refreshPhotos();
  filterBtns.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); }); });
  function goToGallery(f) {
    applyFilter(f);
    var g = $('#galleria');
    if (g) g.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  // dalle card di Vendita: <a href="#galleria-bici" data-show="bici">
  $$('[data-show]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      goToGallery(a.getAttribute('data-show'));
      if (history.replaceState) history.replaceState(null, '', '#galleria-' + a.getAttribute('data-show'));
    });
  });
  var hashMatch = /^#galleria-(bici|ebike|monopattini)$/.exec(window.location.hash);
  if (hashMatch) window.addEventListener('load', function () { goToGallery(hashMatch[1]); });

  var lb = $('#lightbox');
  if (lb && photoItems.length) {
    var lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count'), lbWa = $('#lb-wa');
    var shown = [], pos = 0;
    var preload = function (i) { if (shown[i]) { var im = new Image(); im.src = shown[i].getAttribute('data-full'); } };
    var render = function () {
      var btn = shown[pos], thumb = $('img', btn);
      lbImg.src = btn.getAttribute('data-full');
      lbImg.alt = thumb.alt;
      lbCap.textContent = thumb.alt;
      lbCount.textContent = (pos + 1) + ' / ' + shown.length;
      lbWa.href = waUrl('Ciao! Ho visto questa foto sul vostro sito: ' + thumb.alt + '. Vorrei informazioni.');
      if (shown.length > 1) { preload((pos + 1) % shown.length); preload((pos - 1 + shown.length) % shown.length); }
    };
    var step = function (d) { if (shown.length > 1) { pos = (pos + d + shown.length) % shown.length; render(); } };
    var closeLb = function () { if (lb.open) lb.close(); };
    $$('.photo').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof lb.showModal !== 'function') { window.open(btn.getAttribute('data-full'), '_blank'); return; }
        shown = photoItems.filter(function (li) { return !li.hidden; }).map(function (li) { return $('.photo', li); });
        pos = shown.indexOf(btn);
        render();
        document.documentElement.classList.add('lb-open');
        lb.showModal();
      });
    });
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
    $('.lb-next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('close', function () { document.documentElement.classList.remove('lb-open'); lbImg.removeAttribute('src'); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });   // tocco sullo sfondo
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    // scorrimento con il dito: trascina a sinistra/destra
    var tx = null, ty = null;
    lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      tx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // --- Officina e noleggio: due schede nella stessa sezione -------------------
  // I link a #riparazioni e #noleggio (menu, card dei servizi, footer, FAQ) aprono la scheda giusta.
  var tabBtns = $$('.tab');
  var tabPanels = $$('.tabpanel');
  function showTab(name, focus) {
    tabBtns.forEach(function (t) {
      var on = t.id === 'tab-' + name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    tabPanels.forEach(function (p) {
      var on = p.id === name;
      p.classList.toggle('is-active', on);
      if (on) $$('.reveal', p).forEach(function (r) { r.classList.add('in'); });   // gli elementi nascosti non erano mai stati "visti" dallo scroll
    });
  }
  function goToTab(name) {
    showTab(name);
    var s = $('#officina');
    if (s) s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  if (tabBtns.length) {
    tabBtns.forEach(function (t, i) {
      t.addEventListener('click', function () { showTab(t.id.replace('tab-', '')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var next = tabBtns[(i + (e.key === 'ArrowRight' ? 1 : tabBtns.length - 1)) % tabBtns.length];
        showTab(next.id.replace('tab-', ''), true);
      });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#riparazioni"], a[href="#noleggio"]');
      if (!a) return;
      e.preventDefault();
      var name = a.getAttribute('href').slice(1);
      goToTab(name);
      if (history.replaceState) history.replaceState(null, '', '#' + name);
    });
    if (window.location.hash === '#noleggio' || window.location.hash === '#riparazioni') {
      window.addEventListener('load', function () { goToTab(window.location.hash.slice(1)); });
    }
  }

  // --- "Aperto ora / Chiuso ora" (orari abituali, fuso orario italiano) --------
  // Orari dalla scheda Google (2 ott 2026). Minuti dalla mezzanotte; chiave = giorno (0 = domenica).
  // Se cambiano, aggiornare anche la sezione Contatti, le FAQ, il JSON-LD e llms.txt.
  var OPENING = {
    0: [],
    1: [[510, 750], [930, 1170]], 2: [[510, 750], [930, 1170]], 3: [[510, 750], [930, 1170]],
    4: [[510, 750], [930, 1170]], 5: [[510, 750], [930, 1170]],
    6: [[510, 750]]
  };
  var DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var fmtTime = function (m) { return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
  var openNowEl = $('#open-now');
  function updateOpenNow() {
    if (!openNowEl) return;
    var day, mins;
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Rome', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
      mins = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
    } catch (err) { openNowEl.hidden = true; return; }
    var slots = OPENING[day], text, state = 'closed', i, d;
    for (i = 0; i < slots.length; i++) {
      if (mins >= slots[i][0] && mins < slots[i][1]) { state = 'open'; text = 'Aperto ora · chiude alle ' + fmtTime(slots[i][1]); break; }
    }
    if (state === 'closed') {
      for (i = 0; i < slots.length; i++) {
        if (mins < slots[i][0]) { text = 'Chiuso ora · riapre oggi alle ' + fmtTime(slots[i][0]); break; }
      }
    }
    if (!text) {
      for (d = 1; d <= 7; d++) {
        var nd = (day + d) % 7;
        if (OPENING[nd].length) {
          text = 'Chiuso ora · riapre ' + (d === 1 ? 'domani' : DAYS[nd]) + ' alle ' + fmtTime(OPENING[nd][0][0]);
          break;
        }
      }
    }
    openNowEl.textContent = text;
    openNowEl.setAttribute('data-state', state);
    openNowEl.hidden = false;
  }
  updateOpenNow();
  setInterval(updateOpenNow, 60000);

  // --- FAQ a comparsa ---------------------------------------------------------
  // Col mouse si apre da solo (solo CSS, :hover). Qui: apertura al tocco/clic e da tastiera, chiusura con Esc,
  // clic fuori o su un link, e il link "Domande frequenti" del footer (#faq) che scorre fin lì e lo apre.
  var faqPop = $('.faq-pop');
  if (faqPop) {
    var faqBtn = $('.faq-trigger', faqPop);
    var setFaq = function (open) {
      faqPop.classList.toggle('open', open);
      faqBtn.setAttribute('aria-expanded', String(open));
    };
    // Su schermo largo il riquadro si apre sopra il pulsante: se lassù non c'è abbastanza posto lo apre sotto (sul footer)
    // e in ogni caso ne limita l'altezza allo spazio libero (il contenuto scorre dentro il riquadro).
    var faqSheet = window.matchMedia('(hover: none), (max-width: 759px)');
    var faqBox = $('.faq-box', faqPop);
    var placeFaq = function () {
      if (faqSheet.matches) { faqPop.classList.remove('down'); faqBox.style.removeProperty('--faq-max'); return; }
      var header = $('.site-header');
      var r = faqBtn.getBoundingClientRect();
      var up = r.top - (header ? header.offsetHeight : 0) - 18;
      var down = Math.min(window.innerHeight - r.bottom, document.documentElement.scrollHeight - window.pageYOffset - r.bottom) - 24;
      var below = up < 300 && down > up;
      faqPop.classList.toggle('down', below);
      faqBox.style.setProperty('--faq-max', Math.max(180, Math.min(560, below ? down : up)) + 'px');
    };
    var faqQueued = false;
    var queueFaq = function () {
      if (faqQueued) return;
      faqQueued = true;
      window.requestAnimationFrame(function () { faqQueued = false; placeFaq(); });
    };
    ['pointerenter', 'focusin'].forEach(function (t) { faqPop.addEventListener(t, queueFaq); });
    window.addEventListener('scroll', queueFaq, { passive: true });
    window.addEventListener('resize', queueFaq);
    placeFaq();

    faqBtn.addEventListener('click', function () { placeFaq(); setFaq(!faqPop.classList.contains('open')); });
    $('.faq-close', faqPop).addEventListener('click', function () { setFaq(false); faqBtn.blur(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && faqPop.classList.contains('open')) { setFaq(false); faqBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a');
      if (link && link.getAttribute('href') === '#faq') {
        e.preventDefault();
        $('#faq').scrollIntoView({ block: 'end' });
        setFaq(true);
      } else if (!faqPop.contains(e.target) || (link && faqPop.contains(link))) {
        setFaq(false);
      }
    });
  }

  // --- Comparsa allo scroll -------------------------------------------------
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
