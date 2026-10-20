(function () {
  'use strict';

  var root = document.documentElement;
  // .js la mette <head>; .js-ready = questo file è partito (il CSS ha ripieghi se manca).
  // .no-anim per un istante: il passaggio dai ripieghi alla versione normale non deve animarsi (es. la FAQ che svanisce sopra l'hero).
  root.classList.add('js-ready', 'no-anim');
  window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { root.classList.remove('no-anim'); }); });

  // --- Configurazione -------------------------------------------------------
  var WA_NUMBER = '393318380840';              // prefisso 39 + cellulare del negozio
  var MAP_SRC = 'https://www.openstreetmap.org/export/embed.html' +
    '?bbox=14.8440%2C36.7290%2C14.8600%2C36.7380&layer=mapnik&marker=36.7336496%2C14.8522478';
  var MAP_LINK = 'https://www.openstreetmap.org/?mlat=36.7336496&mlon=14.8522478#map=17/36.73365/14.85225';
  var RENT_MONTHS = [4, 10];                   // noleggio: da aprile (4) a ottobre (10) compresi
  var RENT_MAX_QTY = 20;

  var $ = function (sel, rootEl) { return (rootEl || document).querySelector(sel); };
  var $$ = function (sel, rootEl) { return Array.prototype.slice.call((rootEl || document).querySelectorAll(sel)); };
  var waUrl = function (text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollMode = function () { return reduceMotion ? 'auto' : 'smooth'; };
  // Sposta il focus senza far saltare la pagina (lo scroll lo decide chi chiama).
  function focusEl(el) {
    if (!el) return;
    if (!el.matches('a[href], button, input, select, textarea, summary, iframe, [tabindex]')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); }
  }

  // --- Comparsa allo scroll (per primo: se qualcosa più sotto va in errore, la pagina resta visibile) ---
  var items = $$('.reveal');
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
  var showReveals = function (container) { $$('.reveal', container).forEach(function (r) { r.classList.add('in'); }); };

  // --- Link WhatsApp con messaggio precompilato -----------------------------
  $$('.wa-link').forEach(function (a) {
    var msg = a.getAttribute('data-msg');
    if (msg) a.href = waUrl(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // --- Menu mobile ----------------------------------------------------------
  // Aperto: focus sulla prima voce, resto della pagina "inert" (Tab resta nel menu), Esc chiude e torna al pulsante.
  var header = $('.site-header');
  var burger = $('.burger');
  var nav = $('#nav');
  var mainEl = $('#main');
  var footerEl = $('.site-footer');
  function setMenu(open, returnFocus) {
    if (open === nav.classList.contains('open')) return;
    nav.style.setProperty('--hh', header.offsetHeight + 'px');
    nav.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);   // blocca lo scroll della pagina sotto il menu
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    [mainEl, footerEl].forEach(function (el) { if (el) el.inert = open; });
    if (open) { var first = $('a', nav); if (first) first.focus(); }
    else if (returnFocus) burger.focus();
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true); });
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
  if (dock) {   // altezza reale della barra (cresce col testo ingrandito): la usano il foglio FAQ e il footer
    var setDockH = function () { root.style.setProperty('--dock-h', Math.round(dock.getBoundingClientRect().height) + 'px'); };
    setDockH();
    window.addEventListener('resize', setDockH);
  }
  var isField = function (el) { return el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName); };
  document.addEventListener('focusin', function (e) { if (isField(e.target)) root.classList.add('typing'); });
  document.addEventListener('focusout', function (e) { if (isField(e.target)) root.classList.remove('typing'); });

  // Striscia scorrevole: un tocco la mette in pausa (chi ha "riduci movimento" la vede già ferma)
  var ticker = $('.ticker');
  if (ticker) ticker.addEventListener('click', function () { ticker.classList.toggle('paused'); });

  // Apre WhatsApp: nuova scheda; se il browser (es. quello interno di Facebook/Instagram) la blocca, nella stessa scheda.
  function openWhatsApp(text) {
    var url = waUrl(text);
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (err) { /* ignora */ } } else { window.location.href = url; }
  }

  // --- Moduli -> WhatsApp ---------------------------------------------------
  // Errori: testo sotto il campo (collegato con aria-describedby), riepilogo vicino al pulsante, focus sul primo campo da correggere.
  function setError(field, msg) {
    var id = field.id + '-err';
    var err = document.getElementById(id);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.id = id;
        err.className = 'field-error';
        field.closest('.field').appendChild(err);
      }
      err.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
    }
    var ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== id; });
    if (msg) ids.push(id);
    if (ids.length) field.setAttribute('aria-describedby', ids.join(' ')); else field.removeAttribute('aria-describedby');
  }
  // checks: [[campo, funzione che restituisce il messaggio d'errore oppure ''], ...]
  function validate(form, checks) {
    var first = null;
    checks.forEach(function (c) {
      var msg = c[1](c[0].value.trim());
      setError(c[0], msg);
      if (msg && !first) first = c[0];
    });
    var status = $('.form-status', form);
    if (first) {
      status.textContent = 'Manca qualcosa: controlla i campi segnati in rosso.';
      status.classList.add('is-error');
      first.focus();
      return false;
    }
    status.textContent = '';
    status.classList.remove('is-error');
    return true;
  }
  function sent(form) {
    var status = $('.form-status', form);
    status.classList.remove('is-error');
    status.textContent = 'Si è aperto WhatsApp con il messaggio pronto: premi Invia per mandarcelo.';
  }
  var required = function (what) { return function (v) { return v ? '' : what; }; };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var isoDate = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  function formatDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  $$('form .btn[type="submit"]').forEach(function (b) { b.disabled = false; });   // senza questo file restano disattivati
  $$('.form input, .form textarea').forEach(function (el) {
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') setError(el, ''); });
  });

  var repair = $('#repair-form');
  if (repair) repair.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = repair.elements;
    var ok = validate(repair, [
      [f.name, required('Scrivi il tuo nome.')],
      [f.tel, function (v) { return !v || v.replace(/\D/g, '').length >= 6 ? '' : 'Controlla il numero di telefono (o lascia il campo vuoto).'; }],
      [f.msg, required('Descrivi il problema, anche in poche parole.')]
    ]);
    if (!ok) return;
    var lines = [
      'Ciao Non Solo Bici! Sono ' + f.name.value.trim() + '.',
      'Vorrei far riparare: ' + f.type.value + '.',
      'Problema: ' + f.msg.value.trim()
    ];
    if (f.tel.value.trim()) lines.push('Il mio numero: ' + f.tel.value.trim());
    openWhatsApp(lines.join('\n'));
    sent(repair);
  });

  var rent = $('#rent-form');
  if (rent) {
    var today = new Date();
    var todayIso = isoDate(today);
    var inSeason = function (month) { return month >= RENT_MONTHS[0] && month <= RENT_MONTHS[1]; };
    // Prima data selezionabile: oggi se siamo in stagione, altrimenti il 1° aprile successivo.
    var firstDay = inSeason(today.getMonth() + 1) ? today
      : new Date(today.getMonth() + 1 > RENT_MONTHS[1] ? today.getFullYear() + 1 : today.getFullYear(), RENT_MONTHS[0] - 1, 1);
    rent.elements.date.min = isoDate(firstDay);
    if (!inSeason(today.getMonth() + 1)) {
      $('#n-date-hint').textContent = 'Il noleggio riapre il 1° aprile: puoi già chiedere per aprile–ottobre.';
    }
    rent.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = rent.elements;
      var ok = validate(rent, [
        [f.date, function (v) {
          if (!v) return '';
          if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Scrivi una data valida.';
          if (v < todayIso) return 'Scegli una data da oggi in poi.';
          return inSeason(parseInt(v.slice(5, 7), 10)) ? '' : 'Il noleggio è disponibile solo da aprile a ottobre: scegli una data in quel periodo.';
        }],
        [f.qty, function (v) {
          var n = Number(v);
          return v && Math.floor(n) === n && n >= 1 && n <= RENT_MAX_QTY ? '' : 'Indica un numero di bici da 1 a ' + RENT_MAX_QTY + ' (per gruppi più numerosi chiamaci).';
        }],
        [f.name, required('Scrivi il tuo nome.')]
      ]);
      if (!ok) return;
      var lines = [
        'Ciao Non Solo Bici! Sono ' + f.name.value.trim() + '.',
        'Vorrei noleggiare: ' + Number(f.qty.value) + ' × ' + f.kind.value + '.',
        'Durata: ' + f.dur.value + (f.date.value ? ', a partire dal ' + formatDate(f.date.value) : '') + '.',
        'Mi dite disponibilità e tariffa? Grazie!'
      ];
      openWhatsApp(lines.join('\n'));
      sent(rent);
    });
  }

  // --- Mappa: caricata solo su richiesta (niente richieste a terzi prima) ---
  var mapBtn = $('#map-load');
  if (mapBtn) mapBtn.addEventListener('click', function () {
    var box = $('#map'), ph = $('#map-ph');
    if (box.querySelector('iframe')) return;
    ph.classList.add('is-loading');
    mapBtn.setAttribute('aria-disabled', 'true');
    mapBtn.textContent = 'Caricamento della mappa…';
    var frame = document.createElement('iframe');
    frame.src = MAP_SRC;
    frame.title = 'Mappa: Non Solo Bici, Viale Europa, Pozzallo';
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    var done = false;
    var timer = setTimeout(function () {   // la mappa non risponde: lo diciamo e offriamo il link
      if (done) return;
      ph.classList.remove('is-loading');
      mapBtn.remove();
      var msg = document.createElement('span');
      msg.innerHTML = 'La mappa non si è caricata. <a href="' + MAP_LINK + '" target="_blank" rel="noopener">Aprila su OpenStreetMap</a>';
      ph.appendChild(msg);
    }, 15000);
    frame.addEventListener('load', function () {
      done = true;
      clearTimeout(timer);
      ph.remove();
      box.classList.add('is-loaded');
      var open = document.createElement('a');
      open.className = 'map-open';
      open.href = MAP_LINK;
      open.target = '_blank';
      open.rel = 'noopener';
      open.textContent = 'Apri la mappa ↗';
      box.appendChild(open);
      focusEl(frame);
    });
    box.appendChild(frame);
  });

  // --- Galleria foto: filtri per categoria + visualizzatore a schermo intero ---
  var photoItems = $$('.photo-item');
  var filterBtns = $$('.filter');
  // Con "Tutte" la galleria parte compatta (6 foto, 8 su schermi larghi) e si espande col pulsante.
  var moreBtn = $('#photos-more');
  var currentFilter = 'all', expanded = false;
  var collapsedLimit = function () { return window.matchMedia('(min-width: 980px)').matches ? 8 : 6; };
  var inFilter = function (li) { return currentFilter === 'all' || li.getAttribute('data-cat') === currentFilter; };
  function refreshPhotos() {
    var matches = photoItems.filter(inFilter);
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
  if (moreBtn) moreBtn.addEventListener('click', function () {
    var before = photoItems.filter(function (li) { return !li.hidden; }).length;
    expanded = true;
    refreshPhotos();
    var firstNew = photoItems.filter(function (li) { return !li.hidden; })[before];   // il focus va sulla prima foto appena comparsa
    if (firstNew) focusEl($('.photo', firstNew));
  });
  window.addEventListener('resize', function () { if (!expanded && currentFilter === 'all') refreshPhotos(); });
  refreshPhotos();
  filterBtns.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); }); });
  function goToGallery(f, moveFocus) {
    applyFilter(f);
    var g = $('#galleria');
    if (g) g.scrollIntoView({ behavior: scrollMode(), block: 'start' });
    if (moveFocus) focusEl($('.filter[aria-pressed="true"]'));
  }
  // dalle card di Vendita: <a href="#galleria-bici" data-show="bici">
  $$('[data-show]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      goToGallery(a.getAttribute('data-show'), true);
      if (history.replaceState) history.replaceState(null, '', '#galleria-' + a.getAttribute('data-show'));
    });
  });
  var hashMatch = /^#galleria-(bici|ebike|monopattini)$/.exec(window.location.hash);
  if (hashMatch) window.addEventListener('load', function () { goToGallery(hashMatch[1], false); });

  var lb = $('#lightbox');
  if (lb && photoItems.length) {
    var lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count'), lbWa = $('#lb-wa');
    var shown = [], pos = 0;
    // foto grande in WebP se il browser ha scelto il WebP anche per la miniatura (data-full resta il JPEG di riserva)
    var full = function (i) {
      var src = shown[i].getAttribute('data-full'), thumb = $('img', shown[i]);
      return /\.webp(\?|$)/.test(thumb.currentSrc || '') ? src.replace(/\.jpg$/, '.webp') : src;
    };
    var preload = function (i) { if (shown[i]) { var im = new Image(); im.src = full(i); } };
    var render = function () {
      var btn = shown[pos], thumb = $('img', btn), src = full(pos);
      // subito la miniatura (già in cache), poi la foto grande appena è scaricata
      lbImg.src = thumb.currentSrc || thumb.src;
      var big = new Image();
      big.onload = function () { if (shown[pos] === btn) lbImg.src = src; };
      big.src = src;
      lbImg.alt = thumb.alt;
      lbCap.textContent = thumb.alt;
      lbCount.textContent = (pos + 1) + ' / ' + shown.length;
      lbWa.href = waUrl('Ciao! Ho visto questa foto sul vostro sito: ' + thumb.alt + '. Vorrei informazioni.');
      if (shown.length > 1) preload((pos + 1) % shown.length);
    };
    var step = function (d) { if (shown.length > 1) { pos = (pos + d + shown.length) % shown.length; render(); } };
    var closeLb = function () { if (lb.open) lb.close(); };
    $$('.photo').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof lb.showModal !== 'function') { window.open(btn.getAttribute('data-full'), '_blank'); return; }
        // tutte le foto del filtro attivo, anche quelle non ancora mostrate nella galleria compatta
        shown = photoItems.filter(inFilter).map(function (li) { return $('.photo', li); });
        pos = shown.indexOf(btn);
        render();
        root.classList.add('lb-open');
        lb.showModal();
      });
    });
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
    $('.lb-next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('close', function () { root.classList.remove('lb-open'); lbImg.removeAttribute('src'); });
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
  // I link a #riparazioni e #noleggio (menu, card dei servizi, footer, FAQ) aprono la scheda giusta e ci portano il focus.
  var tabBtns = $$('.tab');
  var tabPanels = $$('.tabpanel');
  function showTab(name, focus) {
    tabBtns.forEach(function (t) {
      var on = t.id === 'tab-' + name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) focusEl(t);
    });
    tabPanels.forEach(function (p) {
      var on = p.id === name;
      p.classList.toggle('is-active', on);
      if (on) showReveals(p);   // gli elementi nascosti non erano mai stati "visti" dallo scroll
    });
  }
  function goToTab(name, focus) {
    showTab(name, focus);
    var s = $('#officina');
    if (s) s.scrollIntoView({ behavior: scrollMode(), block: 'start' });
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
      goToTab(name, true);
      if (history.replaceState) history.replaceState(null, '', '#' + name);
    });
    if (window.location.hash === '#noleggio' || window.location.hash === '#riparazioni') {
      window.addEventListener('load', function () { goToTab(window.location.hash.slice(1), false); });
    }
  }

  // --- Recensioni: il carosello è raggiungibile col Tab solo quando scorre (telefono/tablet) ---
  var reviews = $('.reviews');
  if (reviews) {
    var syncReviews = function () {
      if (reviews.scrollWidth > reviews.clientWidth + 2) reviews.tabIndex = 0; else reviews.removeAttribute('tabindex');
    };
    syncReviews();
    window.addEventListener('resize', syncReviews);
  }

  // --- "Aperto ora / Chiuso ora" (orari abituali, fuso orario italiano) --------
  // Minuti dalla mezzanotte; chiave = giorno (0 = domenica).
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
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Rome', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false, hourCycle: 'h23' }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
      mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);   // % 24: alcuni browser scrivono "24" per mezzanotte
      if (day === undefined || isNaN(mins)) throw new Error('orario non leggibile');
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
  // Mouse: si apre passandoci sopra (CSS :hover). Tastiera: si apre quando il pulsante riceve il focus.
  // Tocco/clic: apre e chiude. Esc, X, clic fuori o su un link la chiudono; dopo una chiusura "a mano" l'hover
  // non la riapre finché il puntatore non esce (classe .dismissed). Il link #faq del footer scorre fin lì e la apre.
  var faqPop = $('.faq-pop');
  if (faqPop) {
    var faqBtn = $('.faq-trigger', faqPop);
    var faqBox = $('.faq-box', faqPop);
    var faqSheet = window.matchMedia('(hover: none), (max-width: 759px)');
    var hovering = false;
    var isOpen = function () { return faqPop.classList.contains('open'); };
    var isShown = function () { return isOpen() || (hovering && !faqPop.classList.contains('dismissed')); };
    var syncFaq = function () { faqBtn.setAttribute('aria-expanded', String(isShown())); };
    // Su schermo largo il riquadro si apre sopra il pulsante: se lassù non c'è abbastanza posto lo apre sotto (sul footer)
    // e in ogni caso ne limita l'altezza allo spazio libero (il contenuto scorre dentro il riquadro).
    var placeFaq = function () {
      if (faqSheet.matches) { faqPop.classList.remove('down'); faqBox.style.removeProperty('--faq-max'); return; }
      var r = faqBtn.getBoundingClientRect();
      var up = r.top - (header ? header.offsetHeight : 0) - 18;
      var down = Math.min(window.innerHeight - r.bottom, document.documentElement.scrollHeight - window.pageYOffset - r.bottom) - 24;
      var below = up < 300 && down > up;
      faqPop.classList.toggle('down', below);
      faqBox.style.setProperty('--faq-max', Math.max(180, Math.min(560, below ? down : up)) + 'px');
    };
    var setFaq = function (open, dismiss) {
      if (open) placeFaq();
      faqPop.classList.toggle('open', open);
      faqPop.classList.toggle('dismissed', !open && !!dismiss);
      syncFaq();
    };
    var faqQueued = false;
    var queueFaq = function () {
      if (faqQueued) return;
      faqQueued = true;
      window.requestAnimationFrame(function () { faqQueued = false; placeFaq(); });
    };
    window.addEventListener('scroll', queueFaq, { passive: true });
    window.addEventListener('resize', queueFaq);
    placeFaq();

    faqPop.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      hovering = true;
      placeFaq();
      syncFaq();
    });
    faqPop.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      hovering = false;
      faqPop.classList.remove('dismissed');
      syncFaq();
    });
    faqPop.addEventListener('focusin', function (e) {
      // arrivo da tastiera sul pulsante: apre (non dopo una chiusura con Esc/X)
      if (e.target === faqBtn && faqBtn.matches(':focus-visible') && !faqPop.classList.contains('dismissed') && !isOpen()) setFaq(true);
    });
    faqPop.addEventListener('focusout', function (e) {
      if (faqPop.contains(e.relatedTarget)) return;
      faqPop.classList.remove('dismissed');
      if (isOpen()) setFaq(false); else syncFaq();
    });
    faqBtn.addEventListener('click', function () {
      if (isShown()) setFaq(false, true); else setFaq(true);
    });
    $('.faq-close', faqPop).addEventListener('click', function () { setFaq(false, true); faqBtn.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isShown()) return;
      var inside = faqPop.contains(document.activeElement);
      setFaq(false, true);
      if (inside) faqBtn.focus();
    });
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a');
      if (link && link.getAttribute('href') === '#faq') {
        e.preventDefault();
        $('#faq').scrollIntoView({ block: 'end' });
        faqPop.classList.remove('dismissed');
        setFaq(true);
        focusEl($('summary', faqPop));
      } else if (link && faqPop.contains(link)) {
        setFaq(false, true);
      } else if (!faqPop.contains(e.target) && isOpen()) {
        setFaq(false);
      }
    });
  }

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
