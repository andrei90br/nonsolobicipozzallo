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
