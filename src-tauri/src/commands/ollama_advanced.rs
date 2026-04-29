use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use tauri::command;

// ═══════════════════════════════════════════════════════════════════
// GPU DETECTION
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
pub struct GPUInfo {
    pub name: String,
    pub vram_total_mb: i64,
    pub vram_available_mb: i64,
    pub driver_version: String,
    pub cuda_support: bool,
}

#[command]
pub async fn detect_gpu() -> Result<GPUInfo, String> {
    // Try nvidia-smi first
    #[cfg(target_os = "windows")]
    {
        match std::process::Command::new("nvidia-smi")
            .args(&["--query-gpu=name,memory.total,memory.free,driver_version", "--format=csv,noheader"])
            .output() 
        {
            Ok(output) if output.status.success() => {
                let output_str = String::from_utf8_lossy(&output.stdout);
                if let Some(line) = output_str.lines().next() {
                    let parts: Vec<&str> = line.split(',').collect();
                    if parts.len() >= 4 {
                        let name = parts[0].trim().to_string();
                        let vram_total = parts[1].trim().replace(" MiB", "").replace(" MB", "").parse::<i64>().unwrap_or(0);
                        let vram_free = parts[2].trim().replace(" MiB", "").replace(" MB", "").parse::<i64>().unwrap_or(0);
                        let driver = parts[3].trim().to_string();
                        
                        return Ok(GPUInfo {
                            name,
                            vram_total_mb: vram_total,
                            vram_available_mb: vram_free,
                            driver_version: driver,
                            cuda_support: true,
                        });
                    }
                }
            }
            _ => {}
        }
    }
    
    // Fallback: Check DirectX/WMI on Windows
    #[cfg(target_os = "windows")]
    {
        match std::process::Command::new("wmic")
            .args(&["path", "win32_VideoController", "get", "Name,AdapterRAM", "/format:csv"])
            .output()
        {
            Ok(output) if output.status.success() => {
                let output_str = String::from_utf8_lossy(&output.stdout);
                for line in output_str.lines().skip(1) {
                    let parts: Vec<&str> = line.split(',').collect();
                    if parts.len() >= 3 {
                        let name = parts[1].trim().to_string();
                        let vram = parts[2].trim().parse::<i64>().unwrap_or(0) / (1024 * 1024); // Convert bytes to MB
                        
                        if !name.is_empty() && vram > 0 {
                            return Ok(GPUInfo {
                                name,
                                vram_total_mb: vram,
                                vram_available_mb: vram, // Assume all available
                                driver_version: "unknown".to_string(),
                                cuda_support: false,
                            });
                        }
                    }
                }
            }
            _ => {}
        }
    }
    
    Err("No GPU detected".to_string())
}

// ═══════════════════════════════════════════════════════════════════
// ADVANCED TRANSLATION WITH PARAMETERS
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
pub struct AdvancedTranslationRequest {
    pub text: String,
    pub source_lang: String,
    pub target_lang: String,
    pub model: String,
    pub temperature: f32,
    pub top_p: Option<f32>,
    pub top_k: Option<i32>,
    pub repeat_penalty: Option<f32>,
    pub num_predict: Option<i32>,
    pub system_prompt: Option<String>,
    pub context: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaGenerateRequest {
    pub model: String,
    pub prompt: String,
    pub system: Option<String>,
    pub temperature: f32,
    pub top_p: Option<f32>,
    pub top_k: Option<i32>,
    pub repeat_penalty: Option<f32>,
    pub num_predict: Option<i32>,
    pub stream: bool,
}

#[command]
pub async fn ollama_translate_advanced(request: AdvancedTranslationRequest) -> Result<String, String> {
    let client = reqwest::Client::new();
    let ollama_url = "http://localhost:11434/api/generate";
    
    let system = request.system_prompt.unwrap_or_else(|| {
        format!(
            "You are a professional game translator. Translate from {} to {}. Preserve formatting and context.",
            request.source_lang, request.target_lang
        )
    });
    
    let prompt = if let Some(ctx) = request.context {
        format!("Context: {}\n\nText: {}", ctx, request.text)
    } else {
        request.text
    };
    
    let ollama_request = OllamaGenerateRequest {
        model: request.model,
        prompt,
        system: Some(system),
        temperature: request.temperature,
        top_p: request.top_p,
        top_k: request.top_k,
        repeat_penalty: request.repeat_penalty,
        num_predict: request.num_predict,
        stream: false,
    };
    
    let response = client.post(ollama_url)
        .json(&ollama_request)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    #[derive(Deserialize)]
    struct GenerateResponse {
        response: String,
    }
    
    let data: GenerateResponse = response.json().await
        .map_err(|e| format!("Parse error: {}", e))?;
    
    Ok(data.response.trim().to_string())
}

// ═══════════════════════════════════════════════════════════════════
// TRANSLATION CACHE (IN-MEMORY + SQLITE)
// ═══════════════════════════════════════════════════════════════════

use rusqlite::{Connection, params};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct CachedTranslation {
    pub key: String,
    pub text: String,
    pub source_lang: String,
    pub target_lang: String,
    pub model: String,
    pub timestamp: i64,
    pub hit_count: i64,
}

lazy_static! {
    static ref CACHE_DB: Mutex<Option<Connection>> = Mutex::new(None);
}

fn get_cache_db() -> Result<Connection, String> {
    let mut db_opt = CACHE_DB.lock().map_err(|e| e.to_string())?;
    
    if db_opt.is_none() {
        let cache_dir = dirs::cache_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("GameStringer");
        
        std::fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
        
        let db_path = cache_dir.join("translations.db");
        let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS translations (
                key TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                source_lang TEXT NOT NULL,
                target_lang TEXT NOT NULL,
                model TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                hit_count INTEGER DEFAULT 0
            )",
            [],
        ).map_err(|e| e.to_string())?;
        
        *db_opt = Some(conn);
    }
    
    // Clone the connection (rusqlite supports this)
    db_opt.as_ref().cloned().ok_or_else(|| "Failed to get DB".to_string())
}

#[command]
pub async fn get_cached_translation(key: String) -> Result<Option<CachedTranslation>, String> {
    let conn = get_cache_db()?;
    
    let mut stmt = conn.prepare(
        "SELECT key, text, source_lang, target_lang, model, timestamp, hit_count 
         FROM translations WHERE key = ?"
    ).map_err(|e| e.to_string())?;
    
    let result = stmt.query_row([&key], |row| {
        Ok(CachedTranslation {
            key: row.get(0)?,
            text: row.get(1)?,
            source_lang: row.get(2)?,
            target_lang: row.get(3)?,
            model: row.get(4)?,
            timestamp: row.get(5)?,
            hit_count: row.get(6)?,
        })
    });
    
    match result {
        Ok(mut entry) => {
            // Update hit count
            entry.hit_count += 1;
            let _ = conn.execute(
                "UPDATE translations SET hit_count = hit_count + 1 WHERE key = ?",
                [&key],
            );
            Ok(Some(entry))
        }
        Err(_) => Ok(None),
    }
}

#[command]
pub async fn set_cached_translation(
    key: String,
    text: String,
    source_lang: String,
    target_lang: String,
    model: String,
) -> Result<(), String> {
    let conn = get_cache_db()?;
    let timestamp = chrono::Utc::now().timestamp();
    
    conn.execute(
        "INSERT OR REPLACE INTO translations (key, text, source_lang, target_lang, model, timestamp, hit_count)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, COALESCE((SELECT hit_count FROM translations WHERE key = ?1), 0))",
        params![key, text, source_lang, target_lang, model, timestamp],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[command]
pub async fn clear_translation_cache() -> Result<(), String> {
    let conn = get_cache_db()?;
    conn.execute("DELETE FROM translations", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn get_cache_stats() -> Result<HashMap<String, serde_json::Value>, String> {
    let conn = get_cache_db()?;
    
    let total_entries: i64 = conn.query_row(
        "SELECT COUNT(*) FROM translations",
        [],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    let total_hits: i64 = conn.query_row(
        "SELECT SUM(hit_count) FROM translations",
        [],
        |row| row.get(0)
    ).unwrap_or(0);
    
    let total_size: i64 = conn.query_row(
        "SELECT SUM(LENGTH(text)) FROM translations",
        [],
        |row| row.get(0)
    ).unwrap_or(0);
    
    let mut stats = HashMap::new();
    stats.insert("total_entries".to_string(), total_entries.into());
    stats.insert("total_hits".to_string(), total_hits.into());
    stats.insert("total_size_kb".to_string(), (total_size / 1024).into());
    stats.insert("hit_rate".to_string(), (if total_entries > 0 { total_hits as f64 / total_entries as f64 } else { 0.0 }).into());
    
    Ok(stats)
}

// ═══════════════════════════════════════════════════════════════════
// AUTO-UPDATE CHECKER
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelUpdateInfo {
    pub model: String,
    pub current_digest: String,
    pub latest_digest: String,
    pub has_update: bool,
    pub update_size: Option<String>,
}

#[command]
pub async fn check_ollama_model_updates() -> Result<Vec<ModelUpdateInfo>, String> {
    let client = reqwest::Client::new();
    
    // Get installed models
    let response = client.get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    #[derive(Deserialize)]
    struct ModelTag {
        name: String,
        digest: String,
    }
    
    #[derive(Deserialize)]
    struct TagsResponse {
        models: Vec<ModelTag>,
    }
    
    let data: TagsResponse = response.json().await
        .map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    
    for model in data.models {
        // Check for updates by pulling manifest
        // Note: Ollama doesn't have a direct "check update" API
        // We would need to compare digests with registry
        // For now, placeholder implementation
        updates.push(ModelUpdateInfo {
            model: model.name.clone(),
            current_digest: model.digest.clone(),
            latest_digest: "unknown".to_string(),
            has_update: false, // Would need registry API
            update_size: None,
        });
    }
    
    Ok(updates)
}

#[command]
pub async fn pull_ollama_model(name: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let request = serde_json::json!({
        "name": name,
    });
    
    client.post("http://localhost:11434/api/pull")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Pull failed: {}", e))?;
    
    Ok(())
}
