//! Importer per giochi RPG Maker MV/MZ che usano il plugin **Hendrix_Localization**.
//!
//! Hendrix_Localization è un sistema di localizzazione che sostituisce il testo a
//! runtime leggendo un file `game_messages.csv` posto nella root del gioco. Il CSV
//! ha colonne: `UniqueID,Context,Change,Excluded,Description,Name,Original,<lingue...>`
//! dove ogni lingua è una colonna identificata dal proprio *Symbol* (es. en, fr, it).
//!
//! Questo modulo NON patcha i `data/*.json` (sarebbe sia più rumoroso sia in conflitto
//! col plugin a runtime): aggiunge/riempie una colonna lingua nel CSV — esattamente il
//! meccanismo nativo del gioco. È non invasivo: il gioco carica la traduzione da solo.
//!
//! NOTE IMPORTANTI emerse dal reverse-engineering del plugin:
//!  - A runtime TUTTE le chiamate di lookup passano il solo testo (senza contesto),
//!    quindi le traduzioni vanno indicizzate per `Original` (testo), non per contesto.
//!    Di conseguenza l'importer lavora su `Original` UNICI.
//!  - Alcune build spediscono il plugin con `status:false` (disabilitato) e/o con un
//!    bug nel loader che indicizza per `Context+Original` mentre il lookup è per solo
//!    testo: `enable_hendrix_localization` riattiva il plugin, registra la lingua e
//!    corregge quel mismatch, sempre creando backup `.gsbak`.

use tauri::command;
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

const CSV_NAME: &str = "game_messages.csv";
const HENDRIX_PLUGIN: &str = "Hendrix_Localization.js";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HendrixGame {
    pub path: String,
    /// Percorso assoluto del game_messages.csv individuato (root o www/).
    pub csv_path: String,
    /// Percorso del plugin Hendrix_Localization.js (se presente).
    pub plugin_path: Option<String>,
    /// Percorso del plugins.js (se presente).
    pub plugins_js_path: Option<String>,
    /// true se il plugin risulta abilitato (status:true) in plugins.js.
    pub plugin_enabled: bool,
    /// Symbol delle lingue già presenti come colonna nel CSV (es. ["en","fr","sp","cn"]).
    pub languages: Vec<String>,
    /// Numero di stringhe `Original` uniche traducibili.
    pub unique_strings: u32,
}

/// Una stringa traducibile (per `Original` unico). `id` = indice progressivo.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HendrixString {
    pub id: String,
    pub original: String,
    pub translated: String,
    /// Contesto della prima occorrenza (solo informativo per la UI).
    pub context: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractionResult {
    pub success: bool,
    pub message: String,
    pub strings: Vec<HendrixString>,
    /// Numero di stringhe uniche estratte.
    pub total_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplyResult {
    pub success: bool,
    pub message: String,
    pub applied: u32,
    pub output_path: String,
    pub language_added: bool,
}

// ============================================================================
// PARSER / WRITER CSV (RFC 4180, gestione virgolette, "" di escape, newline nei
// campi, BOM). Niente dipendenze esterne: il progetto non include il crate `csv`.
// ============================================================================

/// Parsa l'intero contenuto CSV in righe di campi. Gestisce campi tra virgolette
/// con virgole/newline interni e `""` come virgoletta letterale. Rimuove il BOM.
fn parse_csv(content: &str) -> Vec<Vec<String>> {
    let bytes = content.strip_prefix('\u{feff}').unwrap_or(content);
    let mut rows: Vec<Vec<String>> = Vec::new();
    let mut field = String::new();
    let mut row: Vec<String> = Vec::new();
    let mut in_quotes = false;
    let mut chars = bytes.chars().peekable();

    while let Some(c) = chars.next() {
        if in_quotes {
            match c {
                '"' => {
                    if chars.peek() == Some(&'"') {
                        field.push('"');
                        chars.next();
                    } else {
                        in_quotes = false;
                    }
                }
                _ => field.push(c),
            }
        } else {
            match c {
                '"' => in_quotes = true,
                ',' => {
                    row.push(std::mem::take(&mut field));
                }
                '\r' => {
                    // gestisce \r\n e \r isolato come fine riga
                    if chars.peek() == Some(&'\n') {
                        chars.next();
                    }
                    row.push(std::mem::take(&mut field));
                    rows.push(std::mem::take(&mut row));
                }
                '\n' => {
                    row.push(std::mem::take(&mut field));
                    rows.push(std::mem::take(&mut row));
                }
                _ => field.push(c),
            }
        }
    }
    // ultima cella/riga se il file non termina con newline
    if !field.is_empty() || !row.is_empty() {
        row.push(field);
        rows.push(row);
    }
    rows
}

/// Serializza un campo, quotando solo se necessario (virgola, virgolette, newline).
fn write_field(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') || s.contains('\r') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

/// Serializza righe in CSV con BOM e terminatori `\r\n` (come l'export del plugin).
fn write_csv(rows: &[Vec<String>]) -> String {
    let mut out = String::from("\u{feff}");
    for row in rows {
        let line: Vec<String> = row.iter().map(|f| write_field(f)).collect();
        out.push_str(&line.join(","));
        out.push_str("\r\n");
    }
    out
}

fn is_marker(original: &str) -> bool {
    let t = original.trim();
    t.starts_with('-') && t.ends_with('-')
}

// ============================================================================
// LOCALIZZAZIONE FILE
// ============================================================================

fn find_csv(game_path: &Path) -> Option<PathBuf> {
    let root = game_path.join(CSV_NAME);
    if root.exists() {
        return Some(root);
    }
    let www = game_path.join("www").join(CSV_NAME);
    if www.exists() {
        return Some(www);
    }
    None
}

fn find_plugins_js(game_path: &Path) -> Option<PathBuf> {
    for p in [
        game_path.join("js").join("plugins.js"),
        game_path.join("www").join("js").join("plugins.js"),
    ] {
        if p.exists() {
            return Some(p);
        }
    }
    None
}

fn find_plugin(game_path: &Path) -> Option<PathBuf> {
    for p in [
        game_path.join("js").join("plugins").join(HENDRIX_PLUGIN),
        game_path.join("www").join("js").join("plugins").join(HENDRIX_PLUGIN),
    ] {
        if p.exists() {
            return Some(p);
        }
    }
    None
}

// ============================================================================
// DETECTION
// ============================================================================

/// Rileva se la cartella è un gioco con localizzazione Hendrix valida.
#[command]
pub fn detect_hendrix_game(game_path: String) -> Result<HendrixGame, String> {
    let root = Path::new(&game_path);
    let csv_path = find_csv(root).ok_or_else(|| format!("{} non trovato", CSV_NAME))?;

    let content = fs::read_to_string(&csv_path)
        .map_err(|e| format!("Impossibile leggere {}: {}", CSV_NAME, e))?;
    let rows = parse_csv(&content);
    let header = rows.first().ok_or("CSV vuoto")?;

    // Validazione formato Hendrix
    let has = |name: &str| header.iter().any(|h| h.trim() == name);
    if !(has("UniqueID") && has("Context") && has("Original")) {
        return Err("Formato CSV non riconosciuto come Hendrix_Localization".into());
    }

    let orig_idx = header.iter().position(|h| h.trim() == "Original").unwrap();

    // Le colonne lingua sono quelle dopo "Original".
    let languages: Vec<String> = header
        .iter()
        .skip(orig_idx + 1)
        .map(|h| h.trim().to_string())
        .filter(|h| !h.is_empty())
        .collect();

    // Conteggio Original unici e traducibili.
    let mut seen: HashSet<&str> = HashSet::new();
    for r in rows.iter().skip(1) {
        if let Some(o) = r.get(orig_idx) {
            let t = o.trim();
            if !t.is_empty() && !is_marker(o) {
                seen.insert(t);
            }
        }
    }

    let plugins_js = find_plugins_js(root);
    let plugin_enabled = plugins_js
        .as_ref()
        .and_then(|p| fs::read_to_string(p).ok())
        .map(|c| is_plugin_enabled(&c))
        .unwrap_or(false);

    Ok(HendrixGame {
        path: game_path.clone(),
        csv_path: csv_path.to_string_lossy().to_string(),
        plugin_path: find_plugin(root).map(|p| p.to_string_lossy().to_string()),
        plugins_js_path: plugins_js.map(|p| p.to_string_lossy().to_string()),
        plugin_enabled,
        languages,
        unique_strings: seen.len() as u32,
    })
}

/// Controllo statico riutilizzabile: è un gioco Hendrix? (API pubblica; la detection
/// dell'engine usa una propria versione locale in `engine_detector.rs`.)
#[allow(dead_code)]
pub fn is_hendrix_game(game_path: &Path) -> bool {
    let csv = match find_csv(game_path) {
        Some(p) => p,
        None => return false,
    };
    // Richiede sia il CSV (header corretto) sia il file del plugin.
    if find_plugin(game_path).is_none() {
        return false;
    }
    if let Ok(content) = fs::read_to_string(&csv) {
        if let Some(header) = parse_csv(&content).into_iter().next() {
            let has = |name: &str| header.iter().any(|h| h.trim() == name);
            return has("UniqueID") && has("Context") && has("Original");
        }
    }
    false
}

// ============================================================================
// ESTRAZIONE (Original unici)
// ============================================================================

/// Estrae le stringhe `Original` uniche e traducibili dal CSV.
#[command]
pub fn extract_hendrix_strings(game_path: String) -> Result<ExtractionResult, String> {
    let root = Path::new(&game_path);
    let csv_path = find_csv(root).ok_or_else(|| format!("{} non trovato", CSV_NAME))?;
    let content = fs::read_to_string(&csv_path)
        .map_err(|e| format!("Impossibile leggere {}: {}", CSV_NAME, e))?;
    let rows = parse_csv(&content);
    let header = rows.first().ok_or("CSV vuoto")?;
    let orig_idx = header
        .iter()
        .position(|h| h.trim() == "Original")
        .ok_or("Colonna Original mancante")?;
    let ctx_idx = header.iter().position(|h| h.trim() == "Context");

    let mut seen: HashSet<String> = HashSet::new();
    let mut strings: Vec<HendrixString> = Vec::new();
    let mut counter: u32 = 0;

    for r in rows.iter().skip(1) {
        let original = match r.get(orig_idx) {
            Some(o) => o.clone(),
            None => continue,
        };
        let trimmed = original.trim();
        if trimmed.is_empty() || is_marker(&original) {
            continue;
        }
        if seen.contains(&original) {
            continue;
        }
        seen.insert(original.clone());
        counter += 1;
        let context = ctx_idx
            .and_then(|i| r.get(i))
            .cloned()
            .unwrap_or_default();
        strings.push(HendrixString {
            id: counter.to_string(),
            original,
            translated: String::new(),
            context,
        });
    }

    let total = strings.len() as u32;
    Ok(ExtractionResult {
        success: true,
        message: format!("Estratte {} stringhe uniche", total),
        strings,
        total_count: total,
    })
}

// ============================================================================
// APPLICAZIONE (scrive la colonna lingua)
// ============================================================================

/// Applica le traduzioni scrivendo (o creando) la colonna `target_language` nel CSV.
/// `translations` è una mappa `Original -> tradotto`. Le righe il cui Original non è
/// presente nella mappa restano con la cella lingua vuota (il plugin ripiega
/// automaticamente sull'originale). Scrive in `output_path` (può coincidere col CSV
/// di origine: in tal caso viene prima creato un backup `.gsbak`).
#[command]
pub fn apply_hendrix_translations(
    csv_path: String,
    translations: HashMap<String, String>,
    target_language: String,
    output_path: String,
) -> Result<ApplyResult, String> {
    let src = Path::new(&csv_path);
    let content = fs::read_to_string(src)
        .map_err(|e| format!("Impossibile leggere il CSV: {}", e))?;
    let mut rows = parse_csv(&content);
    if rows.is_empty() {
        return Err("CSV vuoto".into());
    }

    let lang = target_language.trim().to_string();
    if lang.is_empty() {
        return Err("Lingua di destinazione vuota".into());
    }

    // Header: trova indici e (se serve) aggiunge la colonna lingua.
    // Calcolo gli indici in uno scope chiuso così il prestito immutabile dell'header
    // termina prima delle mutazioni su `rows` (evita conflitti col borrow checker).
    let (orig_idx, ncols, existing_lang_idx) = {
        let header = &rows[0];
        let orig_idx = header
            .iter()
            .position(|h| h.trim() == "Original")
            .ok_or("Colonna Original mancante")?;
        (orig_idx, header.len(), header.iter().position(|h| h.trim() == lang))
    };

    let mut language_added = false;
    let lang_idx = match existing_lang_idx {
        Some(i) => i,
        None => {
            // aggiungi nuova colonna in coda a tutte le righe
            language_added = true;
            for r in rows.iter_mut() {
                while r.len() < ncols {
                    r.push(String::new());
                }
                r.push(String::new());
            }
            rows[0][ncols] = lang.clone();
            ncols
        }
    };

    // Applica le traduzioni per le righe dati.
    let mut applied = 0u32;
    for r in rows.iter_mut().skip(1) {
        // normalizza la lunghezza riga
        while r.len() <= lang_idx {
            r.push(String::new());
        }
        let original = match r.get(orig_idx) {
            Some(o) => o.clone(),
            None => continue,
        };
        if let Some(tr) = translations.get(&original) {
            if !tr.is_empty() {
                r[lang_idx] = tr.clone();
                applied += 1;
            }
        }
    }

    // Backup se sovrascriviamo il file di origine.
    if Path::new(&output_path) == src {
        let bak = format!("{}.gsbak", csv_path);
        if !Path::new(&bak).exists() {
            let _ = fs::copy(src, &bak);
        }
    }

    fs::write(&output_path, write_csv(&rows))
        .map_err(|e| format!("Impossibile scrivere il CSV: {}", e))?;

    Ok(ApplyResult {
        success: true,
        message: format!("Applicate {} traduzioni ({})", applied, lang),
        applied,
        output_path,
        language_added,
    })
}

// ============================================================================
// SALVATAGGIO / CARICAMENTO (parità con gli altri patcher)
// ============================================================================

#[command]
pub fn save_hendrix_translations(
    output_path: String,
    strings: Vec<HendrixString>,
) -> Result<u32, String> {
    let json = serde_json::to_string_pretty(&strings)
        .map_err(|e| format!("Errore serializzazione: {}", e))?;
    fs::write(&output_path, json)
        .map_err(|e| format!("Errore scrittura: {}", e))?;
    Ok(strings.len() as u32)
}

#[command]
pub fn load_hendrix_translations(input_path: String) -> Result<Vec<HendrixString>, String> {
    let content = fs::read_to_string(&input_path)
        .map_err(|e| format!("Errore lettura: {}", e))?;
    serde_json::from_str(&content).map_err(|e| format!("Errore parsing: {}", e))
}

// ============================================================================
// ABILITAZIONE LINGUA + FIX PLUGIN
// ============================================================================

/// Verifica se il plugin Hendrix_Localization risulta abilitato in plugins.js.
fn is_plugin_enabled(plugins_js: &str) -> bool {
    if let Some(arr) = parse_plugins_array(plugins_js) {
        if let Some(p) = arr
            .as_array()
            .and_then(|a| a.iter().find(|p| p.get("name").and_then(|n| n.as_str()) == Some("Hendrix_Localization")))
        {
            return p.get("status").and_then(|s| s.as_bool()).unwrap_or(false);
        }
    }
    false
}

/// Estrae l'array JSON `$plugins` da plugins.js (`var $plugins = [ ... ];`).
fn parse_plugins_array(text: &str) -> Option<serde_json::Value> {
    let start = text.find('[')?;
    let end = text.rfind(']')?;
    if end <= start {
        return None;
    }
    serde_json::from_str::<serde_json::Value>(&text[start..=end]).ok()
}

/// Predispone il gioco per la nuova lingua:
///  1. plugins.js: abilita Hendrix_Localization (status:true), aggiunge la lingua
///     alla lista `Languages` (se mancante) e imposta `Default Language`.
///  2. Hendrix_Localization.js: corregge il bug di indicizzazione (chiave
///     `Context+Original` -> solo `Original`) per allinearla al lookup runtime.
/// Crea backup `.gsbak` di entrambi i file prima di modificarli.
#[command]
pub fn enable_hendrix_localization(
    game_path: String,
    symbol: String,
    name: String,
    set_default: bool,
) -> Result<String, String> {
    let root = Path::new(&game_path);
    let mut report: Vec<String> = Vec::new();

    // --- plugins.js ---
    let plugins_js = find_plugins_js(root).ok_or("plugins.js non trovato")?;
    let raw = fs::read_to_string(&plugins_js)
        .map_err(|e| format!("Lettura plugins.js: {}", e))?;
    let prefix_end = raw.find('[').ok_or("plugins.js: array non trovato")?;
    let suffix_start = raw.rfind(']').ok_or("plugins.js: array non chiuso")?;
    let mut arr: serde_json::Value =
        serde_json::from_str(&raw[prefix_end..=suffix_start]).map_err(|e| format!("plugins.js JSON: {}", e))?;

    let plugins = arr.as_array_mut().ok_or("plugins.js: non è un array")?;
    let hendrix = plugins
        .iter_mut()
        .find(|p| p.get("name").and_then(|n| n.as_str()) == Some("Hendrix_Localization"))
        .ok_or("Plugin Hendrix_Localization assente in plugins.js")?;

    // 1a. abilita
    hendrix["status"] = serde_json::Value::Bool(true);
    report.push("plugin abilitato".into());

    // 1b. aggiungi lingua a Languages se mancante
    if let Some(params) = hendrix.get_mut("parameters").and_then(|p| p.as_object_mut()) {
        if let Some(langs_str) = params.get("Languages").and_then(|v| v.as_str()) {
            let mut langs: Vec<String> =
                serde_json::from_str(langs_str).unwrap_or_default();
            let already = langs.iter().any(|l| {
                serde_json::from_str::<serde_json::Value>(l)
                    .ok()
                    .and_then(|v| v.get("Symbol").and_then(|s| s.as_str()).map(|s| s.to_string()))
                    .as_deref()
                    == Some(symbol.as_str())
            });
            if !already {
                let entry = serde_json::json!({
                    "Name": name,
                    "Symbol": symbol,
                    "Font": "",
                    "FontSize": "22"
                });
                langs.push(entry.to_string());
                params.insert(
                    "Languages".to_string(),
                    serde_json::Value::String(serde_json::to_string(&langs).unwrap()),
                );
                report.push(format!("lingua '{}' aggiunta", symbol));
            } else {
                report.push(format!("lingua '{}' già presente", symbol));
            }
        }
        // 1c. default language
        if set_default {
            params.insert(
                "Default Language".to_string(),
                serde_json::Value::String(symbol.clone()),
            );
            report.push("Default Language impostata".into());
        }
    }

    // backup + scrittura plugins.js
    let pj_bak = format!("{}.gsbak", plugins_js.to_string_lossy());
    if !Path::new(&pj_bak).exists() {
        let _ = fs::copy(&plugins_js, &pj_bak);
    }
    let new_plugins = format!(
        "{}{};{}",
        &raw[..prefix_end],
        serde_json::to_string_pretty(&arr).map_err(|e| e.to_string())?,
        // preserva eventuale coda dopo il ';'
        raw.get(suffix_start + 1..)
            .map(|s| s.trim_start().trim_start_matches(';').to_string())
            .unwrap_or_default()
    );
    fs::write(&plugins_js, new_plugins)
        .map_err(|e| format!("Scrittura plugins.js: {}", e))?;

    // --- Hendrix_Localization.js: fix bug context-key ---
    if let Some(plugin) = find_plugin(root) {
        let js = fs::read_to_string(&plugin).map_err(|e| format!("Lettura plugin: {}", e))?;
        let buggy = "columns[contextIndex]+columns[originalIndex]";
        let fixed = "columns[originalIndex]";
        if js.contains(buggy) {
            let p_bak = format!("{}.gsbak", plugin.to_string_lossy());
            if !Path::new(&p_bak).exists() {
                let _ = fs::copy(&plugin, &p_bak);
            }
            fs::write(&plugin, js.replace(buggy, fixed))
                .map_err(|e| format!("Scrittura plugin: {}", e))?;
            report.push("bug context-key corretto".into());
        } else {
            report.push("nessun fix necessario al plugin".into());
        }
    }

    Ok(report.join("; "))
}
