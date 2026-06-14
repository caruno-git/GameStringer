# Triage — 103 test Rust falliti (notifications + profiles)

> Contesto: `cargo test` non è mai girato in CI finché non è stato aggiunto al job
> check-windows (2026-06-14). La run completa rivela **1025 passed, 103 failed**.
> I fallimenti sono **deterministici** (identici in seriale `--test-threads=1` e su
> runner CI pulito) e **preesistenti** — non causati dalle modifiche gate/OCR.
> Ripartizione: ~91 in `notifications::*`, ~12 in `profiles::*`.

## Sintesi per bucket

| # | Bucket | File | ~Test | Root cause | Confidenza | Effort |
|---|--------|------|:----:|------------|:---------:|:------:|
| A | try_unwrap con clone vivi | `notifications/integration_test.rs` | 5 | bug di logica nel test | **Alta (confermata)** | Basso |
| B | storage ops falliscono | `notifications/{manager,storage,cleanup,system_event,validation,profile_integration,profile_isolation,event_system}_tests.rs`, `tests.rs`, `cleanup.rs` | ~80 | **FK `profile_id`→`profiles(id)` con `foreign_keys=ON` e tabella `profiles` inesistente** | **Alta (confermata)** | Basso (1 fix) |
| C | auth/credenziali profili | `profiles/{integration_tests,tests,end_to_end_tests}.rs` | ~11 | API drift autenticazione | Media | Medio |
| D | testo messaggio validazione | `profiles/validation.rs` | 1 | stringa attesa cambiata | Alta | Triviale |

## Bucket A — `Arc::try_unwrap` con clone ancora vivi (5 test) — CONFERMATO

Tutti i 5 test di `integration_test.rs` falliscono nello stesso helper
`create_test_system()` (riga 29):

```rust
let manager_arc = Arc::new(Mutex::new(manager));
let integration = ProfileNotificationIntegration::new(Arc::clone(&manager_arc));
let event_handler = ProfileEventHandler::new(Arc::clone(&manager_arc), ...); // clone vivi
let manager = Arc::try_unwrap(manager_arc).unwrap_or_else(|_| panic!("Failed to unwrap manager_arc")).into_inner();
```

`try_unwrap` fallisce **sempre** perché `integration` e `event_handler` tengono
ancora dei clone dell'`Arc`. È un bug del test, non del prodotto.

**Fix**: riscrivere l'helper per restituire/usare gli `Arc` invece di provare a
estrarne il contenuto. Una sola modifica → 5 test verdi. Quick win.

## Bucket B — INSERT bloccati da FK verso `profiles` inesistente (~80 test) — CONFERMATO

`create_tables` (in `storage.rs`) crea **solo** `notifications` e
`notification_preferences`, entrambe con:

```sql
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
```

e `initialize()` esegue `PRAGMA foreign_keys = ON`. Ma **nessuna tabella `profiles`**
viene creata in questo DB (i profili sono file-based, in `ProfileStorage`). Quindi
ogni `INSERT` di notifica/preferenza viola il vincolo FK verso una tabella
inesistente → `Err`. `initialize()` passa (nessun insert); `save_notification` e
tutte le operazioni che scrivono falliscono, in modo deterministico, ovunque.
Confermato: `test_storage_initialization` (nessun insert) è verde, `test_save_and_load_notification` rosso al primo `save`.

**Esclusi** prima: parallelismo (fallisce seriale), isolamento (usano `tempdir`),
wiring connessione (corretto).

### Fix (una modifica → ~80 test)

Due opzioni:

- **(consigliata) Rimuovere le due clausole FK** (righe ~85 e ~104 di `storage.rs`).
  Allinea lo schema alla realtà: i profili NON vivono in questo SQLite, quindi la FK
  è architetturalmente errata. Sblocca tutti gli insert.
- *(alternativa)* creare anche la tabella `profiles` in `create_tables` e far seedare
  ai test helper una riga profilo prima di scrivere. Più invasiva e innaturale.

### ⚠️ Implicazione di produzione (da verificare)

Se l'app gira con `foreign_keys = ON` su un `notifications.db` fresco, **anche le
notifiche reali falliscono all'insert** per lo stesso motivo. Verificare se nell'app
le notifiche vengono effettivamente salvate/mostrate; se non lo sono, la rimozione
della FK è anche un bugfix di produzione, non solo dei test.

## Bucket C — auth/credenziali profili (~11 test) — API DRIFT

Errori concreti osservati:
- `Failed to re-authenticate … InvalidCredentials` (end_to_end)
- `File profilo corrotto: hash non corrispondente` (crud)
- `matches!(result, Err(ProfileError::Unauthorized))` non soddisfatto
- `!manager.is_profile_active()` falso dopo password errata

Coerente con l'evoluzione del sistema di autenticazione profili (cfr. regole di
progetto: `isAuthenticated = !!currentProfile`, niente `save_profile()` dentro
`authenticate_profile()`). I test precedono il refactor e usano flussi/hash non più
validi. **Fix per-test**, aggiornando le aspettative al nuovo flusso. Effort medio,
non un'unica patch.

## Bucket D — testo messaggio di validazione (1 test) — TRIVIALE

`profiles/validation.rs:399` si aspetta un errore contenente `"caratteri"`; il
messaggio è cambiato. Allineare la stringa attesa. Banale.

## Raccomandazione

1. **Adesso**: tenere i 103 fuori dal gate CI (già fatto: lo step `cargo test` è
   limitato a `anti_cheat` + `retro_preprocessor`). `main` torna verde.
2. **Quick win** (~1 ora): bucket A (helper unico, 5 test) + bucket D (1 test).
3. **Leva maggiore**: eseguire il diagnostico del bucket B. Se è una causa comune,
   ~80 test rientrano con poco. Decидere l'effort dopo aver visto l'errore.
4. **Lavoro reale**: bucket C, aggiornare ~11 test al nuovo flusso di auth.
5. Solo dopo aver portato la suite a verde, allargare il gate CI da
   `cargo test anti_cheat/retro_preprocessor` a `cargo test` completo.

Finché non bonificati, i test possono essere marcati `#[ignore = "tracking: <issue>"]`
così la suite locale è verde e il debito è esplicito.
