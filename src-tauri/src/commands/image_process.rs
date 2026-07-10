//! Elaborazione immagini nativa (cross-platform) per il path VLM.
//!
//! Scarica dal canvas del webview il ridimensionamento/ritaglio dello screenshot
//! prima di inviarlo al VLM: decodifica base64 -> crop opzionale -> resize (lato lungo
//! <= max_px) -> ricodifica JPEG -> ritorna base64. Usa i crate `image` e `base64`
//! gia' presenti, quindi non aggiunge dipendenze.

use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::ImageOutputFormat;
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessedImage {
    /// Base64 puro (senza prefisso data URI) dell'immagine JPEG risultante.
    pub image_data: String,
    pub width: u32,
    pub height: u32,
}

/// Rimuove l'eventuale prefisso `data:image/...;base64,`.
fn strip_data_uri(input: &str) -> &str {
    match input.find("base64,") {
        Some(idx) => &input[idx + 7..],
        None => input,
    }
}

/// Ridimensiona/ritaglia uno screenshot e lo ricodifica in JPEG.
///
/// Parametri (dal frontend, camelCase -> snake_case):
/// - `image_base64`: screenshot in base64 (con o senza prefisso data URI).
/// - `max_px`: lato lungo massimo dell'output; 0 = nessun ridimensionamento.
/// - `crop_x/crop_y/crop_w/crop_h`: regione opzionale in pixel (tutti presenti o nessuno).
/// - `quality`: qualita' JPEG 1..100 (default 80).
#[command]
pub fn downscale_capture(
    image_base64: String,
    max_px: u32,
    crop_x: Option<u32>,
    crop_y: Option<u32>,
    crop_w: Option<u32>,
    crop_h: Option<u32>,
    quality: Option<u8>,
) -> Result<ProcessedImage, String> {
    let clean = strip_data_uri(&image_base64);
    let bytes = STANDARD
        .decode(clean.trim())
        .map_err(|e| format!("base64 decode: {e}"))?;

    let mut img = image::load_from_memory(&bytes).map_err(|e| format!("image decode: {e}"))?;

    // Crop opzionale (solo se tutti e quattro i parametri sono presenti).
    if let (Some(cx), Some(cy), Some(cw), Some(ch)) = (crop_x, crop_y, crop_w, crop_h) {
        if cw > 0 && ch > 0 && cx < img.width() && cy < img.height() {
            let w = cw.min(img.width() - cx);
            let h = ch.min(img.height() - cy);
            img = img.crop_imm(cx, cy, w, h);
        }
    }

    // Resize preservando l'aspect ratio: lato lungo <= max_px.
    if max_px > 0 {
        let long_side = img.width().max(img.height());
        if long_side > max_px {
            img = img.resize(max_px, max_px, image::imageops::FilterType::Triangle);
        }
    }

    let q = quality.unwrap_or(80).clamp(1, 100);
    let mut out = Vec::new();
    img.write_to(&mut Cursor::new(&mut out), ImageOutputFormat::Jpeg(q))
        .map_err(|e| format!("jpeg encode: {e}"))?;

    Ok(ProcessedImage {
        image_data: STANDARD.encode(&out),
        width: img.width(),
        height: img.height(),
    })
}
