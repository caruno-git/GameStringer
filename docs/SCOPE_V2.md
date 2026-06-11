# GameStringer v2.0 — Scope della release

> **Decisione di prodotto (giugno 2026):** v2.0 non è "tutti gli strumenti finiti". È **UN flusso perfetto** più una sezione Labs per tutto il resto. Una release con un flusso impeccabile crea utenti; venti strumenti all'80% no.
>
> Stato: bozza da validare con Davide. Ultimo aggiornamento: 11 giugno 2026.

---

## 1. Obiettivo in una frase

> *Installi GameStringer, vedi la tua libreria Steam, apri un gioco Unity senza italiano, premi "Traduci", giochi in italiano.*

Se un cambiamento non serve a questa frase, non è in scope per v2.0.

## 2. Il Flusso Unico (user journey)

| # | Passo utente | Cosa fa l'app | Moduli owner |
|---|---|---|---|
| 1 | Avvia l'app, primo onboarding | Crea profilo locale, chiede (opzionale) le chiavi API | `profiles/`, onboarding |
| 2 | "Scansiona libreria" | Scan Steam locale, zero HTTP (`scan_all_steam_games_fast`), cover e metadati | `commands/steam*.rs`, `app/library` |
| 3 | Apre un gioco | Engine detection (Unity Mono/IL2CPP), lingua attuale, traducibilità | `engine_detector.rs`, `game-detail-client.tsx` |
| 4 | Preme **Traduci in italiano** | `startAutoTranslate()`: installa BepInEx + XUnity.AutoTranslator versioni pinnate, configura provider AI | `unity_patcher.rs`, chain AI |
| 5 | Gioca | Traduzione live in-game; pannello "Gestisci patch" per revert | XUnity runtime, patch manager |

**Regola:** ogni bug dentro questi 5 passi è bloccante per la release. Ogni bug fuori non lo è.

## 3. Superficie visibile in v2.0

- **Dashboard** (news feed, stato libreria, ultima attività)
- **Libreria** + dettaglio gioco con auto-translate
- **Impostazioni** (chiavi API, lingua UI, gestione profilo)
- **Profili** (login locale)
- **Gestisci patch** (stato BepInEx/XUnity per gioco, disinstallazione pulita)

Sidebar: solo le voci sopra. Tutto il resto sotto **Labs**.

## 4. Labs (congelato, non cancellato)

Toggle in Impostazioni → "Abilita Labs" (default **off**, con disclaimer "strumenti sperimentali, qualità variabile"). Dentro:

translator pro, ai-translator, batch-translation, voice/vision/ocr/manga/texture-translator, offline-translator, live-translate, emulator-translator, godot/rpgmaker/unity-csv/unity-ink-translator, injector, prediction-tool, dubbing, community-hub, marketplace, tm-network, e tutti i patcher non-Unity (Unreal, Bethesda, CRI, Danganronpa, Visionaire, …).

**Promozione da Labs al core** (post-v2.0): un tool esce da Labs quando (a) il suo flusso è completo end-to-end, (b) ha test, (c) qualcuno lo usa davvero (telemetria opt-in o feedback).

## 5. Definition of Done — v2.0

**Funzionale**
- [ ] Il Flusso Unico completa senza errori su **5 giochi Unity reali** (mix Mono/IL2CPP, almeno 1 da Game Pass)
- [ ] Onboarding da zero a "gioco in italiano" in **< 10 minuti** (utente non tecnico)
- [ ] Revert pulito: disinstallando la patch il gioco torna esattamente com'era

**Qualità**
- [ ] 3 gate CI verdi e bloccanti (tsc ✅ · ESLint ✅ · test — in corso oggi)
- [ ] Zero `BYPASS_AUTH_FOR_DEBUG`: bypass solo via env dev (`NEXT_PUBLIC_SKIP_AUTH`)
- [ ] Directory profili consolidata (oggi 3 path → 1 canonico + migrazione) — *unico punto dell'audit promosso a blocker: perde dati utente*

**Sicurezza (minimo per avere utenti)**
- [ ] Fix cifratura credenziali store (piano in `private/STORE_CREDENTIALS_FIX_PLAN.md` — lo schema attuale è derivabile)
- [ ] Niente segreti/dati personali nel repo (fatto l'11/06) e `npm audit` senza high

**Release engineering**
- [ ] Versione 2.0.0 + release notes IT/EN
- [ ] Installer Windows firmato su GitHub Releases
- [ ] gamestringer.ai aggiornato (screenshot del Flusso Unico, download, link guida)
- [ ] Guida utente: capitolo "Il tuo primo gioco tradotto" in IT/EN (le altre 10 lingue dopo)

## 6. Non-goals espliciti (post-v2.0)

Refactor dei god-file (boy-scout rule e basta) · consolidamento wrapper Tauri · CSP hardening completo · auth in secure-storage Rust · MelonLoader alternativo · Blue Prince plugin (dipende da GamesTranslator) · mobile/cloud sync · marketplace pubblico.

## 7. Rischi noti

| Rischio | Mitigazione |
|---|---|
| BepInEx 6 stabile esce e rompe i pin | Digest quotidiano già monitora; pin espliciti, bump consapevole |
| Giochi IL2CPP ostici (caso Blue Prince) | v2.0 dichiara supporto "Unity Mono pieno, IL2CPP best-effort" |
| Anti-cheat / giochi online | Blocklist esplicita: il bottone Traduci si disabilita con warning |
| Costi API utente | Default su chain economica + Ollama locale come opzione zero-costo |

## 8. Sequenza suggerita

1. **Gate test verde** (oggi) → 3/3
2. **Consolidamento profili** + bypass auth via env (1-2 giorni)
3. **Fix credenziali store** (piano già scritto, 1-2 giorni)
4. **Labs toggle + sidebar ridotta** (1 giorno)
5. **QA del Flusso Unico su 5 giochi** (2-3 giorni, serve Davide coi giochi veri)
6. **Release engineering** (1-2 giorni)

Totale stimato: **~2 settimane part-time** alla v2.0 pubblica.
