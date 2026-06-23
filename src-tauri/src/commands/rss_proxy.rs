//! RSS Proxy — fetch feed RSS dal backend Rust per evitare CORS nel browser.
//!
//! Il frontend non può fare fetch cross-origin su siti che non mandano
//! Access-Control-Allow-Origin. Questo modulo fa da proxy: il frontend
//! chiama `fetch_rss_feed(url)` e il backend fa la richiesta HTTP senza
//! restrizioni CORS.

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

/// Scarica il contenuto di un URL RSS/Atom e lo restituisce come stringa XML.
#[tauri::command]
pub async fn fetch_rss_feed(url: String) -> Result<String, String> {
    if url.is_empty() {
        return Err("URL vuoto".into());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(12))
        .redirect(reqwest::redirect::Policy::limited(5))
        .user_agent("GameStringer/1.5 RSS Reader")
        .build()
        .map_err(|e| format!("Client HTTP: {}", e))?;

    let resp = client
        .get(&url)
        .header("Accept", "application/rss+xml, application/atom+xml, application/xml, text/xml, */*")
        .send()
        .await
        .map_err(|e| format!("Fetch {}: {}", url, e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP {} per {}", resp.status().as_u16(), url));
    }

    let text = resp
        .text()
        .await
        .map_err(|e| format!("Lettura body: {}", e))?;

    Ok(text)
}

/// Scarica il contenuto HTML di una pagina web (per estrarre og:image, twitter:image, ecc.)
#[tauri::command]
pub async fn fetch_url_content(url: String) -> Result<String, String> {
    if url.is_empty() {
        return Err("URL vuoto".into());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(8))
        .redirect(reqwest::redirect::Policy::limited(5))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| format!("Client HTTP: {}", e))?;

    let resp = client
        .get(&url)
        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        .header("Accept-Language", "en-US,en;q=0.9,it;q=0.8")
        .send()
        .await
        .map_err(|e| format!("Fetch {}: {}", url, e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP {} per {}", resp.status().as_u16(), url));
    }

    // Limita a primi 50KB per evitare di scaricare pagine enormi
    let bytes = resp.bytes().await.map_err(|e| format!("Lettura body: {}", e))?;
    let limited = &bytes[..bytes.len().min(50_000)];

    Ok(String::from_utf8_lossy(limited).to_string())
}

// ─── Supabase proxy (bypass CORS dal webview Tauri) ──────────────────────────
//
// Il webview (WebView2/WKWebView) blocca con errore CORS le fetch verso Supabase
// (`auth/v1/token`, REST `rest/v1/...`): la risposta arriva senza header
// `Access-Control-Allow-Origin` e il browser la scarta. Eseguendo la richiesta
// HTTP da Rust non c'è alcun vincolo CORS. Il frontend sostituisce `global.fetch`
// del client supabase-js con una funzione che chiama questo comando.
//
// NB: pensato per traffico JSON (auth + REST). Il body è gestito come testo
// (UTF-8): non adatto a download binari da Supabase Storage.

#[derive(Deserialize)]
pub struct SupabaseProxyRequest {
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
}

#[derive(Serialize)]
pub struct SupabaseProxyResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
}

#[tauri::command]
pub async fn supabase_proxy_fetch(
    req: SupabaseProxyRequest,
) -> Result<SupabaseProxyResponse, String> {
    if req.url.is_empty() {
        return Err("URL vuoto".into());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(20))
        .build()
        .map_err(|e| format!("Client HTTP: {}", e))?;

    let method = reqwest::Method::from_bytes(req.method.to_uppercase().as_bytes())
        .map_err(|e| format!("Metodo HTTP non valido '{}': {}", req.method, e))?;

    let mut rb = client.request(method, &req.url);
    for (k, v) in &req.headers {
        rb = rb.header(k.as_str(), v.as_str());
    }
    if let Some(b) = req.body {
        rb = rb.body(b);
    }

    let resp = rb
        .send()
        .await
        .map_err(|e| format!("Proxy fetch {}: {}", req.url, e))?;

    let status = resp.status();
    let status_text = status.canonical_reason().unwrap_or("").to_string();

    // Inoltra gli header di risposta, saltando quelli legati alla codifica/lunghezza
    // del transfer: il body qui è già decodificato in testo, quindi tenerli darebbe
    // un Response incoerente lato JS.
    let mut headers = HashMap::new();
    for (k, v) in resp.headers().iter() {
        let name = k.as_str().to_ascii_lowercase();
        if name == "content-encoding" || name == "content-length" || name == "transfer-encoding" {
            continue;
        }
        if let Ok(val) = v.to_str() {
            headers.insert(k.as_str().to_string(), val.to_string());
        }
    }

    let body = resp
        .text()
        .await
        .map_err(|e| format!("Lettura body proxy: {}", e))?;

    Ok(SupabaseProxyResponse {
        status: status.as_u16(),
        status_text,
        headers,
        body,
    })
}
