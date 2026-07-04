//! # Translation Lookup Module
//!
//! Servizi per capire lo stato di localizzazione di un gioco PRIMA di tradurlo:
//! - **PCGamingWiki** → API cargoquery pubblica: l'italiano ufficiale esiste?
//!   È nota una fan translation?
//! - **Ricerca patch ITA** → genera i link di ricerca sui portali italiani
//!   (GamesTranslator.it, Romhacking.it, Language Pack Italia).

use serde::{Deserialize, Serialize};
use std::time::Duration;

const PCGW_API: &str = "https://www.pcgamingwiki.com/w/api.php";
// PCGW chiede uno User-Agent descrittivo per le richieste API
const PCGW_UA: &str = "GameStringer/1.11 (game translation tool; https://gamestringer.ai)";

fn http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(12))
        .user_agent(PCGW_UA)
        .build()
        .map_err(|e| format!("Client HTTP: {}", e))
}

// ============================================================================
// PCGAMINGWIKI
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct PcgwLanguageInfo {
    /// Pagina PCGW trovata
    pub found: bool,
    /// Titolo della pagina PCGW
    pub page_title: Option<String>,
    /// URL della pagina
    pub page_url: Option<String>,
    /// L'italiano ufficiale è presente (interfaccia)?
    pub official_italian: Option<bool>,
    /// Sottotitoli in italiano?
    pub italian_subtitles: Option<bool>,
    /// Riferimento a fan translation (colonna "fan" della tabella L10n)
    pub fan_translation: Option<String>,
    /// Note della riga italiana
    pub notes: Option<String>,
}

fn cargo_results(json: &serde_json::Value) -> Vec<&serde_json::Value> {
    json.get("cargoquery")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|e| e.get("title")).collect())
        .unwrap_or_default()
}

/// PCGW usa "true"/"false"/"hackable"/"n/a" nei campi L10n
fn pcgw_bool(v: Option<&serde_json::Value>) -> Option<bool> {
    let s = v?.as_str()?.trim().to_lowercase();
    match s.as_str() {
        "true" | "yes" => Some(true),
        "false" | "no" | "n/a" | "" => Some(false),
        _ => Some(true), // "hackable", "always on" ecc. → c'è qualcosa
    }
}

/// Risolve il nome pagina PCGW: prima per Steam AppID (preciso), poi per nome.
async fn pcgw_resolve_page(
    client: &reqwest::Client,
    game_name: &str,
    steam_app_id: Option<u32>,
) -> Result<Option<String>, String> {
    if let Some(appid) = steam_app_id {
        let url = format!(
            "{}?action=cargoquery&tables=Infobox_game&fields=Infobox_game._pageName%3Dpage&where=Infobox_game.Steam_AppID%20HOLDS%20%22{}%22&format=json",
            PCGW_API, appid
        );
        let resp: serde_json::Value = client.get(&url).send().await
            .map_err(|e| format!("PCGW non raggiungibile: {}", e))?
            .json().await.map_err(|e| format!("Risposta PCGW non valida: {}", e))?;
        if let Some(first) = cargo_results(&resp).first() {
            if let Some(page) = first.get("page").and_then(|v| v.as_str()) {
                return Ok(Some(page.to_string()));
            }
        }
    }

    // Fallback: ricerca full-text sul titolo
    let url = format!(
        "{}?action=query&list=search&srsearch={}&srlimit=1&format=json",
        PCGW_API,
        urlencoding::encode(game_name)
    );
    let resp: serde_json::Value = client.get(&url).send().await
        .map_err(|e| format!("PCGW non raggiungibile: {}", e))?
        .json().await.map_err(|e| format!("Risposta PCGW non valida: {}", e))?;
    let page = resp.get("query")
        .and_then(|q| q.get("search"))
        .and_then(|s| s.as_array())
        .and_then(|arr| arr.first())
        .and_then(|hit| hit.get("title"))
        .and_then(|t| t.as_str())
        .map(|s| s.to_string());
    Ok(page)
}

/// Interroga PCGamingWiki sullo stato della lingua italiana per un gioco.
#[tauri::command]
pub async fn pcgw_check_language(
    game_name: String,
    steam_app_id: Option<u32>,
) -> Result<PcgwLanguageInfo, String> {
    log::info!("[PCGW] Check lingua per '{}' (appid: {:?})", game_name, steam_app_id);
    let client = http_client()?;

    let Some(page) = pcgw_resolve_page(&client, &game_name, steam_app_id).await? else {
        return Ok(PcgwLanguageInfo { found: false, ..Default::default() });
    };

    let page_url = format!(
        "https://www.pcgamingwiki.com/wiki/{}",
        urlencoding::encode(&page.replace(' ', "_"))
    );

    // Tabella L10n: riga per la lingua italiana.
    // NB: i nomi colonna Cargo su PCGW sono capitalizzati (Language, Interface…),
    // ma per robustezza proviamo entrambe le varianti; gli alias (=lowercase)
    // rendono uniforme la lettura del risultato.
    let mut rows_json: Option<serde_json::Value> = None;
    for (fields, lang_col) in [
        ("L10n.Language%3Dlanguage,L10n.Interface%3Dinterface,L10n.Subtitles%3Dsubtitles,L10n.Fan%3Dfan,L10n.Notes%3Dnotes", "L10n.Language"),
        ("L10n.language,L10n.interface,L10n.subtitles,L10n.fan,L10n.notes", "L10n.language"),
    ] {
        let url = format!(
            "{}?action=cargoquery&tables=L10n&fields={}&where=L10n._pageName%3D%22{}%22%20AND%20{}%3D%22Italian%22&format=json",
            PCGW_API,
            fields,
            urlencoding::encode(&page),
            lang_col
        );
        let resp: serde_json::Value = client.get(&url).send().await
            .map_err(|e| format!("PCGW non raggiungibile: {}", e))?
            .json().await.map_err(|e| format!("Risposta PCGW non valida: {}", e))?;
        if let Some(err) = resp.get("error") {
            log::warn!("[PCGW] Query L10n rifiutata ({}): riprovo con variante alternativa", err);
            continue;
        }
        rows_json = Some(resp);
        break;
    }
    let resp = rows_json.unwrap_or_default();
    let rows = cargo_results(&resp);
    let mut out = PcgwLanguageInfo {
        found: true,
        page_title: Some(page),
        page_url: Some(page_url),
        ..Default::default()
    };

    if let Some(row) = rows.first() {
        out.official_italian = pcgw_bool(row.get("interface"));
        out.italian_subtitles = pcgw_bool(row.get("subtitles"));
        out.fan_translation = row.get("fan").and_then(|v| v.as_str())
            .filter(|s| !s.trim().is_empty())
            .map(|s| s.to_string());
        out.notes = row.get("notes").and_then(|v| v.as_str())
            .filter(|s| !s.trim().is_empty())
            .map(|s| s.to_string());
    } else {
        // Pagina trovata ma nessuna riga "Italian" nella tabella L10n
        out.official_italian = Some(false);
    }

    Ok(out)
}

/// Test raggiungibilità PCGamingWiki (query su un gioco noto).
#[tauri::command]
pub async fn test_pcgw_connection() -> Result<String, String> {
    let info = pcgw_check_language("The Witcher 3: Wild Hunt".to_string(), Some(292030)).await?;
    if info.found {
        Ok(format!(
            "✅ PCGamingWiki raggiungibile - pagina '{}' trovata (ITA ufficiale: {})",
            info.page_title.unwrap_or_default(),
            match info.official_italian { Some(true) => "sì", Some(false) => "no", None => "?" }
        ))
    } else {
        Err("PCGW risponde ma la query di test non ha trovato la pagina".to_string())
    }
}

// ============================================================================
// RICERCA PATCH ITA
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct ItaPatchSearchLink {
    pub site: String,
    pub description: String,
    pub url: String,
}

/// Genera i link di ricerca per patch di traduzione italiana sui portali ITA.
/// Non fa scraping (fragile e scortese): apre la ricerca nativa di ogni sito.
#[tauri::command]
pub async fn get_ita_patch_search_links(game_name: String) -> Result<Vec<ItaPatchSearchLink>, String> {
    if game_name.trim().is_empty() {
        return Err("Nome gioco vuoto".to_string());
    }
    let q = urlencoding::encode(game_name.trim()).to_string();

    Ok(vec![
        ItaPatchSearchLink {
            site: "GamesTranslator.it".to_string(),
            description: "La più grande community italiana di fan translation".to_string(),
            url: format!("https://www.gamestranslator.it/index.php?/search/&q={}&type=downloads_file", q),
        },
        ItaPatchSearchLink {
            site: "Language Pack Italia".to_string(),
            description: "Repository ITA di traduzioni giochi e mod (LPI-Hub)".to_string(),
            url: format!("https://www.languagepack.it/?s={}", q),
        },
        ItaPatchSearchLink {
            site: "Romhacking.it".to_string(),
            description: "Traduzioni italiane per giochi retro/ROM".to_string(),
            url: format!("https://www.google.com/search?q=site%3Aromhacking.it+{}", q),
        },
        ItaPatchSearchLink {
            site: "RomHack Plaza".to_string(),
            description: "Hack e fan translation internazionali".to_string(),
            url: format!("https://romhackplaza.org/?s={}&post_type=romhack", q),
        },
    ])
}

/// Test del servizio ricerca patch ITA (verifica che GamesTranslator risponda).
#[tauri::command]
pub async fn test_ita_patch_search() -> Result<String, String> {
    let client = http_client()?;
    let resp = client
        .get("https://www.gamestranslator.it/")
        .send()
        .await
        .map_err(|e| format!("GamesTranslator.it non raggiungibile: {}", e))?;
    if resp.status().is_success() {
        Ok("✅ Ricerca patch ITA pronta - GamesTranslator.it raggiungibile".to_string())
    } else {
        Err(format!("GamesTranslator.it risponde con HTTP {}", resp.status().as_u16()))
    }
}
