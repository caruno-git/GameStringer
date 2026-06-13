# Sintesi critica design — GameStringer (giugno 2026)

Revisione di 5 schermate (Dashboard, Libreria, Dettaglio gioco, Progetti, Community Hub) condotta da screenshot dell'app in esecuzione. I valori di contrasto sono stime (screenshot ridimensionato): vanno verificati con uno strumento (target WCAG AA = 4.5:1 per testo normale). La palette del progetto (violet/indigo = Core, blue/sky = Traduzione, emerald/teal = Patcher, orange/amber = Risorse) risulta rispettata; i problemi sono di *applicazione*, non di palette.

## Temi trasversali (i pattern che si ripetono)

1. **Gerarchia content-first** — Libreria e Dettaglio gioco la azzeccano (il contenuto comanda). La **Dashboard è l'eccezione da correggere**: il feed di news gaming domina lo spazio nobile mentre il lavoro dell'utente (cosa tradurre, dove ho lasciato) è marginale.

2. **Empty state da uniformare** — Progetti ha un empty state buono (illustrazione + messaggio + guida + CTA). La **Community Hub non ne ha**: l'area principale è un vuoto nero che sembra un bug. Serve lo stesso trattamento ovunque.

3. **Pattern "statistiche" da unificare** — la Libreria usa *chip inline*, Progetti e Community usano *KPI-card*. Un unico componente "stat" renderebbe l'app più coerente.

4. **Impalcatura inerte su pagine vuote** — KPI tutti a 0 e barre di ricerca/filtri restano attivi anche quando non c'è nulla da contare o filtrare (Progetti, Community). Vanno collassati/de-enfatizzati finché non esistono dati.

5. **Contrasto e leggibilità** — testi grigi tenui ricorrenti (timestamp, "Nessuna lingua rilevata", sottotitoli empty state, descrizioni news) rischiano sotto 4.5:1. Diverse icone (campanella, chat, persone, power) sono piccole e **senza etichetta** (aria-label/tooltip).

6. **Chiarezza del flusso "traduci"** — nel Dettaglio gioco la CTA brand "STRING IT!" è prominente (bene) ma ambigua per un nuovo utente, e la relazione con le azioni in fondo (Scansiona → Esporta/Importa .gspack) non è esplicita.

## Checklist priorità

Critici (🔴)
- [ ] Dashboard: ribaltare la colonna centrale sul lavoro dell'utente (progetti in corso / "riprendi" / gioco che aspetta l'italiano); news in un tab secondario.
- [ ] Community: dare un empty state reale all'area principale (illustrazione + messaggio + CTA), come in Progetti.
- [ ] Dettaglio gioco: esplicitare il flusso Scansiona → Traduci → Esporta; collegare la CTA hero alle azioni di fondo.

Importanti (🟡)
- [ ] Promuovere/valorizzare le azioni core sepolte in fondo al Dettaglio gioco (toolbar con etichette).
- [ ] Nascondere l'impalcatura inerte (KPI a 0 + filtri) su Progetti e Community finché non c'è contenuto.
- [ ] Ridurre i punti d'ingresso ridondanti (Progetti: Importa / Nuovo progetto / Inizia a tradurre → uno primario chiaro).
- [ ] Libreria: alleggerire i metadati per-card (provider monocromo, lingue collassate in "+N lingue" con bandiere all'hover; un solo significato per il check verde).
- [ ] Libreria: rendere visibile e azionabile lo stato "Nessuna lingua rilevata" (è il segnale di valore: gioco da tradurre).
- [ ] Unificare il componente "statistiche" (chip vs card) in tutta l'app.
- [ ] Etichettare le icone header (aria-label/tooltip) ovunque.

Minori (🟢)
- [ ] Rivedere "STRING IT!" / etichette in TUTTO MAIUSCOLO → sentence case + significato affiancato ("Traduci").
- [ ] Libreria: rendere il bottone Refresh più sobrio (è il controllo più vistoso, in arancio = Risorse).
- [ ] Ripassare i grigi tenui per il contrasto e alt text sulle copertine.

## Sintesi per schermata

| Schermata | Punto di forza | Problema principale |
|---|---|---|
| Dashboard | KPI a colpo d'occhio; nudge "DA TRADURRE" azionabile | News gaming dominano; lavoro dell'utente marginale |
| Libreria | Content-led, griglia pulita, controlli completi | Metadati per-card affollati; stato "da tradurre" poco visibile |
| Dettaglio gioco | Hero da store; CTA primaria prominente e on-brand | Flusso traduci poco chiaro; azioni core sepolte in fondo |
| Progetti (vuoto) | Empty state didattico (spiega da dove arrivano i progetti) | CTA ridondanti; impalcatura vuota (KPI a 0 + filtri) |
| Community (vuoto) | Header invitante; empty state "Amici" ben fatto | Area principale senza empty state → sembra rotta |

## Note di metodo
- Coerenze positive trasversali: header (icona + titolo + sottotitolo + azioni a destra) e colore CTA brand (viola Core) costanti su tutte le viste.
- Tema scuro pulito e moderno; spaziatura sidebar ordinata; sidebar coerente con la palette semantica.
- Prossimo passo consigliato: partire dai 3 critici (Dashboard, Community empty state, flusso Dettaglio gioco), poi il giro di coerenza (statistiche + empty state + impalcatura) che tocca più pagine in un colpo solo.
