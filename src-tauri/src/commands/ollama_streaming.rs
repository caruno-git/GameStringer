use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use futures::StreamExt;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaStreamRequest {
    pub model: String,
    pub prompt: String,
    pub system: Option<String>,
    pub temperature: Option<f32>,
    pub top_p: Option<f32>,
    pub top_k: Option<i32>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaStreamResponse {
    pub model: String,
    pub created_at: String,
    pub response: String,
    pub done: bool,
    pub context: Option<Vec<i32>>,
    pub total_duration: Option<i64>,
    pub load_duration: Option<i64>,
    pub prompt_eval_count: Option<i32>,
    pub prompt_eval_duration: Option<i64>,
    pub eval_count: Option<i32>,
    pub eval_duration: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct StreamChunk {
    pub text: String,
    pub done: bool,
    pub tokens_per_second: Option<f64>,
}

/// Genera traduzione con streaming via Eventi Tauri
#[tauri::command]
pub async fn translate_with_streaming(
    app: AppHandle,
    text: String,
    source_lang: String,
    target_lang: String,
    model: String,
    temperature: Option<f32>,
    top_p: Option<f32>,
    top_k: Option<i32>,
    context: Option<String>,
    text_type: Option<String>,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let ollama_url = "http://localhost:11434/api/generate";
    
    // Costruisci il prompt di sistema
    let system_prompt = format!(
        "You are a professional game translator. Translate from {} to {}. \
         Preserve formatting, tone, and context. Output ONLY the translation, no explanations.",
        source_lang, target_lang
    );
    
    // Aggiungi contesto se presente
    let final_prompt = if let Some(ctx) = context {
        format!("Game Context: {}\n\nText to translate: {}", ctx, text)
    } else {
        text
    };
    
    let request = OllamaStreamRequest {
        model,
        prompt: final_prompt,
        system: Some(system_prompt),
        temperature: temperature.or(Some(0.3)),
        top_p,
        top_k,
        stream: true,
    };
    
    // Emetti evento inizio
    let _ = app.emit("ollama-stream-start", serde_json::json!({
        "status": "started",
        "model": request.model,
    }));
    
    let start_time = std::time::Instant::now();
    let mut total_tokens = 0;
    
    match client.post(ollama_url)
        .json(&request)
        .send()
        .await 
    {
        Ok(response) => {
            let mut stream = response.bytes_stream();
            let mut accumulated_text = String::new();
            
            while let Some(chunk) = stream.next().await {
                match chunk {
                    Ok(bytes) => {
                        if let Ok(text_chunk) = String::from_utf8(bytes.to_vec()) {
                            // Ollama streama JSON lines
                            for line in text_chunk.lines() {
                                if line.trim().is_empty() { continue; }
                                
                                match serde_json::from_str::<OllamaStreamResponse>(line) {
                                    Ok(data) => {
                                        accumulated_text.push_str(&data.response);
                                        total_tokens += 1;
                                        
                                        let elapsed = start_time.elapsed().as_secs_f64();
                                        let tps = if elapsed > 0.0 {
                                            Some(total_tokens as f64 / elapsed)
                                        } else { None };
                                        
                                        // Emetti chunk
                                        let _ = app.emit("ollama-stream-chunk", serde_json::json!({
                                            "text": data.response,
                                            "accumulated": accumulated_text,
                                            "done": data.done,
                                            "tokens_per_second": tps,
                                            "total_tokens": total_tokens,
                                        }));
                                        
                                        if data.done {
                                            // Emetti completamento
                                            let _ = app.emit("ollama-stream-complete", serde_json::json!({
                                                "final_text": accumulated_text,
                                                "total_tokens": total_tokens,
                                                "total_duration_ms": data.total_duration.map(|d| d / 1_000_000),
                                                "tokens_per_second": tps,
                                            }));
                                            return Ok(());
                                        }
                                    }
                                    Err(e) => {
                                        eprintln!("JSON parse error: {} | Line: {}", e, line);
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        let _ = app.emit("ollama-stream-error", serde_json::json!({
                            "error": format!("Stream error: {}", e),
                        }));
                        return Err(format!("Stream error: {}", e));
                    }
                }
            }
            
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("ollama-stream-error", serde_json::json!({
                "error": format!("Request failed: {}", e),
            }));
            Err(format!("Request failed: {}", e))
        }
    }
}

/// Batch streaming per traduzioni multiple
#[tauri::command]
pub async fn translate_batch_streaming(
    app: AppHandle,
    texts: Vec<String>,
    source_lang: String,
    target_lang: String,
    model: String,
    temperature: Option<f32>,
) -> Result<(), String> {
    let total = texts.len();
    
    for (i, text) in texts.iter().enumerate() {
        let _ = app.emit("ollama-batch-progress", serde_json::json!({
            "current": i + 1,
            "total": total,
            "percentage": ((i + 1) as f64 / total as f64 * 100.0) as i32,
            "current_text_preview": text.chars().take(50).collect::<String>(),
        }));
        
        translate_with_streaming(
            app.clone(),
            text.clone(),
            source_lang.clone(),
            target_lang.clone(),
            model.clone(),
            temperature,
            None, None,
            None, None,
        ).await?;
    }
    
    let _ = app.emit("ollama-batch-complete", serde_json::json!({
        "total_translated": total,
        "status": "completed",
    }));
    
    Ok(())
}
