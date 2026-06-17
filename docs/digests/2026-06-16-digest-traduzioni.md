# Digest Traduzioni Videogiochi — 16 giugno 2026

> Giornata tranquilla sul fronte traduzioni, MA c'è **una correzione documentale concreta**: **MelonLoader `v0.7.3` (14 mag 2026) è la stabile più recente** (verificato direttamente sulle GitHub Releases, marcata "Latest"). Il digest di ieri (15/06) aveva erroneamente dichiarato la v0.7.3 "inesistente" e considerato corretto il riferimento a v0.7.2 in `docs/TODO.md:26` — **non è così**. Va aggiornato il TODO. **Nessun drift di versione nel codice** (`unity_patcher.rs`): XUnity 5.6.1, BepInEx 5.4.23.5/6.0.0-pre.2, IPA 3.4.1, TMP Fonts v5.5.0 tutti allineati all'upstream. Nessuna nuova traduzione ITA confermata della settimana. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Una azione documentale, nessuna azione sul codice.**

1. 🟡 **DA CORREGGERE** — `docs/TODO.md:26` cita _"MelonLoader `v0.7.2` (3 mar 2026, ultima stabile)"_. **Falso da ieri**: la **v0.7.3 è uscita il 14 mag 2026** ed è la `Latest` su [GitHub Releases](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3). Curiosità: la stessa riga del TODO già cita `Il2CppInterop 1.5.1-ci.845`, che è **esattamente** la versione bundolata dalla v0.7.3 (la v0.7.2 aveva `1.5.1` liscia). Quindi il riferimento alla dipendenza è già giusto, è solo l'etichetta di versione a essere indietro. **Fix suggerito**: in `docs/TODO.md:26` sostituire `MelonLoader v0.7.2 (3 mar 2026, ultima stabile)` → `MelonLoader v0.7.3 (14 mag 2026, ultima stabile)`. Impatto nullo sul codice: MelonLoader resta non integrato (voce condizionale, parte solo con ≥3 segnalazioni utente). **Nota per i prossimi digest**: questo punto era stato sbagliato il 15/06 — la v0.7.3 esiste, non riproporlo come "inesistente".
2. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'upstream (vedi 🛠). Nessuna riga da toccare.

## 📡 Proposte fonti RSS

Niente di nuovo da proporre oggi. Situazione invariata rispetto al 15/06: le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false` e "da verificare in app". Il passo utile resta **testarle in-app (Gestisci feed) per CORS/formato**, non aggiungerne altre. `romhackplaza` (`romhackplaza.org/feed/`, riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 06 giu 2026 | The Legend of Heroes: Trails in the Sky 1st Chapter — ITA (v1.06, fuori beta) | Completa, ottimizzazione in corso | [GamesTranslator.it](https://www.gamestranslator.it/index.php) |
| 11 mag → agg. 2026 | Blue Prince — Director's Cut (ITA ~99.9%: testi, immagini, quadri, puzzle finale) | Completa / aggiornata | [NexusMods](https://www.nexusmods.com/blueprince/mods/18) |

Entrambe sono **carryover** già segnalati nei giorni scorsi, non novità di oggi. Nessuna nuova patch ITA confermata negli ultimi 7 giorni su GamesTranslator.it, NexusMods o RomHack Plaza. Vedi 📝 per una entry NES emersa nelle ricerche ma con data non verificata.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale aggiunta a un gioco negli ultimi 7 giorni. Le ricerche restituiscono materiale accademico sulla localizzazione e thread community su Steam (Endless Space 2, Baldur's Gate 3) sulla lingua italiana, non annunci ufficiali nuovi. Contesto invariato: per gli arrivi 2026 con doppiaggio/lingua ITA restano da spulciare manualmente le liste su [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge aggiornato 11 giu 2026) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO, etichetta da correggere → vedi 🔥) | 🟡 Riferimento doc indietro (v0.7.2) |
| TMP Font AssetBundles | v5.5.0 (2025-12-08, le release successive rimandano lì) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi (aggiornamento repo 11 giu). Restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici. Nota MelonLoader: la v0.7.3 porta supporto Unity 6000+ per `Il2CppAssetBundleManager`/`Il2CppImageConversionManager`, fix Linux/MacOS e .NET Portable — rilevante **solo** se/quando si deciderà di integrare MelonLoader come fallback IL2CPP.

## 📝 Cose non verificate / da controllare manualmente

- **Felix The Cat (Italian Translation) NES — DA VERIFICARE**: emersa nelle ricerche su [RomHack Plaza](https://romhackplaza.org/translations/felix-the-cat-italian-translation-nes/), non presente nell'elenco di ieri. **Data di pubblicazione non confermata** — RomHack Plaza non espone la data nei risultati di ricerca. Probabile traduzione retro NES (autore tipico dell'area ITA: GiAnMMV). Non inserita nella tabella settimanale finché la data non è confermata come ultimi 7 giorni. Comunque irrilevante per il patcher Unity/Unreal di GameStringer (è una ROM NES).
- **MelonLoader v0.7.3**: oltre alla correzione del TODO (🔥), vale la pena notare che se in futuro si integra MelonLoader, la v0.7.3 è la base giusta (Unity 6000+, Il2CppInterop `1.5.1-ci.845`, `AsmResolver 6.0.0-beta.5`). Nessuna azione finché non arrivano le ≥3 segnalazioni utente previste dal TODO.
- **LLM**: nessuna nuova release di API di traduzione direttamente applicabile all'injection nei giochi. XUnity supporta già LLM custom (Gemini/ChatGPT via prompt) e DeepL nelle versioni recenti (5.5.2+); nessuna feature nuova sfruttabile rispetto a ieri. Nessuna azione.
- **Trails in the Sky 1st Chapter**: la v1.06 (06/06) è fuori beta — confermare lo stato finale su GamesTranslator.it.
- I feed RSS candidati in `news-feeds.ts:115-119` restano da testare in-app (CORS/formato WordPress/Invision/MediaWiki).

## Fonti

- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3 (14 mag 2026, Latest)](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3) · [v0.7.2 (3 mar 2026)](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.2)
- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [GamesTranslator.it](https://www.gamestranslator.it/index.php) · [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18)
- [RomHack Plaza](https://romhackplaza.org/) · [Felix The Cat ITA (NES)](https://romhackplaza.org/translations/felix-the-cat-italian-translation-nes/)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
