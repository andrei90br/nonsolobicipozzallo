# Non Solo Bici Pozzallo — sito web

Sito statico (HTML + CSS + JS, nessuna dipendenza, nessun font o script di terze parti) per
**Non Solo Bici di Giudice Michele** — Viale Europa snc, 97016 Pozzallo (RG).

Serve come vetrina pubblicitaria e come punto di contatto per **vendita**, **riparazioni** e **noleggio** (bici ed e-bike).

## Anteprima in locale

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5174
```

Poi apri <http://localhost:5174/>. (In Claude Code è già configurato come `non-solo-bici` in `.claude/launch.json`.)

## Pubblicazione

**Sito online:** <https://andrei90br.github.io/nonsolobicipozzallo/>

Il deploy è automatico con GitHub Pages: ogni push su `sito-nuovo` o `main` esegue il workflow
[`pages.yml`](.github/workflows/pages.yml), che pubblica la cartella `site/` (nessun build). Si può lanciare anche a mano
da *Actions → Deploy su GitHub Pages → Run workflow*. Le regole dell'ambiente `github-pages` consentono solo i branch
`main` e `sito-nuovo`: per pubblicare da un altro branch va aggiunto in *Settings → Environments → github-pages*.

**Cache:** GitHub Pages fa tenere i file in cache al browser per 10 minuti. Per questo gli indirizzi di CSS, JS e foto
in `index.html` e `privacy.html` hanno un numero di versione (`style.css?v=2`): quando modifichi uno di questi file,
aumenta il numero (`?v=3`…) in tutte le pagine, così pagina e stile arrivano sempre insieme.

Per usare un dominio proprio: *Settings → Pages → Custom domain*. In alternativa basta caricare **il contenuto di `site/`**
su qualsiasi hosting statico (Netlify, Cloudflare Pages, hosting tradizionale via FTP…).

## Ottimizzazione per smartphone

Il sito è pensato soprattutto per l'uso da telefono (regole in fondo a `site/css/style.css`):

- **Hero:** su telefono la foto della vetrina è mostrata intera sopra il titolo (un ritaglio a tutta altezza la ingrandiva e sgranava).
- **Barra azioni** Chiama / WhatsApp / Indicazioni: compare dopo i pulsanti dell'hero e si nasconde mentre si scrive in un modulo o con il menu aperto.
- **Menu** a schermo intero con link grandi e pulsanti Chiama / WhatsApp.
- **Tocco:** tutti i link e i pulsanti sono alti almeno 44 px; le card di Vendita sono tappabili per intero; gli effetti hover sono attivi solo con il mouse.
- **Pagina più corta:** card compatte (icona a sinistra) per servizi, vendita e noleggio.
- **WhatsApp:** dai browser interni di Facebook/Instagram, se la nuova scheda è bloccata, si apre nella stessa scheda.
- Per una foto più nitida su schermi grandi serve un originale ad alta risoluzione (ora 1278×720).

## Struttura

```
site/
  index.html        pagina unica: hero, servizi, vendita, riparazioni, noleggio, chi siamo, contatti
  privacy.html      informativa privacy (bozza)
  css/style.css     stile (palette rosso/nero/carta dal logo)
  js/main.js        menu mobile, moduli → WhatsApp, mappa su richiesta, animazioni
  assets/favicon.svg
  assets/hero.jpg   foto della vetrina, sfondo dell'hero (1278×720)
  assets/og.jpg     stessa foto ritagliata 1200×630 per le anteprime social (WhatsApp, Facebook)
serve.ps1           mini server locale
```

## Da completare / verificare (segnalato con commenti `DA COMPLETARE` in `index.html`)

| Cosa | Dove | Note |
|---|---|---|
| **Orari di apertura** | `index.html`, sezione Contatti | Non pubblici su Facebook/Instagram: al momento il sito invita a chiamare. |
| **Partita IVA / ragione sociale** | `index.html`, footer | Obbligatoria per un'attività commerciale in Italia. |
| **Prezzi / tariffe noleggio** | sezioni Vendita e Noleggio | Ora indicati "su richiesta". |
| **Altre foto** del negozio e dei prodotti | sezioni Vendita, Chi siamo | Per ora c'è solo la foto della vetrina nell'hero (`assets/hero.jpg`); il resto usa icone e illustrazioni SVG. Non sono state copiate foto dai social (diritti d'autore). |
| **Dominio** | `<head>` di `index.html` | Quando c'è il dominio proprio, aggiorna l'URL assoluto di `og:image` (e in `image` del JSON-LD) e aggiungi `canonical` e `og:url`. |
| **Privacy** | `privacy.html` | È una bozza: da far controllare prima della pubblicazione. |
| **Numero WhatsApp** | `site/js/main.js` (`WA_NUMBER`) | Impostato su 331 838 0840 (cellulare dalla pagina Facebook): verifica che sia attivo su WhatsApp. |

## Dati di partenza (fonti)

- Facebook *Non Solo Bici | Pozzallo*: servizi (vendita bici nuove/usate, vendita auto, accessori, riparazioni, noleggio bici e e-bike), indirizzo, cellulare 331 838 0840.
- Instagram *@non_solo_bici_pozzallo*: bio (vendita bici & auto, riparazioni, ricambi & accessori, noleggio), in evidenza Fat Bike / monopattini / usato / BMX-Freestyle.
- Directory pubbliche (BikeTourism.org): telefono fisso 0932 797162 e coordinate per la mappa.
