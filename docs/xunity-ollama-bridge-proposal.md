# Abbozzo: endpoint locale Ollama ↔ XUnity (traduzione Unity live, offline)

> ⚠️ **Abbozzo/proposta**, non testato né compilato. Serve da punto di partenza:
> valuta le dipendenze, poi `npm run tauri:dev` per compilare.

## Obiettivo
Far tradurre XUnity.AutoTranslator **in tempo reale e in locale** con Ollama, invece di
Google. Flusso per l'utente: installa patch Unity → avvia il gioco → gioca e il testo
si traduce al volo (ogni stringa tradotta una volta sola, poi cache).

## Protocollo XUnity `CustomTranslate`
XUnity chiama l'endpoint così:

```
GET http://127.0.0.1:<porta>/translate?from=en&to=ru&text=Hello%20world
```

e si aspetta **il testo tradotto come body** (HTTP 200). Config in `Config.ini`:

```ini
[Service]
Endpoint=CustomTranslate

[Custom]
Url=http://127.0.0.1:48920/translate
```

(`from`/`to` li manda XUnity in base a `FromLanguage`/`Language`; per Icaria = `en`→`ru`.)

## Abbozzo comando Rust (`src-tauri/src/commands/xunity_bridge.rs`)

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use serde::Serialize;

static RUNNING: AtomicBool = AtomicBool::new(false);

#[derive(Serialize)]
pub struct BridgeInfo { pub url: String, pub port: u16 }

/// Avvia un server HTTP locale che XUnity usa come endpoint CustomTranslate.
/// Ogni richiesta è tradotta con Ollama e messa in cache.
#[tauri::command]
pub async fn start_xunity_bridge(port: Option<u16>, model: String) -> Result<BridgeInfo, String> {
    let port = port.unwrap_or(48920);
    let url = format!("http://127.0.0.1:{}/translate", port);
    if RUNNING.swap(true, Ordering::SeqCst) {
        return Ok(BridgeInfo { url, port }); // già attivo
    }

    let cache: Arc<Mutex<HashMap<String, String>>> = Arc::new(Mutex::new(load_cache()));
    let server = tiny_http::Server::http(("127.0.0.1", port))
        .map_err(|e| format!("Porta {} non disponibile: {}", port, e))?;

    std::thread::spawn(move || {
        for req in server.incoming_requests() {
            let (from, to, text) = parse_query(req.url());   // /translate?from=&to=&text=
            if text.trim().is_empty() {
                let _ = req.respond(tiny_http::Response::from_string(""));
                continue;
            }
            let key = format!("{from}|{to}|{text}");
            if let Some(hit) = cache.lock().unwrap().get(&key).cloned() {
                let _ = req.respond(tiny_http::Response::from_string(hit));
                continue;
            }
            // Se Ollama fallisce restituiamo l'originale: XUnity NON deve cachare un errore
            match translate_with_ollama(&text, &from, &to, &model) {
                Ok(tr) if !tr.is_empty() && tr != text => {
                    cache.lock().unwrap().insert(key, tr.clone());
                    persist_cache(&cache);                 // nella versione vera: debounce
                    let _ = req.respond(tiny_http::Response::from_string(tr));
                }
                _ => { let _ = req.respond(tiny_http::Response::from_string(text)); }
            }
        }
    });

    Ok(BridgeInfo { url, port })
}

fn parse_query(url: &str) -> (String, String, String) {
    let q = url.splitn(2, '?').nth(1).unwrap_or("");
    let (mut from, mut to, mut text) = (String::from("en"), String::from("ru"), String::new());
    for pair in q.split('&') {
        let mut it = pair.splitn(2, '=');
        let k = it.next().unwrap_or("");
        let v = it.next().unwrap_or("");
        let v = urlencoding::decode(v).map(|c| c.into_owned()).unwrap_or_default();
        match k { "from" => from = v, "to" => to = v, "text" => text = v, _ => {} }
    }
    (from, to, text)
}

fn translate_with_ollama(text: &str, from: &str, to: &str, model: &str) -> Result<String, String> {
    let prompt = format!("Translate from {from} to {to}. Return ONLY the translation, no notes.\n\n{text}");
    let body = serde_json::json!({
        "model": model, "prompt": prompt, "stream": false, "options": { "temperature": 0.1 }
    });
    // reqwest blocking (o block_on su client async) dentro il thread del server
    let resp = reqwest::blocking::Client::new()
        .post("http://127.0.0.1:11434/api/generate")
        .json(&body).send().map_err(|e| e.to_string())?;
    let v: serde_json::Value = resp.json().map_err(|e| e.to_string())?;
    Ok(v["response"].as_str().unwrap_or("").trim().to_string())
}

// load_cache / persist_cache: HashMap <-> file JSON in AppData (persistente tra sessioni)
```

## Dipendenze (`Cargo.toml`)
```toml
tiny_http = "0.12"
urlencoding = "2"
# reqwest: abilitare la feature "blocking" se non già presente,
# oppure riusare il client async con futures::executor::block_on
```
Registrare il comando in `main.rs`: `commands::xunity_bridge::start_xunity_bridge`
(+ eventuale `stop_xunity_bridge`). È cross-platform, nessuno stub Linux richiesto.

## Integrazione nel flusso "String it!" (Unity)
1. `install_unity_autotranslator` (già esistente) — installa BepInEx + XUnity + font cirillici.
2. Scrivere `Config.ini` con `Endpoint=CustomTranslate` e `Url=http://127.0.0.1:48920/translate`.
3. `start_xunity_bridge(model = "huihui_ai/hy-mt1.5-abliterated:1.8b")`.
4. Avviare il **gioco vero** (ora che il bug di `find_executables_in_folder` è corretto).
5. L'utente gioca → traduzione live in russo, ogni stringa tradotta una volta e cachata.

## Caveat
- **Latenza**: Ollama è lento per-stringa → usa un modello veloce (HY-MT 1.8B) e la cache.
  XUnity di suo throttla e non richiede due volte la stessa stringa (tiene il suo file di
  traduzione), quindi il costo si paga una volta.
- **Concorrenza**: `tiny_http` serve le richieste in sequenza; per Unity va bene. Se serve,
  aggiungere un piccolo pool di thread.
- **Limite intrinseco**: XUnity traduce solo il testo che il gioco mostra a schermo. Non
  esiste pre-traduzione totale con la via runtime; per quella serve l'estrazione statica
  dagli asset (`unity_assets`/`unity_bundle`), fragile per-gioco.
- **Fallback**: se Ollama è spento, restituire l'originale (mai un messaggio d'errore, che
  XUnity cacherebbe come "traduzione").
```
