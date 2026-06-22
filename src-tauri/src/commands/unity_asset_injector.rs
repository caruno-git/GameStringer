//! Unity Asset Injection via resize — calls Python unity_inject.py
//! Supports Ink JSON blob injection (sharedassets) + LP-string injection (level files)
//! Fully automated: accepts translations from frontend memory, writes temp CSVs, injects.

use tauri::command;
use serde::{Serialize, Deserialize};
use super::process_util::no_window_command;
use std::path::{Path, PathBuf};
use std::io::Write;

#[derive(Clone, Serialize, Deserialize)]
pub struct AssetInjectionResult {
    pub success: bool,
    pub ink_replaced: u32,
    pub ink_files: u32,
    pub level_replaced: u32,
    pub level_files: u32,
    pub errors: Vec<String>,
    pub output: String,
}

/// A single translation entry from the frontend
#[derive(Clone, Serialize, Deserialize)]
pub struct TranslationEntry {
    pub id: String,
    pub english: String,
    pub translated: String,
    pub table: Option<String>,
}

/// Inject translations into Unity asset files using resize injection.
/// Accepts translations directly from frontend state — no manual file selection needed.
/// 
/// Parameters:
/// - game_dir: Path to game _Data directory
/// - translations: Vec of translation entries from frontend (auto-exported to temp CSVs)
/// - csv_dir: Optional override — use pre-existing CSV directory instead of translations
/// - ink_csv: Optional path to Ink translations CSV
/// - ink_translations: Optional vec of Ink translation entries (auto-exported to temp CSV)
/// - mode: "all" | "ink" | "levels"
#[command]
pub async fn inject_unity_assets(
    game_dir: String,
    translations: Option<Vec<TranslationEntry>>,
    csv_dir: Option<String>,
    ink_csv: Option<String>,
    ink_translations: Option<Vec<TranslationEntry>>,
    mode: Option<String>,
) -> Result<AssetInjectionResult, String> {
    log::info!("🎯 Unity Asset Injection: game_dir={}, mode={:?}", game_dir, mode);
    
    let script_path = find_inject_script()
        .ok_or_else(|| "unity_inject.py non trovato".to_string())?;
    let python = find_python()
        .ok_or_else(|| "Python non trovato. Installa Python 3.x".to_string())?;
    
    // Auto-export translations to temp directory if provided
    let temp_dir = std::env::temp_dir().join("gamestringer_inject");
    let _ = std::fs::create_dir_all(&temp_dir);
    
    // Determine CSV dir: use provided translations or fallback to csv_dir
    let effective_csv_dir = if let Some(ref entries) = translations {
        if !entries.is_empty() {
            let csv_path = export_translations_to_csv(&temp_dir, entries)?;
            log::info!("📁 Auto-exported {} translations to {:?}", entries.len(), csv_path);
            Some(csv_path)
        } else {
            csv_dir.clone()
        }
    } else {
        csv_dir.clone()
    };
    
    // Determine Ink CSV: use provided ink_translations or fallback to ink_csv
    let effective_ink_csv = if let Some(ref entries) = ink_translations {
        if !entries.is_empty() {
            let ink_path = export_ink_to_csv(&temp_dir, entries)?;
            log::info!("📁 Auto-exported {} Ink translations to {:?}", entries.len(), ink_path);
            Some(ink_path)
        } else {
            ink_csv.clone()
        }
    } else {
        ink_csv.clone()
    };
    
    // Build command
    let mut cmd = no_window_command(&python);
    cmd.arg(&script_path);
    cmd.arg("--game-dir").arg(&game_dir);
    
    if let Some(ref csv) = effective_csv_dir {
        cmd.arg("--csv-dir").arg(csv);
    }
    if let Some(ref ink) = effective_ink_csv {
        cmd.arg("--ink-csv").arg(ink);
    }
    if let Some(ref m) = mode {
        cmd.arg("--mode").arg(m);
    }
    
    log::info!("🐍 Running: {} {}", python, script_path.display());
    
    let output = cmd.output()
        .map_err(|e| format!("Errore esecuzione Python: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    if !stderr.is_empty() {
        log::warn!("Python stderr: {}", stderr);
    }
    
    let mut result = AssetInjectionResult {
        success: false, ink_replaced: 0, ink_files: 0,
        level_replaced: 0, level_files: 0,
        errors: Vec::new(), output: stdout.clone(),
    };
    
    for line in stdout.lines().rev() {
        if line.contains("\"type\":\"result\"") || line.contains("\"type\": \"result\"") {
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(line) {
                result.success = parsed.get("success").and_then(|v| v.as_bool()).unwrap_or(false);
                result.ink_replaced = parsed.get("ink_replaced").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
                result.ink_files = parsed.get("ink_files").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
                result.level_replaced = parsed.get("level_replaced").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
                result.level_files = parsed.get("level_files").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
                if let Some(errs) = parsed.get("errors").and_then(|v| v.as_array()) {
                    result.errors = errs.iter()
                        .filter_map(|e| e.as_str().map(|s| s.to_string()))
                        .collect();
                }
            }
            break;
        }
    }
    
    if !stderr.is_empty() && !result.success {
        result.errors.push(format!("Python error: {}", stderr.lines().last().unwrap_or(&stderr)));
    }
    
    // Cleanup temp files
    let _ = std::fs::remove_dir_all(&temp_dir);
    
    log::info!("✅ Injection result: ink={} level={} success={}", 
        result.ink_replaced, result.level_replaced, result.success);
    
    Ok(result)
}

/// Export translation entries to CSV files in the given directory.
/// Groups by table name and writes one CSV per table.
fn export_translations_to_csv(dir: &Path, entries: &[TranslationEntry]) -> Result<String, String> {
    // Group entries by table
    let mut tables: std::collections::HashMap<String, Vec<&TranslationEntry>> = std::collections::HashMap::new();
    for e in entries {
        let table = e.table.clone().unwrap_or_else(|| "translations".to_string());
        tables.entry(table).or_default().push(e);
    }
    
    for (name, items) in &tables {
        let csv_path = dir.join(format!("{}.csv", name));
        let mut file = std::fs::File::create(&csv_path)
            .map_err(|e| format!("Errore creazione CSV {}: {}", name, e))?;
        
        writeln!(file, "ID,ENGLISH,ITALIAN")
            .map_err(|e| format!("Errore scrittura CSV: {}", e))?;
        
        for entry in items {
            if entry.english.is_empty() || entry.translated.is_empty() { continue; }
            // CSV escape: quote fields containing commas or quotes
            let eng = csv_escape(&entry.english);
            let ita = csv_escape(&entry.translated);
            writeln!(file, "{},{},{}", entry.id, eng, ita)
                .map_err(|e| format!("Errore scrittura CSV: {}", e))?;
        }
    }
    
    Ok(dir.to_string_lossy().to_string())
}

/// Export Ink translation entries to a single CSV file.
fn export_ink_to_csv(dir: &Path, entries: &[TranslationEntry]) -> Result<String, String> {
    let csv_path = dir.join("ink_translations.csv");
    let mut file = std::fs::File::create(&csv_path)
        .map_err(|e| format!("Errore creazione Ink CSV: {}", e))?;
    
    writeln!(file, "ENGLISH,ITALIAN")
        .map_err(|e| format!("Errore scrittura Ink CSV: {}", e))?;
    
    for entry in entries {
        if entry.english.is_empty() || entry.translated.is_empty() { continue; }
        let eng = csv_escape(&entry.english);
        let ita = csv_escape(&entry.translated);
        writeln!(file, "{},{}", eng, ita)
            .map_err(|e| format!("Errore scrittura Ink CSV: {}", e))?;
    }
    
    Ok(csv_path.to_string_lossy().to_string())
}

fn csv_escape(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

/// Restore original asset files from backups
#[command]
pub async fn restore_unity_assets(game_dir: String) -> Result<String, String> {
    log::info!("🔄 Restoring backups in: {}", game_dir);
    let mut restored = 0u32;
    
    let entries = std::fs::read_dir(&game_dir)
        .map_err(|e| format!("Errore lettura directory: {}", e))?;
    
    for entry in entries.flatten() {
        let path = entry.path();
        if let Some(ext) = path.extension() {
            if ext == "backup" {
                let original = path.with_extension("");
                if let Err(e) = std::fs::copy(&path, &original) {
                    log::warn!("Errore ripristino {:?}: {}", original, e);
                } else {
                    restored += 1;
                }
            }
        }
    }
    
    Ok(format!("{} file ripristinati", restored))
}

/// Result of Ink string scanning
#[derive(Clone, Serialize, Deserialize)]
pub struct InkScanResult {
    pub strings: Vec<InkString>,
    pub total: u32,
    pub files_scanned: u32,
    pub files_with_ink: u32,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct InkString {
    pub text: String,
    pub source_file: String,
}

/// Scan Unity sharedassets files for Ink JSON blobs and extract all text strings.
/// Ink text is stored as "^text content" patterns inside JSON blobs marked with "inkVersion".
#[command]
pub async fn scan_unity_ink_strings(game_dir: String) -> Result<InkScanResult, String> {
    log::info!("🔍 Scanning Ink strings in: {}", game_dir);
    
    let dir = std::path::Path::new(&game_dir);
    if !dir.exists() {
        return Err(format!("Directory non trovata: {}", game_dir));
    }
    
    let mut all_strings: Vec<InkString> = Vec::new();
    let mut files_scanned = 0u32;
    let mut files_with_ink = 0u32;
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    
    let entries = std::fs::read_dir(dir)
        .map_err(|e| format!("Errore lettura directory: {}", e))?;
    
    for entry in entries.flatten() {
        let path = entry.path();
        let fname = path.file_name().unwrap_or_default().to_string_lossy().to_string();
        
        // Only scan sharedassets files and level files
        if !fname.starts_with("sharedassets") && !fname.starts_with("level") {
            continue;
        }
        if fname.ends_with(".resS") || fname.ends_with(".resource") || fname.ends_with(".backup") {
            continue;
        }
        
        let data = match std::fs::read(&path) {
            Ok(d) => d,
            Err(_) => continue,
        };
        files_scanned += 1;
        
        // Check if file contains Ink blobs
        if !contains_bytes(&data, b"inkVersion") {
            continue;
        }
        
        files_with_ink += 1;
        
        // Extract all "^text" patterns
        let strings = extract_caret_strings(&data);
        for s in strings {
            if s.len() >= 2 && !seen.contains(&s) {
                seen.insert(s.clone());
                all_strings.push(InkString {
                    text: s,
                    source_file: fname.clone(),
                });
            }
        }
    }
    
    let total = all_strings.len() as u32;
    log::info!("✅ Found {} Ink strings in {} files ({} scanned)", total, files_with_ink, files_scanned);
    
    Ok(InkScanResult {
        strings: all_strings,
        total,
        files_scanned,
        files_with_ink,
    })
}

/// Check if data contains a byte sequence
fn contains_bytes(data: &[u8], needle: &[u8]) -> bool {
    data.windows(needle.len()).any(|w| w == needle)
}

/// Extract all "^text" patterns from binary data (Ink JSON format)
fn extract_caret_strings(data: &[u8]) -> Vec<String> {
    let mut results = Vec::new();
    let pattern = b"\"^";
    let mut pos = 0;
    
    while pos < data.len().saturating_sub(3) {
        // Find next "^ pattern
        let found = data[pos..].windows(2).position(|w| w == pattern);
        let idx = match found {
            Some(i) => pos + i,
            None => break,
        };
        
        let text_start = idx + 2; // after "^
        let mut p = text_start;
        
        // Find closing quote, handling escapes
        while p < data.len() {
            if data[p] == b'\\' {
                p += 2; // skip escaped char
                continue;
            }
            if data[p] == b'"' {
                break;
            }
            p += 1;
        }
        
        if p < data.len() && p > text_start {
            if let Ok(text) = std::str::from_utf8(&data[text_start..p]) {
                let text = text.trim();
                // Filter: must have content, not just whitespace/newlines/tags
                if text.len() >= 2 
                    && !text.chars().all(|c| c.is_whitespace() || c == '\\' || c == 'n')
                    && !text.starts_with("ev ")
                    && !text.starts_with("G>")
                    && !text.starts_with("G<")
                    && !text.starts_with("nop")
                    && !text.starts_with("#")
                {
                    // Unescape for display
                    let display = text.replace("\\n", "\n").replace("\\t", "\t");
                    results.push(display);
                }
            }
        }
        
        pos = if p < data.len() { p + 1 } else { data.len() };
    }
    
    results
}

fn find_inject_script() -> Option<PathBuf> {
    // Try relative to executable
    let exe_dir = std::env::current_exe().ok()?.parent()?.to_path_buf();
    
    // Development: look in project tools/
    let candidates = [
        exe_dir.join("tools").join("unity_inject.py"),
        exe_dir.join("..").join("tools").join("unity_inject.py"),
        exe_dir.join("..").join("..").join("tools").join("unity_inject.py"),
        exe_dir.join("..").join("..").join("..").join("tools").join("unity_inject.py"),
        // Absolute fallback for development
        PathBuf::from(r"C:\dev\GameStringer\tools\unity_inject.py"),
    ];
    
    candidates.into_iter().find(|p| p.exists())
}

fn find_python() -> Option<String> {
    // Try common Python executable names
    for name in &["python", "python3", "py"] {
        if let Ok(output) = no_window_command(name).arg("--version").output() {
            if output.status.success() {
                return Some(name.to_string());
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn entry(id: &str, en: &str, it: &str, table: Option<&str>) -> TranslationEntry {
        TranslationEntry {
            id: id.into(),
            english: en.into(),
            translated: it.into(),
            table: table.map(|s| s.to_string()),
        }
    }

    // ── csv_escape ──────────────────────────────────────────────────────
    #[test]
    fn csv_escape_quotes_when_needed() {
        assert_eq!(csv_escape("plain"), "plain");
        assert_eq!(csv_escape("with, comma"), "\"with, comma\"");
        assert_eq!(csv_escape("say \"hi\""), "\"say \"\"hi\"\"\"");
        assert_eq!(csv_escape("line\nbreak"), "\"line\nbreak\"");
    }

    // ── export_translations_to_csv ──────────────────────────────────────
    #[test]
    fn export_translations_groups_and_skips_empty() {
        let tmp = TempDir::new().unwrap();
        let entries = vec![
            entry("k1", "Hello", "Ciao", Some("ui")),
            entry("k2", "With, comma", "Con, virgola", Some("ui")),
            entry("k3", "", "x", Some("ui")), // english vuoto → saltato
            entry("k4", "Bye", "", Some("ui")), // translated vuoto → saltato
        ];
        export_translations_to_csv(tmp.path(), &entries).unwrap();
        let content = fs::read_to_string(tmp.path().join("ui.csv")).unwrap();
        assert!(content.starts_with("ID,ENGLISH,ITALIAN"));
        assert!(content.contains("k1,Hello,Ciao"));
        assert!(content.contains("\"With, comma\"")); // campo con virgola quotato
        assert!(!content.contains("k3"));
        assert!(!content.contains("k4"));
    }

    #[test]
    fn export_translations_default_table_name() {
        let tmp = TempDir::new().unwrap();
        export_translations_to_csv(tmp.path(), &[entry("k", "A", "B", None)]).unwrap();
        assert!(tmp.path().join("translations.csv").exists());
    }

    #[test]
    fn export_ink_writes_two_column_csv() {
        let tmp = TempDir::new().unwrap();
        let path = export_ink_to_csv(tmp.path(), &[entry("", "Hello", "Ciao", None)]).unwrap();
        let content = fs::read_to_string(&path).unwrap();
        assert!(content.starts_with("ENGLISH,ITALIAN"));
        assert!(content.contains("Hello,Ciao"));
    }

    // ── contains_bytes / extract_caret_strings ──────────────────────────
    #[test]
    fn contains_bytes_finds_needle() {
        assert!(contains_bytes(b"xxinkVersionyy", b"inkVersion"));
        assert!(!contains_bytes(b"nothing here", b"inkVersion"));
    }

    #[test]
    fn extract_caret_strings_basic_and_filters() {
        let data = b"junk \"^Hello world\" mid \"^ev skip me\" tail \"^Real line\" end";
        let strings = extract_caret_strings(data);
        assert!(strings.contains(&"Hello world".to_string()));
        assert!(strings.contains(&"Real line".to_string()));
        assert!(!strings.iter().any(|s| s.starts_with("ev "))); // "^ev ..." filtrato
    }

    #[test]
    fn extract_caret_strings_unescapes_newline() {
        let data = b"\"^A\\nB\"";
        let strings = extract_caret_strings(data);
        assert!(strings.iter().any(|s| s == "A\nB"));
    }

    // ── restore_unity_assets ────────────────────────────────────────────
    #[tokio::test]
    async fn restore_copies_backups() {
        let tmp = TempDir::new().unwrap();
        fs::write(tmp.path().join("resources.assets.backup"), b"original data").unwrap();
        let msg = restore_unity_assets(tmp.path().to_string_lossy().to_string()).await.unwrap();
        assert!(msg.contains("1 file"));
        let restored = fs::read(tmp.path().join("resources.assets")).unwrap();
        assert_eq!(restored, b"original data");
    }

    // ── scan_unity_ink_strings ──────────────────────────────────────────
    #[tokio::test]
    async fn scan_ink_finds_strings_in_sharedassets() {
        let tmp = TempDir::new().unwrap();
        let mut data = Vec::new();
        data.extend_from_slice(b"blob with inkVersion marker ");
        data.extend_from_slice(b"\"^Buongiorno avventuriero\" ");
        data.extend_from_slice(b"\"^Premi invio\"");
        fs::write(tmp.path().join("sharedassets0.assets"), &data).unwrap();
        // File senza marker Ink → ignorato dal conteggio files_with_ink.
        fs::write(tmp.path().join("sharedassets1.assets"), b"no ink here").unwrap();

        let res = scan_unity_ink_strings(tmp.path().to_string_lossy().to_string()).await.unwrap();
        assert_eq!(res.files_with_ink, 1);
        assert!(res.total >= 2);
        assert!(res.strings.iter().any(|s| s.text == "Buongiorno avventuriero"));
    }

    #[tokio::test]
    async fn scan_ink_errors_on_missing_dir() {
        assert!(scan_unity_ink_strings("/nope/missing".into()).await.is_err());
    }
}
