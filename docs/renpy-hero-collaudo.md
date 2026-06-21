# ✅ Collaudo end-to-end — Hero Ren'Py

> Obiettivo: passare dal "i test su fixture sono verdi" al "funziona davvero su un gioco reale".
> Lega al task **Collaudo end-to-end su gioco reale** in [TODO.md](TODO.md).
> Lingua target del test: **italiano** (sorgente inglese → valuti la qualità a occhio).

---

## Gradino 1 — Smoke test: "The Question"

VN demo ufficiale inclusa nell'SDK di Ren'Py. Struttura `.rpy` canonica, zero sorprese.
Serve solo a provare l'idraulica della pipeline.

- [ ] Procurato "The Question" (SDK Ren'Py o download ufficiale)
- [ ] `detect_renpy_game` riconosce il gioco
- [ ] L'estrazione torna un **conteggio stringhe reale** (≠ 0)
- [ ] `generate_renpy_translation` crea una cartella `tl/italian/` con blocchi `translate` **popolati**
- [ ] In gioco: impostata lingua italiana → il testo appare tradotto

➡️ Se qualcosa si rompe qui, si rompe ovunque: fermarsi e fixare prima del Gradino 2.

---

## Gradino 2 — Test vero: Doki Doki Literature Club

Free (Steam/itch), contenuto reale, gioco-simbolo Ren'Py. È la demo-wow.

⚠️ **DDLC manipola i propri file a runtime di proposito** (giochetti meta).
Se vedi comportamenti strani, escludi PRIMA che sia il gioco a farlo apposta,
non dare la colpa alla pipeline.

### Backend
- [ ] `detect_renpy_game` riconosce DDLC
- [ ] Estrazione: conteggio stringhe plausibile per un gioco intero
- [ ] `tl/italian/` generata con i blocchi `translate` popolati
- [ ] Aggancio verificato: la traduzione passa da **auto-glossario + voci personaggio** (coerenza di tono), non riga-per-riga isolata

### In gioco — qui escono i bug che le fixture non vedono
- [ ] **Variabili interpolate** `[player_name]` preservate (NON tradotte per errore)
- [ ] **Tag testo** `{i}…{/i}`, `{w}`, `{nw}`, `{b}` intatti
- [ ] **Nomi personaggio** tradotti correttamente (o lasciati come da scelta)
- [ ] **Scelte di menu** tradotte
- [ ] **Accenti** (à è ì ò ù) renderizzati — se saltano è un problema di font
- [ ] Testo tradotto **sta nel box**, non straborda / non si sovrappone alla UI
- [ ] A capo / spezzature di riga ragionevoli

---

## 🐛 Bug trovati (delta fixture → reale)

| # | Dove | Cosa succede | Note |
|---|------|--------------|------|
|   |      |              |      |

---

## Esito

- [ ] Gradino 1 superato
- [ ] Gradino 2 superato
- [ ] Lista bug → aperti come item di lavoro per rendere l'hero impeccabile

> Definizione di "hero pronto": 4-5 giochi Ren'Py reali passano questo collaudo end-to-end senza intervento manuale.
