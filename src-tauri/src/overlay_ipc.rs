//! overlay_ipc — server Named Pipe per la modalità "in tempo reale / overlay".
//!
//! La DLL iniettata (gs-hook), quando usa una sorgente di sola ESTRAZIONE
//! (es. GDI/GetGlyphOutline, che non può sostituire in-place), inoltra qui le
//! righe ricostruite + la loro traduzione su una pipe DEDICATA, fire-and-forget.
//! Questo modulo le riceve e le inoltra al frontend con un evento Tauri, che le
//! mostra in una finestra overlay (`/gs-overlay`).
//!
//! Wire format (lato DLL: gs-hook/src/gs_overlay_ipc.cpp):
//!   [4 byte LE = lunghezza N][N byte UTF-8 JSON]
//!   payload = {"type":"overlay","original":"…","translated":"…"}

use serde::{Deserialize, Serialize};
use tauri::AppHandle;

/// Nome della pipe (deve combaciare con kPipeName lato DLL).
pub const PIPE_NAME: &str = r"\\.\pipe\GameStringerOverlay";

/// Evento Tauri emesso al frontend per ogni riga catturata.
pub const OVERLAY_EVENT: &str = "gs-overlay-text";

/// Riga estratta inoltrata dalla DLL.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverlayText {
    #[serde(rename = "type")]
    pub kind: String,
    pub original: String,
    pub translated: String,
}

/// Avvia il server overlay in background (no-op fuori da Windows).
pub fn start(app: AppHandle) {
    #[cfg(windows)]
    {
        tauri::async_runtime::spawn(async move {
            if let Err(e) = serve(app).await {
                log::warn!("📡 overlay IPC server terminato: {}", e);
            }
        });
    }
    #[cfg(not(windows))]
    {
        let _ = app;
        log::info!("overlay IPC: disponibile solo su Windows");
    }
}

#[cfg(windows)]
async fn serve(app: AppHandle) -> std::io::Result<()> {
    use tokio::net::windows::named_pipe::ServerOptions;

    log::info!("📡 Overlay IPC server in ascolto su {}", PIPE_NAME);
    loop {
        // Una nuova istanza di server per ogni connessione (un gioco alla volta).
        let mut server = ServerOptions::new().create(PIPE_NAME)?;
        server.connect().await?;
        log::debug!("📡 overlay IPC: DLL connessa");

        if let Err(e) = handle_connection(&app, &mut server).await {
            log::debug!("📡 overlay IPC: connessione chiusa ({})", e);
        }
        // Il client si è disconnesso → ricicla e attende il prossimo.
    }
}

#[cfg(windows)]
async fn handle_connection(
    app: &AppHandle,
    server: &mut tokio::net::windows::named_pipe::NamedPipeServer,
) -> std::io::Result<()> {
    use tauri::Emitter;
    use tokio::io::AsyncReadExt;

    loop {
        // Lunghezza (4 byte LE).
        let mut len_buf = [0u8; 4];
        server.read_exact(&mut len_buf).await?;
        let len = u32::from_le_bytes(len_buf) as usize;
        if len == 0 || len > 65536 {
            return Err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "lunghezza frame fuori range",
            ));
        }

        // Payload JSON.
        let mut payload = vec![0u8; len];
        server.read_exact(&mut payload).await?;

        match serde_json::from_slice::<OverlayText>(&payload) {
            Ok(msg) => {
                log::debug!("📝 overlay: {} -> {}", msg.original, msg.translated);
                let _ = app.emit(OVERLAY_EVENT, &msg);
            }
            Err(e) => log::warn!("overlay IPC: JSON non valido ({})", e),
        }
    }
}

/// Apre (o mostra) la finestra overlay del traduttore in tempo reale.
/// Modellata sull'overlay OCR già esistente.
#[tauri::command]
pub async fn open_gs_overlay(app: AppHandle) -> Result<(), String> {
    use tauri::Manager;

    if let Some(window) = app.get_webview_window("gs-overlay") {
        window.show().map_err(|e| e.to_string())?;
        log::info!("🪟 Overlay gs-hook mostrato");
        return Ok(());
    }

    tauri::WebviewWindowBuilder::new(
        &app,
        "gs-overlay",
        tauri::WebviewUrl::App("/gs-overlay".into()),
    )
    .title("GameStringer Overlay")
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .visible(true)
    .inner_size(1920.0, 1080.0)
    .position(0.0, 0.0)
    .build()
    .map_err(|e| e.to_string())?;

    log::info!("🪟 Overlay gs-hook creato");
    Ok(())
}

/// Chiude la finestra overlay.
#[tauri::command]
pub async fn close_gs_overlay(app: AppHandle) -> Result<(), String> {
    use tauri::Manager;
    if let Some(window) = app.get_webview_window("gs-overlay") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}
