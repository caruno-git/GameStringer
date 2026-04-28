//! RSS Proxy — fetch feed RSS dal backend Rust per evitare CORS nel browser.
//!
//! Il frontend non può fare fetch cross-origin su siti che non mandano
//! Access-Control-Allow-Origin. Questo modulo fa da proxy: il frontend
//! chiama `fetch_rss_feed(url)` e il backend fa la richiesta HTTP senza
//! restrizioni CORS.

use reqwest::Client;
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
