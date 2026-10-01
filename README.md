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

**Sito online:** <https://nonsolobicipozzallo.it/> (dominio registrato su Aruba; con il dominio attivo l'indirizzo `andrei90br.github.io/nonsolobicipozzallo` rimanda qui).

**Dominio:** i DNS sono gestiti da Aruba (*Gestione DNS e Name Server*). Record in uso: quattro `A` su `@` verso
`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` e un `CNAME` `www` verso `andrei90br.github.io`.
I record `MX`/`mx` (posta Aruba) non vanno toccati. Il dominio personalizzato è impostato in *Settings → Pages* del repository.

Il deploy è automatico con GitHub Pages: ogni push su `sito-nuovo` o `main` esegue il workflow
[`pages.yml`](.github/workflows/pages.yml), che pubblica la cartella `site/` (nessun build). Si può lanciare anche a mano
da *Actions → Deploy su GitHub Pages → Run workflow*. Le regole dell'ambiente `github-pages` consentono solo i branch
`main` e `sito-nuovo`: per pubblicare da un altro branch va aggiunto in *Settings → Environments → github-pages*.

**Cache:** GitHub Pages fa tenere i file in cache al browser per 10 minuti. Per questo gli indirizzi di CSS, JS e foto
in `index.html` e `privacy.html` hanno un numero di versione (`style.css?v=4`): quando modifichi uno di questi file,
aumenta il numero (`?v=5`…) in tutte le pagine, così pagina e stile arrivano sempre insieme.

In alternativa a GitHub Pages basta caricare **il contenuto di `site/`** su qualsiasi hosting statico
(Netlify, Cloudflare Pages, hosting tradizionale via FTP…).

## Pagina compatta

Il sito è stato accorciato (2 ott 2026) mantenendo lo stesso aspetto: da ~13.900 a ~8.150 px su telefono e da ~11.200 a ~7.450 px su desktop. Anche "Chi siamo" e "Recensioni" stanno nella stessa sezione (`#chi-siamo`, con `#recensioni` come blocco interno).
**Riparazione e noleggio** stanno nella stessa sezione (`#officina`) con due schede (Riparazione / Noleggio); i link `#riparazioni` e
`#noleggio` (menu, card dei servizi, footer, FAQ) aprono la scheda giusta. Senza JavaScript le due schede sono visibili una sotto l'altra.
La galleria parte con 6 foto (8 su desktop) e un pulsante "Mostra tutte"; su telefono le card di Vendita sono in due colonne.

## Galleria foto

Nella sezione **Vendita** c'è la galleria "Guarda cosa trovi in negozio": filtri (Tutte / Bici / E-bike / Monopattini elettrici),
griglia di miniature e visualizzatore a schermo intero (frecce, tastiera, scorrimento con il dito, pulsante WhatsApp con il
nome della foto). Toccando le card di Vendita ("Vedi le foto") si va alla galleria già filtrata; l'indirizzo `/#galleria-bici`,
`/#galleria-ebike`, `/#galleria-monopattini` apre direttamente un filtro.

Le foto sono quelle caricate sulla **scheda Google** del negozio (12 scelte, ottimizzate, senza dati di posizione).
Per aggiungerne una: carica in `site/assets/gallery/` due misure (`nome-640.jpg` per la miniatura, lato lungo ~1400 px
`nome-1400.jpg` per l'ingrandimento), copia un `<li class="photo-item" data-cat="…">` in `site/index.html` (categorie:
`bici`, `ebike`, `monopattini`) e aggiungi la foto a `site/sitemap.xml`. Nelle foto non devono comparire scritte con servizi
non offerti (nella foto delle e-bike pieghevoli lo striscione con "vendita bici e auto" è stato tagliato).

## Ottimizzazione per smartphone

Il sito è pensato soprattutto per l'uso da telefono (regole in fondo a `site/css/style.css`):

- **Hero:** su telefono la foto della vetrina è mostrata intera sopra il titolo (un ritaglio a tutta altezza la ingrandiva e sgranava).
- **Barra azioni** Chiama / WhatsApp / Indicazioni: compare dopo i pulsanti dell'hero e si nasconde mentre si scrive in un modulo o con il menu aperto.
- **Menu** a schermo intero con link grandi e pulsanti Chiama / WhatsApp.
- **Tocco:** tutti i link e i pulsanti sono alti almeno 44 px; le card di Vendita sono tappabili per intero; gli effetti hover sono attivi solo con il mouse.
- **Pagina più corta:** card compatte (icona a sinistra) per servizi, vendita e noleggio.
- **WhatsApp:** dai browser interni di Facebook/Instagram, se la nuova scheda è bloccata, si apre nella stessa scheda.
- Per una foto più nitida su schermi grandi serve un originale ad alta risoluzione (ora 1278×720).

## SEO locale e GEO (ricerca con assistenti AI)

**Nel sito** (già fatto):
- **Titoli e testi con parole chiave locali:** H1 "Negozio di bici a Pozzallo: Non solo bici.", etichette di sezione tipo "Noleggio bici ed e-bike a Pozzallo", meta description, indirizzo canonico `https://nonsolobicipozzallo.it/`.
- **Dati strutturati** (JSON-LD in `<head>`): `BicycleStore` con indirizzo, coordinate, telefoni, profili social, catalogo servizi e prodotti, più `WebSite`, `WebPage`, `ImageObject` e `FAQPage`. Contengono gli orari di apertura (dalla scheda Google, `openingHoursSpecification`) ma non i prezzi, che non sono noti.
- **Sezione "Domande frequenti"** (`#faq`): il testo deve restare identico a quello del `FAQPage` nel JSON-LD.
- **"Chi siamo"** apre con una frase-definizione (chi è, dove, cosa fa): è quella che motori di ricerca e assistenti AI tendono a citare.
- **Posizione:** tag `geo.*`, `<address>` semantico, telefono e indirizzo uguali ovunque (nome, indirizzo e telefono sempre identici).
- **File per crawler e AI:** `robots.txt` (tutto consentito), `sitemap.xml`, `llms.txt` (scheda riassuntiva in italiano e inglese), pagina `404.html`.
- Se cambiano indirizzo, telefono o servizi: aggiornare `index.html` (testi e JSON-LD), `llms.txt` e `sitemap.xml` (`lastmod`).

**Fuori dal sito** (lo fa il negozio, pesa più di qualunque modifica al codice):
1. **Scheda Google Business Profile:** crearla/rivendicarla, categoria "Negozio di biciclette", orari, foto, servizi, telefono e link al sito. È il fattore principale per "negozio bici vicino a me".
2. **Recensioni Google:** chiederle ai clienti soddisfatti (si può generare un link diretto dalla scheda) e rispondere a tutte.
3. **Stessi dati ovunque:** nome "Non Solo Bici", indirizzo "Viale Europa snc, 97016 Pozzallo (RG)" e telefono identici su Facebook, Instagram, PagineGialle, Virgilio, BikeTourism.org, Bing Places e Apple Business Connect.
4. **Link al sito** nella bio di Instagram e nella scheda Facebook.
5. **Google Search Console** e **Bing Webmaster Tools:** aggiungere il dominio (verifica con record TXT su Aruba) e inviare `https://nonsolobicipozzallo.it/sitemap.xml`.
6. **Controlli:** [Rich Results Test](https://search.google.com/test/rich-results) e [validator.schema.org](https://validator.schema.org/) sull'indirizzo del sito.
7. Idea futura: una versione in inglese (Pozzallo ha turisti che cercano "bike rental").

## Struttura

```
site/
  index.html        pagina unica: hero, negozio-officina-noleggio (servizi + vendita + galleria in un’unica sezione), officina e noleggio (due schede), chi siamo + recensioni (un’unica sezione scura), FAQ, contatti
  privacy.html      informativa privacy (bozza)
  404.html          pagina "non trovata" autonoma
  robots.txt  sitemap.xml  llms.txt   file per motori di ricerca e assistenti AI
  css/style.css     stile (palette rosso/nero/carta dal logo)
  js/main.js        menu mobile, moduli → WhatsApp, mappa su richiesta, animazioni
  assets/logo.png          logo ufficiale (600×600, sfondo bianco): sezione "Chi siamo" e dati per Google
  assets/logo-192.png      logo piccolo: testata e footer; usato anche come icona della scheda (192×192)
  assets/favicon-32.png  assets/apple-touch-icon.png    icone della scheda del browser e per iPhone
  assets/gallery/   12 foto della galleria, ciascuna in due misure (-640 miniatura, -1400 ingrandimento)
  assets/hero.jpg   foto della vetrina, sfondo dell'hero (1278×720)
  assets/og.jpg     stessa foto ritagliata 1200×630 per le anteprime social (WhatsApp, Facebook)
serve.ps1           mini server locale
```

## Da completare / verificare (segnalato con commenti `DA COMPLETARE` in `index.html`)

| Cosa | Dove | Note |
|---|---|---|
| **Orari di apertura** (già inseriti) | Contatti, FAQ, JSON-LD, `llms.txt`, `OPENING` in `js/main.js` | Presi dalla scheda Google il 2 ott 2026 (lun–ven 8:30–12:30 e 15:30–19:30, sab 8:30–12:30, dom chiuso). Se cambiano vanno aggiornati in tutti questi punti; nei festivi possono variare. |
| **Partita IVA / ragione sociale** | `index.html`, footer | Obbligatoria per un'attività commerciale in Italia. |
| **Prezzi / tariffe noleggio** | sezioni Vendita e Noleggio | Ora indicati "su richiesta". |
| **Altre foto** (officina, riparazioni, noleggio, accessori) | galleria in Vendita, Riparazioni, Noleggio | Ora ci sono bici, e-bike e monopattini (dalla scheda Google). Mancano foto dell'officina, del noleggio e degli accessori. |
| **Se cambia il dominio** | `index.html`, `robots.txt`, `sitemap.xml`, `llms.txt` | Gli URL assoluti (`canonical`, `og:url`, `og:image`, JSON-LD) usano `https://nonsolobicipozzallo.it/`. |
| **Privacy** | `privacy.html` | È una bozza: da far controllare prima della pubblicazione. |
| **Numero WhatsApp** | `site/js/main.js` (`WA_NUMBER`) | Impostato su 331 838 0840 (cellulare dalla pagina Facebook): verifica che sia attivo su WhatsApp. |

## Recensioni Google

Il blocco **"Parlano i clienti"** (`#recensioni`, dentro la sezione "Chi siamo", sotto la presentazione) mostra la valutazione (4,7 su 5, 18 recensioni, ottobre 2026) e tre recensioni
da 5 stelle riportate parola per parola con nome e iniziale, più i link ufficiali "Leggi tutte" e "Lascia la tua recensione"
(Place ID `ChIJZT73J0SNERMRA-wFYyzmvQ4`). Il numero compare anche nella prima schermata (chip in hero) e tra le statistiche di "Chi siamo".
I numeri sono scritti a mano: vanno aggiornati ogni tanto (in `index.html`, cercando "4,7"). **Non** aggiungere
`aggregateRating` né `Review` ai dati strutturati: per le attività locali le recensioni "proprie" vanno contro le linee guida
di Google e possono causare una penalizzazione.

## Dati di partenza (fonti)

- Facebook *Non Solo Bici | Pozzallo*: servizi (vendita bici nuove/usate, vendita auto, accessori, riparazioni, noleggio bici e e-bike), indirizzo, cellulare 331 838 0840.
- Instagram *@non_solo_bici_pozzallo*: bio (vendita bici & auto, riparazioni, ricambi & accessori, noleggio), in evidenza Fat Bike / monopattini / usato / BMX-Freestyle.
- Directory pubbliche (BikeTourism.org): telefono fisso 0932 797162 e coordinate per la mappa.
