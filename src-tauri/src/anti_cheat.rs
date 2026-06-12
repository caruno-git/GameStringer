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

        let mut detected_systems = Vec::new();
        let mut details = HashMap::new();
        let mut max_risk = RiskLevel::Low;

        // Scansiona processi in esecuzione
        let running_processes = self.get_running_processes()?;
        for process in &running_processes {
            for (key, info) in &self.known_systems {
                if matches!(info.detection_method, DetectionMethod::ProcessName) && process.name.to_lowercase().contains(key) {
                    detected_systems.push(info.name.clone());
                    details.insert(
                        format!("process_{}", key),
                        format!("Processo rilevato: {} (PID: {})", process.name, process.pid)
                    );
                    max_risk = self.max_risk_level(&max_risk, &info.risk_level);
                }
            }
        }

        // Scansiona moduli del processo target
        if let Ok(modules) = self.get_process_modules(pid) {
            for module in &modules {
                for (key, info) in &self.known_systems {
                    if matches!(info.detection_method, DetectionMethod::ModuleName) && module.to_lowercase().contains(key) {
                        detected_systems.push(info.name.clone());
                        details.insert(
                            format!("module_{}", key),
                            format!("Modulo rilevato: {}", module)
                        );
                        max_risk = self.max_risk_level(&max_risk, &info.risk_level);
                    }
                }
            }
        }

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
            Err(e) => InjectionGateResult {
                allowed: false,
                detected_systems: Vec::new(),
                risk_level: RiskLevel::Critical,
                reason: format!(
                    "Detection anti-cheat fallita: {}. Injection bloccata per sicurezza (fail-closed).",
                    e
                ),
            },
        }
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
}
