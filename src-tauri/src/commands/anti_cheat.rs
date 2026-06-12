use crate::anti_cheat::AntiCheatManager;
use serde_json;

// Re-esportazione per main.rs
pub use crate::anti_cheat::AntiCheatState;

// === COMANDI ANTI-CHEAT ===

#[tauri::command]
pub async fn detect_anti_cheat_systems(pid: u32) -> Result<serde_json::Value, String> {
    log::info!("🔍 Rilevamento sistemi anti-cheat per PID: {}", pid);
    
    let manager = AntiCheatManager::new();
    match manager.detect_anti_cheat(pid) {
        Ok(detection) => {
            let result = serde_json::json!({
                "detected_systems": detection.detected_systems,
                "risk_level": detection.risk_assessment,
                "recommended_mode": detection.recommended_mode,
                "is_safe": manager.is_injection_safe(&detection),
                "injection_delay": manager.get_injection_delay(&detection),
                "detection_time": detection.detection_time,
                "details": detection.details
            });
            
            log::info!("✅ Rilevamento anti-cheat completato: {} sistemi trovati", 
                detection.detected_systems.len());
            Ok(result)
        },
        Err(e) => {
            log::error!("❌ Errore rilevamento anti-cheat: {}", e);
            Err(format!("Errore rilevamento anti-cheat: {}", e))
        }
    }
}

/// Pre-flight UI: valuta il gate anti-cheat per un processo SENZA iniettare.
/// Permette al frontend di mostrare lo stato "bloccato" prima di tentare l'injection.
/// È lo stesso gate rigido applicato dal backend prima di ogni injection.
#[tauri::command]
pub async fn check_injection_gate(pid: u32) -> Result<serde_json::Value, String> {
    log::info!("🛡️ Pre-flight gate anti-cheat per PID: {}", pid);

    let manager = AntiCheatManager::new();
    let gate = manager.evaluate_injection_gate(pid);

    Ok(serde_json::json!({
        "pid": pid,
        "allowed": gate.allowed,
        "detected_systems": gate.detected_systems,
        "risk_level": gate.risk_level,
        "reason": gate.reason,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[tauri::command]
pub async fn get_anti_cheat_compatibility_strategies(anti_cheat_name: String) -> Result<serde_json::Value, String> {
    log::info!("🛡️ Recupero strategie compatibilità per: {}", anti_cheat_name);
    
    let manager = AntiCheatManager::new();
    let strategies = manager.get_compatibility_strategies(&anti_cheat_name);
    
    let result = serde_json::json!({
        "anti_cheat_name": anti_cheat_name,
        "strategies": strategies,
        "strategy_count": strategies.len(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    log::info!("✅ Strategie recuperate: {} disponibili", strategies.len());
    Ok(result)
}

#[tauri::command]
pub async fn get_anti_cheat_cache_stats() -> Result<serde_json::Value, String> {
    log::info!("📊 Recupero statistiche cache anti-cheat");
    
    let manager = AntiCheatManager::new();
    let stats = manager.get_cache_stats();
    
    let result = serde_json::json!({
        "cache_stats": stats,
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    log::info!("✅ Statistiche cache recuperate");
    Ok(result)
}

#[tauri::command]
pub async fn clear_anti_cheat_cache() -> Result<serde_json::Value, String> {
    log::info!("🧹 Pulizia cache anti-cheat");
    
    let manager = AntiCheatManager::new();
    manager.clear_cache();
    
    let result = serde_json::json!({
        "success": true,
        "message": "Cache anti-cheat pulita con successo",
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    log::info!("✅ Cache anti-cheat pulita");
    Ok(result)
}

#[tauri::command]
pub async fn test_anti_cheat_detection() -> Result<serde_json::Value, String> {
    log::info!("🧪 Test sistema rilevamento anti-cheat");
    
    let manager = AntiCheatManager::new();
    let mut test_results = Vec::new();
    
    // Test con processi comuni
    let test_processes = vec![1000, 2000, 3000]; // PID di test
    
    for pid in test_processes {
        match manager.detect_anti_cheat(pid) {
            Ok(detection) => {
                test_results.push(serde_json::json!({
                    "pid": pid,
                    "success": true,
                    "detected_systems": detection.detected_systems,
                    "risk_level": detection.risk_assessment
                }));
            },
            Err(e) => {
                test_results.push(serde_json::json!({
                    "pid": pid,
                    "success": false,
                    "error": e.to_string()
                }));
            }
        }
    }
    
    let result = serde_json::json!({
        "test_results": test_results,
        "total_tests": test_results.len(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    log::info!("✅ Test anti-cheat completato: {} test eseguiti", test_results.len());
    Ok(result)
}
