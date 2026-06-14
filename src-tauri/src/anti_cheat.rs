use std::collections::HashMap;
use std::error::Error;
use std::sync::{Arc, Mutex};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use winapi::um::tlhelp32::{CreateToolhelp32Snapshot, Process32First, Process32Next, PROCESSENTRY32, TH32CS_SNAPPROCESS};
use winapi::um::psapi::{EnumProcessModules, GetModuleBaseNameA};
use winapi::um::handleapi::CloseHandle;
use winapi::um::processthreadsapi::OpenProcess;
use winapi::um::winnt::{PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // Struct informazioni anti-cheat - essenziale per configurazione sicurezza
pub struct AntiCheatInfo {
    pub name: String,
    pub detection_method: DetectionMethod,
    pub risk_level: RiskLevel,
    pub compatibility_mode: CompatibilityMode,
    pub bypass_strategies: Vec<BypassStrategy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // Enum metodi detection - essenziale per classificazione anti-cheat
pub enum DetectionMethod {
    ProcessName,
    ModuleName,
    ServiceName,
    RegistryKey,
    FileSystem,
    NetworkSignature,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // Enum livelli rischio - critico per valutazione sicurezza
pub enum RiskLevel {
    Low,      // Injection possibile con precauzioni
    Medium,   // Injection rischiosa, richiede bypass
    High,     // Injection altamente rischiosa
    Critical, // Injection sconsigliata
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // Enum modalità compatibilità - essenziale per strategie injection
pub enum CompatibilityMode {
    Direct,        // Injection diretta
    Delayed,       // Injection ritardata
    Stealth,       // Injection nascosta
    Proxy,         // Injection tramite proxy
    Disabled,      // Injection disabilitata
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BypassStrategy {
    DelayedInjection,
    ProcessHollowing,
    ManualMapping,
    ReflectiveDLL,
    ThreadHijacking,
    SetWindowsHook,
    WaitForSafeWindow,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AntiCheatDetection {
    pub detected_systems: Vec<String>,
    pub risk_assessment: RiskLevel,
    pub recommended_mode: CompatibilityMode,
    pub detection_time: DateTime<Utc>,
    pub process_id: u32,
    pub details: HashMap<String, String>,
}

/// Esito del gate anti-cheat applicato prima di qualsiasi injection.
///
/// È un blocco RIGIDO: se viene rilevato un qualsiasi sistema anti-cheat,
/// `allowed` è `false` e l'injection non deve partire. Non esistono strategie
/// di bypass — la presenza di anti-cheat equivale a injection negata, perché
/// l'injection ha la firma di un cheat e su un multiplayer competitivo
/// significherebbe un ban per l'utente.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InjectionGateResult {
    pub allowed: bool,
    pub detected_systems: Vec<String>,
    pub risk_level: RiskLevel,
    pub reason: String,
}

#[derive(Debug)]
pub struct AntiCheatManager {
    known_systems: HashMap<String, AntiCheatInfo>,
    detection_cache: Arc<Mutex<HashMap<u32, AntiCheatDetection>>>,
    cache_duration: chrono::Duration,
}

impl AntiCheatManager {
    #[allow(dead_code)] // Costruttore manager anti-cheat - essenziale per sicurezza
    pub fn new() -> Self {
        let mut known_systems = HashMap::new();
        
        // Sistemi anti-cheat noti con informazioni dettagliate
        known_systems.insert("battleye".to_string(), AntiCheatInfo {
            name: "BattlEye".to_string(),
            detection_method: DetectionMethod::ProcessName,
            risk_level: RiskLevel::High,
            compatibility_mode: CompatibilityMode::Stealth,
            bypass_strategies: vec![
                BypassStrategy::DelayedInjection,
                BypassStrategy::WaitForSafeWindow,
                BypassStrategy::SetWindowsHook,
            ],
        });

        known_systems.insert("eac".to_string(), AntiCheatInfo {
            name: "Easy Anti-Cheat".to_string(),
            detection_method: DetectionMethod::ProcessName,
            risk_level: RiskLevel::High,
            compatibility_mode: CompatibilityMode::Stealth,
            bypass_strategies: vec![
                BypassStrategy::DelayedInjection,
                BypassStrategy::ManualMapping,
                BypassStrategy::WaitForSafeWindow,
            ],
        });

        known_systems.insert("vac".to_string(), AntiCheatInfo {
            name: "Valve Anti-Cheat".to_string(),
            detection_method: DetectionMethod::ModuleName,
            risk_level: RiskLevel::Critical,
            compatibility_mode: CompatibilityMode::Disabled,
            bypass_strategies: vec![],
        });

        known_systems.insert("ricochet".to_string(), AntiCheatInfo {
            name: "Ricochet Anti-Cheat".to_string(),
            detection_method: DetectionMethod::ProcessName,
            risk_level: RiskLevel::Critical,
            compatibility_mode: CompatibilityMode::Disabled,
            bypass_strategies: vec![],
        });

        known_systems.insert("xigncode".to_string(), AntiCheatInfo {
            name: "XIGNCODE3".to_string(),
            detection_method: DetectionMethod::ProcessName,
            risk_level: RiskLevel::Medium,
            compatibility_mode: CompatibilityMode::Delayed,
            bypass_strategies: vec![
                BypassStrategy::DelayedInjection,
                BypassStrategy::ThreadHijacking,
            ],
        });

        known_systems.insert("nprotect".to_string(), AntiCheatInfo {
            name: "nProtect GameGuard".to_string(),
            detection_method: DetectionMethod::ProcessName,
            risk_level: RiskLevel::Medium,
            compatibility_mode: CompatibilityMode::Stealth,
            bypass_strategies: vec![
                BypassStrategy::DelayedInjection,
                BypassStrategy::ProcessHollowing,
            ],
        });

        known_systems.insert("punkbuster".to_string(), AntiCheatInfo {
            name: "PunkBuster".to_string(),
            detection_method: DetectionMethod::ProcessName,
            risk_level: RiskLevel::Low,
            compatibility_mode: CompatibilityMode::Direct,
            bypass_strategies: vec![
                BypassStrategy::DelayedInjection,
            ],
        });

        Self {
            known_systems,
            detection_cache: Arc::new(Mutex::new(HashMap::new())),
            cache_duration: chrono::Duration::minutes(5),
        }
    }

    #[allow(dead_code)] // Detection anti-cheat - critica per sicurezza utenti
    pub fn detect_anti_cheat(&self, pid: u32) -> Result<AntiCheatDetection, Box<dyn Error>> {
        // Controlla cache prima con accesso sicuro
        if let Ok(cache) = self.detection_cache.lock() {
            if let Some(cached) = cache.get(&pid) {
                let age = Utc::now() - cached.detection_time;
                if age < self.cache_duration {
                    return Ok(cached.clone());
                }
            }
        }

        // Raccoglie nomi processi (con PID) e moduli del target via WinAPI, poi
        // applica il matching PURO delle firme note (vedi match_known_systems).
        // Se la lettura dei moduli fallisce, si prosegue con i soli processi.
        let running_processes = self.get_running_processes()?;
        let process_entries: Vec<(String, u32)> = running_processes
            .iter()
            .map(|p| (p.name.clone(), p.pid))
            .collect();
        let module_names = self.get_process_modules(pid).unwrap_or_default();

        let (detected_systems, max_risk, details) =
            self.match_known_systems(&process_entries, &module_names);

        // Determina modalità compatibilità raccomandata
        let recommended_mode = self.determine_compatibility_mode(&detected_systems);

        let detection = AntiCheatDetection {
            detected_systems,
            risk_assessment: max_risk,
            recommended_mode,
            detection_time: Utc::now(),
            process_id: pid,
            details,
        };

        // Aggiorna cache con accesso sicuro
        if let Ok(mut cache) = self.detection_cache.lock() {
            cache.insert(pid, detection.clone());
        }

        Ok(detection)
    }

    #[allow(dead_code)] // Strategie compatibilità - essenziali per bypass sicuro
    pub fn get_compatibility_strategies(&self, anti_cheat_name: &str) -> Vec<BypassStrategy> {
        for info in self.known_systems.values() {
            if info.name.to_lowercase().contains(&anti_cheat_name.to_lowercase()) {
                return info.bypass_strategies.clone();
            }
        }
        vec![]
    }

    #[allow(dead_code)] // Validazione sicurezza injection - critica per protezione utenti
    pub fn is_injection_safe(&self, detection: &AntiCheatDetection) -> bool {
        matches!(detection.risk_assessment, RiskLevel::Low) &&
        !matches!(detection.recommended_mode, CompatibilityMode::Disabled)
    }

    /// Gate anti-cheat: valuta se l'injection sul processo `pid` può partire.
    ///
    /// Esegue la detection e applica un blocco RIGIDO. Se la detection fallisce,
    /// il gate è fail-closed (blocca) perché non possiamo garantire la sicurezza.
    pub fn evaluate_injection_gate(&self, pid: u32) -> InjectionGateResult {
        match self.detect_anti_cheat(pid) {
            Ok(detection) => Self::gate_decision(&detection),
            Err(e) => Self::gate_fail_closed(&e.to_string()),
        }
    }

    /// Esito fail-closed puro: se la detection non è affidabile, l'injection è
    /// bloccata con rischio Critical. Estratto per essere testabile senza WinAPI.
    fn gate_fail_closed(error: &str) -> InjectionGateResult {
        InjectionGateResult {
            allowed: false,
            detected_systems: Vec::new(),
            risk_level: RiskLevel::Critical,
            reason: format!(
                "Detection anti-cheat fallita: {}. Injection bloccata per sicurezza (fail-closed).",
                error
            ),
        }
    }

    /// Matching PURO delle firme anti-cheat note (testabile senza WinAPI).
    ///
    /// Dati i processi in esecuzione `(nome, pid)` e i moduli del processo target,
    /// confronta i nomi con `known_systems` secondo il `detection_method` di
    /// ciascun sistema e ritorna `(sistemi_rilevati, rischio_massimo, dettagli)`.
    /// Il match è case-insensitive e per sottostringa della chiave nota.
    fn match_known_systems(
        &self,
        processes: &[(String, u32)],
        modules: &[String],
    ) -> (Vec<String>, RiskLevel, HashMap<String, String>) {
        let mut detected_systems = Vec::new();
        let mut details = HashMap::new();
        let mut max_risk = RiskLevel::Low;

        // Firme rilevate per nome processo
        for (name, pid) in processes {
            for (key, info) in &self.known_systems {
                if matches!(info.detection_method, DetectionMethod::ProcessName)
                    && name.to_lowercase().contains(key)
                {
                    detected_systems.push(info.name.clone());
                    details.insert(
                        format!("process_{}", key),
                        format!("Processo rilevato: {} (PID: {})", name, pid),
                    );
                    max_risk = self.max_risk_level(&max_risk, &info.risk_level);
                }
            }
        }

        // Firme rilevate per nome modulo del processo target
        for module in modules {
            for (key, info) in &self.known_systems {
                if matches!(info.detection_method, DetectionMethod::ModuleName)
                    && module.to_lowercase().contains(key)
                {
                    detected_systems.push(info.name.clone());
                    details.insert(
                        format!("module_{}", key),
                        format!("Modulo rilevato: {}", module),
                    );
                    max_risk = self.max_risk_level(&max_risk, &info.risk_level);
                }
            }
        }

        (detected_systems, max_risk, details)
    }

    /// Logica pura di decisione del gate (testabile senza processi reali):
    /// qualsiasi anti-cheat rilevato ⇒ injection negata.
    fn gate_decision(detection: &AntiCheatDetection) -> InjectionGateResult {
        if detection.detected_systems.is_empty() {
            InjectionGateResult {
                allowed: true,
                detected_systems: Vec::new(),
                risk_level: RiskLevel::Low,
                reason: "Nessun sistema anti-cheat rilevato".to_string(),
            }
        } else {
            InjectionGateResult {
                allowed: false,
                detected_systems: detection.detected_systems.clone(),
                risk_level: detection.risk_assessment.clone(),
                reason: format!(
                    "Sistemi anti-cheat rilevati: {}",
                    detection.detected_systems.join(", ")
                ),
            }
        }
    }

    #[allow(dead_code)] // Calcolo delay injection - essenziale per timing sicuro
    pub fn get_injection_delay(&self, detection: &AntiCheatDetection) -> Option<u64> {
        match detection.recommended_mode {
            CompatibilityMode::Delayed => Some(5000), // 5 secondi
            CompatibilityMode::Stealth => Some(10000), // 10 secondi
            CompatibilityMode::Proxy => Some(15000), // 15 secondi
            _ => None,
        }
    }

    fn get_running_processes(&self) -> Result<Vec<ProcessInfo>, Box<dyn Error>> {
        let mut processes = Vec::new();
        
        unsafe {
            let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
            if snapshot == winapi::um::handleapi::INVALID_HANDLE_VALUE {
                return Err("Impossibile creare snapshot processi".into());
            }

            let mut entry: PROCESSENTRY32 = std::mem::zeroed();
            entry.dwSize = std::mem::size_of::<PROCESSENTRY32>() as u32;

            if Process32First(snapshot, &mut entry) != 0 {
                loop {
                    let name = std::ffi::CStr::from_ptr(entry.szExeFile.as_ptr())
                        .to_string_lossy()
                        .to_string();
                    
                    processes.push(ProcessInfo {
                        pid: entry.th32ProcessID,
                        name,
                    });

                    if Process32Next(snapshot, &mut entry) == 0 {
                        break;
                    }
                }
            }

            CloseHandle(snapshot);
        }

        Ok(processes)
    }

    fn get_process_modules(&self, pid: u32) -> Result<Vec<String>, Box<dyn Error>> {
        let mut modules = Vec::new();

        unsafe {
            let handle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, 0, pid);
            if handle.is_null() {
                return Err("Impossibile aprire processo".into());
            }

            let mut module_handles = [std::ptr::null_mut(); 1024];
            let mut bytes_needed = 0;

            if EnumProcessModules(
                handle,
                module_handles.as_mut_ptr(),
                (module_handles.len() * std::mem::size_of::<winapi::shared::minwindef::HMODULE>()) as u32,
                &mut bytes_needed,
            ) != 0 {
                let module_count = bytes_needed as usize / std::mem::size_of::<winapi::shared::minwindef::HMODULE>();
                
                for i in 0..module_count.min(module_handles.len()) {
                    let mut module_name = [0u8; 256];
                    if GetModuleBaseNameA(
                        handle,
                        module_handles[i],
                        module_name.as_mut_ptr() as *mut i8,
                        module_name.len() as u32,
                    ) > 0 {
                        let name = std::ffi::CStr::from_ptr(module_name.as_ptr() as *const i8)
                            .to_string_lossy()
                            .to_string();
                        modules.push(name);
                    }
                }
            }

            CloseHandle(handle);
        }

        Ok(modules)
    }

    fn max_risk_level(&self, current: &RiskLevel, new: &RiskLevel) -> RiskLevel {
        match (current, new) {
            (_, RiskLevel::Critical) => RiskLevel::Critical,
            (RiskLevel::Critical, _) => RiskLevel::Critical,
            (_, RiskLevel::High) => RiskLevel::High,
            (RiskLevel::High, _) => RiskLevel::High,
            (_, RiskLevel::Medium) => RiskLevel::Medium,
            (RiskLevel::Medium, _) => RiskLevel::Medium,
            _ => RiskLevel::Low,
        }
    }

    fn determine_compatibility_mode(&self, detected_systems: &[String]) -> CompatibilityMode {
        let mut max_restriction = CompatibilityMode::Direct;

        for system_name in detected_systems {
            for info in self.known_systems.values() {
                if info.name == *system_name {
                    max_restriction = match (&max_restriction, &info.compatibility_mode) {
                        (_, CompatibilityMode::Disabled) => CompatibilityMode::Disabled,
                        (CompatibilityMode::Disabled, _) => CompatibilityMode::Disabled,
                        (_, CompatibilityMode::Proxy) => CompatibilityMode::Proxy,
                        (CompatibilityMode::Proxy, _) => CompatibilityMode::Proxy,
                        (_, CompatibilityMode::Stealth) => CompatibilityMode::Stealth,
                        (CompatibilityMode::Stealth, _) => CompatibilityMode::Stealth,
                        (_, CompatibilityMode::Delayed) => CompatibilityMode::Delayed,
                        (CompatibilityMode::Delayed, _) => CompatibilityMode::Delayed,
                        _ => CompatibilityMode::Direct,
                    };
                }
            }
        }

        max_restriction
    }

    #[allow(dead_code)] // Pulizia cache detection - necessaria per gestione memoria
    pub fn clear_cache(&self) {
        if let Ok(mut cache) = self.detection_cache.lock() {
            cache.clear();
        }
    }

    #[allow(dead_code)] // Statistiche cache - essenziali per diagnostica
    pub fn get_cache_stats(&self) -> HashMap<String, usize> {
        let mut stats = HashMap::new();
        
        if let Ok(cache) = self.detection_cache.lock() {
            stats.insert("cached_detections".to_string(), cache.len());
        }
        stats.insert("known_systems".to_string(), self.known_systems.len());
        stats
    }
}

#[derive(Debug, Clone)]
#[allow(dead_code)] // Struct per informazioni processo - essenziale per detection anti-cheat
struct ProcessInfo {
    #[allow(dead_code)] // PID processo - necessario per identificazione
    pid: u32,
    #[allow(dead_code)] // Nome processo - critico per detection anti-cheat
    name: String,
}

impl Default for AntiCheatManager {
    fn default() -> Self {
        Self::new()
    }
}

// === STATO ANTI-CHEAT PER TAURI ===

#[derive(Debug, Default)]
#[allow(dead_code)] // Stato anti-cheat - critico per sicurezza utenti
pub struct AntiCheatState {
    #[allow(dead_code)] // Manager anti-cheat - essenziale per protezione
    pub manager: Arc<Mutex<AntiCheatManager>>,
    #[allow(dead_code)] // Cache detection - necessaria per performance
    pub last_detection: Arc<Mutex<Option<AntiCheatDetection>>>,
}

impl AntiCheatState {
    #[allow(dead_code)] // Costruttore stato anti-cheat - critico per inizializzazione sicurezza
    pub fn new() -> Self {
        Self {
            manager: Arc::new(Mutex::new(AntiCheatManager::new())),
            last_detection: Arc::new(Mutex::new(None)),
        }
    }
}

// === GATE DI INJECTION (CHOKE-POINT UNICO) ===

/// Choke-point obbligatorio da chiamare PRIMA di qualsiasi injection o caricamento
/// di DLL nel processo target. Ritorna `Err(messaggio)` se l'injection va bloccata.
///
/// Ogni nuovo engine/injector DEVE passare da qui: è l'unico punto autorevole che
/// garantisce che GameStringer non inietti in processi protetti da anti-cheat.
pub fn assert_injection_allowed(pid: u32) -> Result<(), String> {
    let manager = AntiCheatManager::new();
    let gate = manager.evaluate_injection_gate(pid);

    if gate.allowed {
        log::info!("🛡️ Gate anti-cheat OK per PID {}: {}", pid, gate.reason);
        Ok(())
    } else {
        log::warn!("🛡️ Gate anti-cheat BLOCCA PID {}: {}", pid, gate.reason);
        Err(format!(
            "🛡️ Injection bloccata dal gate anti-cheat. {} (rischio {:?}). \
             L'injection ha la firma di un cheat: su un multiplayer competitivo \
             significherebbe un ban. GameStringer non inietta in processi protetti \
             da anti-cheat.",
            gate.reason, gate.risk_level
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn detection_with(systems: Vec<&str>, risk: RiskLevel) -> AntiCheatDetection {
        AntiCheatDetection {
            detected_systems: systems.into_iter().map(|s| s.to_string()).collect(),
            risk_assessment: risk,
            recommended_mode: CompatibilityMode::Direct,
            detection_time: Utc::now(),
            process_id: 1234,
            details: HashMap::new(),
        }
    }

    #[test]
    fn gate_allows_when_no_anti_cheat() {
        let detection = detection_with(vec![], RiskLevel::Low);
        let gate = AntiCheatManager::gate_decision(&detection);
        assert!(gate.allowed);
        assert!(gate.detected_systems.is_empty());
    }

    #[test]
    fn gate_blocks_on_any_detected_system() {
        // Anche un anti-cheat a basso rischio deve bloccare: è una blocklist.
        let detection = detection_with(vec!["PunkBuster"], RiskLevel::Low);
        let gate = AntiCheatManager::gate_decision(&detection);
        assert!(!gate.allowed);
        assert_eq!(gate.detected_systems, vec!["PunkBuster".to_string()]);
    }

    #[test]
    fn gate_blocks_on_high_risk_competitive_anti_cheat() {
        let detection = detection_with(vec!["Easy Anti-Cheat", "BattlEye"], RiskLevel::High);
        let gate = AntiCheatManager::gate_decision(&detection);
        assert!(!gate.allowed);
        assert_eq!(gate.detected_systems.len(), 2);
        assert!(matches!(gate.risk_level, RiskLevel::High));
    }

    // ── Helper aggiuntivo: detection con modalità compatibilità specifica ──
    fn detection_mode(mode: CompatibilityMode) -> AntiCheatDetection {
        AntiCheatDetection {
            detected_systems: Vec::new(),
            risk_assessment: RiskLevel::Low,
            recommended_mode: mode,
            detection_time: Utc::now(),
            process_id: 1,
            details: HashMap::new(),
        }
    }

    // ── Matching firme note (logica pura, niente WinAPI) ──

    #[test]
    fn match_clean_process_list_detects_nothing() {
        let m = AntiCheatManager::new();
        let (sys, risk, _) = m.match_known_systems(
            &[("notepad.exe".into(), 10), ("game.exe".into(), 20)],
            &["d3d11.dll".to_string()],
        );
        assert!(sys.is_empty());
        assert!(matches!(risk, RiskLevel::Low));
    }

    #[test]
    fn match_detects_battleye_by_process_name() {
        let m = AntiCheatManager::new();
        let (sys, risk, details) =
            m.match_known_systems(&[("BattlEye.exe".into(), 42)], &[]);
        assert!(sys.contains(&"BattlEye".to_string()));
        assert!(matches!(risk, RiskLevel::High));
        // il dettaglio deve riportare il PID del processo incriminato
        assert!(details.values().any(|v| v.contains("42")));
    }

    #[test]
    fn match_is_case_insensitive() {
        let m = AntiCheatManager::new();
        let (sys, _, _) = m.match_known_systems(&[("RICOCHET.EXE".into(), 1)], &[]);
        assert!(sys.contains(&"Ricochet Anti-Cheat".to_string()));
    }

    #[test]
    fn match_detects_vac_only_via_module_name() {
        let m = AntiCheatManager::new();
        // VAC usa DetectionMethod::ModuleName: un processo con quel nome NON basta…
        let (by_proc, _, _) = m.match_known_systems(&[("vac.exe".into(), 1)], &[]);
        assert!(by_proc.is_empty());
        // …ma un modulo sì, ed è rischio Critical.
        let (by_mod, risk, _) =
            m.match_known_systems(&[], &["steamservice_vac.dll".to_string()]);
        assert!(by_mod.contains(&"Valve Anti-Cheat".to_string()));
        assert!(matches!(risk, RiskLevel::Critical));
    }

    #[test]
    fn match_aggregates_to_highest_risk() {
        let m = AntiCheatManager::new();
        // BattlEye (High) via processo + VAC (Critical) via modulo ⇒ Critical
        let (sys, risk, _) = m.match_known_systems(
            &[("BattlEye.exe".into(), 7)],
            &["vac.dll".to_string()],
        );
        assert_eq!(sys.len(), 2);
        assert!(matches!(risk, RiskLevel::Critical));
    }

    // ── Gate end-to-end sulla logica pura ──

    #[test]
    fn gate_fail_closed_blocks_with_critical_risk() {
        let gate = AntiCheatManager::gate_fail_closed("snapshot processi non disponibile");
        assert!(!gate.allowed);
        assert!(matches!(gate.risk_level, RiskLevel::Critical));
        assert!(gate.reason.contains("fail-closed"));
    }

    // ── Helper di policy ──

    #[test]
    fn injection_safe_only_when_clean_and_not_disabled() {
        let m = AntiCheatManager::new();
        // pulito + Low + Direct ⇒ sicuro
        assert!(m.is_injection_safe(&detection_with(vec![], RiskLevel::Low)));
        // anti-cheat rilevato (rischio alto) ⇒ non sicuro
        assert!(!m.is_injection_safe(&detection_with(vec!["BattlEye"], RiskLevel::High)));
        // modalità Disabled ⇒ mai sicuro
        assert!(!m.is_injection_safe(&detection_mode(CompatibilityMode::Disabled)));
    }

    #[test]
    fn injection_delay_depends_on_mode() {
        let m = AntiCheatManager::new();
        assert_eq!(m.get_injection_delay(&detection_mode(CompatibilityMode::Delayed)), Some(5000));
        assert_eq!(m.get_injection_delay(&detection_mode(CompatibilityMode::Stealth)), Some(10000));
        assert_eq!(m.get_injection_delay(&detection_mode(CompatibilityMode::Proxy)), Some(15000));
        assert_eq!(m.get_injection_delay(&detection_mode(CompatibilityMode::Direct)), None);
    }

    #[test]
    fn compatibility_strategies_known_vs_unknown() {
        let m = AntiCheatManager::new();
        assert!(!m.get_compatibility_strategies("BattlEye").is_empty());
        assert!(m.get_compatibility_strategies("SistemaInesistente").is_empty());
    }

    #[test]
    fn compatibility_mode_picks_most_restrictive() {
        let m = AntiCheatManager::new();
        // VAC ⇒ Disabled è il più restrittivo, vince su PunkBuster (Direct)
        let mode = m.determine_compatibility_mode(&[
            "Valve Anti-Cheat".to_string(),
            "PunkBuster".to_string(),
        ]);
        assert!(matches!(mode, CompatibilityMode::Disabled));
    }

    #[test]
    fn max_risk_level_promotes_to_higher() {
        let m = AntiCheatManager::new();
        assert!(matches!(m.max_risk_level(&RiskLevel::Low, &RiskLevel::Critical), RiskLevel::Critical));
        assert!(matches!(m.max_risk_level(&RiskLevel::High, &RiskLevel::Low), RiskLevel::High));
        assert!(matches!(m.max_risk_level(&RiskLevel::Low, &RiskLevel::Medium), RiskLevel::Medium));
    }
}
