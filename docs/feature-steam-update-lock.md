# Valutazione feature: Blocco auto-update Steam ("Update Lock")

**Data**: 2026-07-04 · **Stato**: valutazione — non implementata · **Ispirata a**: LPI-Hub ("Blocca")

## Verdetto

**Sì, ha senso.** Effort stimato ~1 giornata, valore alto, rischio basso. È il complemento naturale
di `game_update_tracker.rs`: oggi GameStringer *rileva* quando un update Steam ha rotto una
traduzione (confronto buildid); con questa feature lo *previene*. Nessuna injection, nessun tocco
al processo di gioco → pienamente compatibile con la policy anti-cheat di ARCHITETTURA.md.

## Come funziona tecnicamente (tecnica LPI-Hub / community)

Due leve combinate sul file `steamapps/appmanifest_<appid>.acf`:

1. **`AutoUpdateBehavior "1"`** — dice a Steam di aggiornare solo al lancio (invece di "sempre").
   Da solo non basta: al lancio via Steam l'update parte comunque.
2. **Attributo read-only sul file .acf** — Steam non riesce a riscrivere il manifest, quindi non
   può accodare/applicare l'aggiornamento. È questo il vero blocco (il "Blocca" di LPI-Hub).

Reversibile al 100%: togliere il read-only e ripristinare `AutoUpdateBehavior`.

## Cosa esiste già nel codebase (da riusare)

- `game_update_tracker.rs` — risoluzione del path del manifest da `game_path`
  (`parent().parent()` → `steamapps/appmanifest_<appid>.acf`), parsing ACF del buildid,
  storage in `%APPDATA%/GameStringer/update_tracking.json`.
- `games.rs` / `steam_enhanced.rs` / `library.rs` — parsing appmanifest e librerie multiple
  via `libraryfolders.vdf`.

## Design proposto

**Backend** — nuovo `src-tauri/src/commands/steam_update_lock.rs`:

- `get_update_lock_status(game_path, app_id) -> { locked, auto_update_behavior }`
- `set_update_lock(game_path, app_id, lock: bool) -> Result` — imposta/ripristina
  `AutoUpdateBehavior` + attributo read-only (`fs::set_permissions`). Salva lo stato
  in `update_tracking.json` (campo nuovo su `GameUpdateState`, es. `update_locked: bool`).

**Frontend**:

- Toggle "🔒 Proteggi la traduzione dagli update Steam" nella schermata di successo
  post-installazione patch e nella scheda gioco.
- Badge lucchetto nella Libreria per i giochi bloccati.
- Nel flusso di `game_update_tracker`: se update rilevato + patch rotta → dopo la
  re-installazione della traduzione proporre il blocco.

## Caveat da gestire (UX)

- **Va sbloccato prima di**: aggiornare volontariamente il gioco, verificare l'integrità dei
  file, disinstallare. Serve copy chiara + comando "Sblocca" a un click.
- Con manifest read-only Steam può mostrare il gioco in coda update "in attesa" — comportamento
  noto, innocuo, ma da spiegare nel tooltip.
- Multiplayer online: sconsigliare il blocco per giochi in cui il version-mismatch impedisce
  di connettersi (mostrare avviso se il gioco ha anti-cheat/online, info già disponibile dal
  choke-point anti-cheat).
- Steam in modalità offline o restart del client non rimuovono il read-only: il blocco persiste.

## Rischi

- **Bassi.** Nessuna modifica ai file di gioco, nessuna injection, niente VAC-relevant.
  Worst case: l'utente dimentica il blocco e non capisce perché il gioco non si aggiorna —
  mitigato dal badge in Libreria e da un check in `check_game_update` che segnala i lock attivi.

## Fonte ispirazione

- [LPI-Hub — Language Pack Italia](https://www.languagepack.it/notizie/language-pack-italia-hub/)
  (funzione "Blocca aggiornamenti", rilasciata 01/2025, v1.2.10 al 26/06/2026)
