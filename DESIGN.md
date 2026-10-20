# Design — Non Solo Bici

Regole visive del sito. I valori stanno come variabili in cima a [`site/css/style.css`](site/css/style.css) (`:root`):
usare sempre le variabili, non colori o misure scritti a mano.

## Colori

| Variabile | Valore | Uso |
|---|---|---|
| `--red` | `#d7191f` | colore del marchio: bottoni principali, pillole "APR–OTT", icone su fondo chiaro, titoli grandi su fondo chiaro |
| `--red-text` | `#c01318` | **testo piccolo rosso su fondo chiaro** (etichette `.kicker`, link nelle FAQ): con `--red` non si arriva a 4,5:1 su `--paper-2` |
| `--red-hi` | `#ff4a4f` | rosso su fondo scuro (etichette, icone, anello di focus) |
| `--red-deep` | `#a80f14` | hover dei bottoni rossi, testo degli errori dei moduli |
| `--ink` / `--ink-2` / `--ink-3` | `#0e0e0f` / `#17171a` / `#242428` | fondi scuri: sezione, card, card in hover |
| `--footer` | `#070708` | fondo del footer |
| `--paper` / `--paper-2` | `#f5f2ec` / `#ebe6dc` | fondo della pagina / sezioni chiare alternate (`.section-alt`) |
| `--ink-soft` | `#3f3d38` | testo lungo su fondo chiaro (FAQ, privacy) |
| `--muted` | `#625f57` | testo secondario su fondo chiaro (≥ 4,5:1 anche su `--paper-2`) |
| `--muted-on-dark` | `#a9a59c` | testo secondario su fondo scuro |
| `--on-dark` / `--on-dark-hi` | `#d8d4cb` / `#e9e5db` | testo su fondo scuro: normale / più chiaro (chip, filtri, citazioni) |
| `--wa` / `--wa-deep` | `#178544` / `#126b37` | verde WhatsApp dei moduli e della barra azioni (testo bianco ≥ 4,5:1) / hover |
| `--star` | `#ffc233` | stelle delle recensioni |
| `--line` / `--line-dark` | nero 14% / bianco 14% | bordi decorativi su chiaro / su scuro |
| `--line-strong` | nero 46% | bordo dei campi dei moduli (≥ 3:1, si deve vedere dove scrivere) |

**Contrasto:** testo normale ≥ 4,5:1, testo grande (≥ 24 px, o ≥ 18,7 px in grassetto) e bordi/anelli ≥ 3:1.
L'anello di focus usa `--focus`: rosso chiaro sui fondi scuri, `--red` dentro `.section-alt`, `.card`, `.faq-box`, `.doc`.

**Alternanza delle sezioni:** hero (scura) → servizi e vendita (scura) → officina e noleggio (chiara) → chi siamo e recensioni (scura)
→ contatti (scura) → FAQ (chiara, piccola) → footer.

## Tipografia

- **Titoli** (`--display`): Bahnschrift / DIN Condensed / Roboto Condensed / Arial Narrow, maiuscolo, `font-variation-settings: "wdth" 78–85`.
  Sono font di sistema (nessun web font): su Android e iPhone si vede il primo disponibile della lista.
- **Testo** (`--body`): font di sistema, 17 px, interlinea 1.6. Righe lunghe al massimo ~65 caratteri (`max-width: 65ch`).
- **Scala:** `h1` hero 54–115 px · `h2` di sezione 37–66 px (32–39 px su telefono) · `.panel-title` (titolo di un blocco dentro una sezione) 32–48 px ·
  `h3` card 30 px · `h4` card piccole 22–30 px · etichetta `.kicker` 15 px maiuscolo spaziato, sempre rossa.
- **Gerarchia:** un solo `h1` (hero); `h2` per ogni sezione; `h3` per i blocchi e le card di primo livello; `h4` per le card dentro un blocco.

## Componenti

- **Bottoni** `.btn` (alti 52 px, `.btn-sm` 46 px, a pillola, maiuscolo condensato):
  `.btn-red` azione principale (Chiama) · `.btn-light` bianco su fondo scuro (WhatsApp, azioni secondarie) ·
  `.btn-whatsapp` verde, solo per inviare i moduli · `.btn-ghost` bordo bianco su fondo scuro · `.btn-block` a tutta larghezza.
  Su telefono il testo dei bottoni va a capo invece di uscire dallo schermo.
- **Card:** `.svc` (servizi), `.cat` (categorie: tutta la card è cliccabile), `.rent`, `.review`, `.stat`, `.card` (modulo bianco).
- **Pillola "APR–OTT"** `.apr-ott`: accanto a ogni "Noleggio"; testo per i lettori di schermo in `.sr-only` ("da aprile a ottobre").
- **Moduli:** etichetta sopra il campo, "(obbligatorio)"/"(facoltativo)" in `.opt`, suggerimenti `.field-hint`,
  errori `.field-error` (testo + bordo rosso e fondo rosato, diverso dal focus nero), riepilogo `.form-status` vicino al pulsante.
- **Raggi:** `--r-sm` 12 · `--r-md` 14 · `--radius` 16 · `--r-lg` 20 · `--r-xl` 28 · `--pill` 999.
- **Aree di tocco:** almeno 44 × 44 px per link e bottoni (anche link nel testo delle FAQ, con padding e margine negativo).
- **Movimento:** tutto rispetta `prefers-reduced-motion`; la striscia scorrevole si mette in pausa al tocco o col mouse sopra.

## Breakpoint

| Larghezza | Cosa cambia |
|---|---|
| ≤ 380 px | schede Riparazione/Noleggio senza icona |
| ≤ 400 px | etichetta dell'hero più piccola |
| ≤ 560 px | bottoni dell'hero a due colonne |
| ≤ 599 px | **telefono**: sezioni compatte, card a due colonne, bottoni che vanno a capo |
| ≥ 520 / 560 / 600 / 640 px | moduli a due colonne / card noleggio / categorie a 2 / foto a 3 |
| ≤ 759 px | barra azioni in basso, FAQ come foglio, footer in riga, niente pulsanti contatto nei Contatti |
| ≥ 760 px | telefono sempre in testata |
| ≤ 899 px | hero con la foto sopra il testo, recensioni a carosello |
| ≥ 860 / 900 / 940 / 960 / 980 px | servizi in riga / hero e "chi siamo" a due colonne, FAQ a due colonne / categorie a 3 / schede e contatti a due colonne / foto a 4 |
| ≤ 1039 px | menu a pannello (pulsante ☰) |
| ≥ 1040 px | menu in testata |

## Regole pratiche

- Nuovo colore o misura → prima una variabile in `:root`, poi l'uso.
- Ogni componente ha un solo blocco nel CSS, con le sue media query subito sotto (niente regole che si sovrascrivono a distanza).
- Niente `style="…"` nell'HTML, tranne le variabili per singolo elemento (`--d` ritardo animazione, `--pos` inquadratura foto, `--pct` stelle).
- Dopo ogni modifica a CSS/JS/foto aumentare `?v=` in `index.html` e `privacy.html`.
