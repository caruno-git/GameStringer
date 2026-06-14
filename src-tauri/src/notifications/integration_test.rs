#[cfg(test)]
mod integration_tests {
    use crate::notifications::{
        models::{NotificationFilter, NotificationType, NotificationPriority},
        storage::NotificationStorage,
        manager::NotificationManager,
        profile_integration::ProfileNotificationIntegration,
        profile_event_handler::ProfileEventHandler,
    };
    use crate::profiles::manager::ProfileEvent;
    use std::sync::Arc;
    use tokio::sync::Mutex;
    use tempfile::tempdir;

    /// Abbassa a `Low` la soglia di priorità del tipo `Profile` per un profilo, così
    /// che le notifiche di lifecycle a priorità `Low` (auth/switch/logout) non vengano
    /// soppresse dal priority gating delle preferenze di default (min = `Normal`).
    async fn allow_low_priority_profile(
        manager: &Arc<Mutex<NotificationManager>>,
        profile_id: &str,
    ) {
        let guard = manager.lock().await;
        let mut prefs = guard.get_preferences(profile_id).await.unwrap();
        if let Some(tp) = prefs.type_settings.get_mut(&NotificationType::Profile) {
            tp.priority = NotificationPriority::Low;
        }
        guard.update_preferences(prefs).await.unwrap();
    }

    // Restituisce gli Arc condivisi (manager + integration) invece di provare a
    // estrarne il contenuto: integration ed event_handler tengono clone vivi dell'Arc,
    // quindi il vecchio Arc::try_unwrap falliva SEMPRE. I test bloccano i Mutex
    // per-statement (mai un guard tenuto a cavallo di una chiamata che ri-blocca
    // internamente il manager) → niente deadlock. tempdir per-test (vedi manager_tests).
    async fn create_test_system() -> (
        Arc<Mutex<NotificationManager>>,
        Arc<Mutex<ProfileNotificationIntegration>>,
        ProfileEventHandler,
    ) {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test_integration.db");
        let storage = NotificationStorage::new(db_path);
        let manager = NotificationManager::new(storage);
        manager.initialize().await.unwrap();

        let manager_arc = Arc::new(Mutex::new(manager));
        let integration = ProfileNotificationIntegration::new(Arc::clone(&manager_arc));
        let integration_arc = Arc::new(Mutex::new(integration));

        let event_handler = ProfileEventHandler::new(
            Arc::clone(&manager_arc),
            Arc::clone(&integration_arc),
        );

        (manager_arc, integration_arc, event_handler)
    }

    #[tokio::test]
    async fn test_complete_profile_lifecycle() {
        let (manager, integration, event_handler) = create_test_system().await;

        let profile_id = "test_profile";
        let profile_name = "Test Profile";

        // Consenti le notifiche Low (auth/switch) per questo profilo, altrimenti il
        // priority gating delle preferenze di default (min Normal) le sopprimerebbe.
        allow_low_priority_profile(&manager, profile_id).await;

        // 1. Simula creazione profilo
        let create_event = ProfileEvent::ProfileCreated {
            profile_id: profile_id.to_string(),
            name: profile_name.to_string(),
        };

        // Gestisce l'evento di creazione
        integration.lock().await.handle_profile_event(create_event).await.unwrap();

        // Verifica che sia stata creata la notifica di benvenuto
        let filter = NotificationFilter {
            notification_type: None,
            priority: None,
            unread_only: None,
            category: None,
            limit: None,
            offset: None,
        };

        let notifications = manager.lock().await.get_notifications(profile_id, filter.clone()).await.unwrap();
        assert_eq!(notifications.len(), 1);
        assert_eq!(notifications[0].title, "Benvenuto in GameStringer!");

        // 2. Simula autenticazione
        let auth_event = ProfileEvent::ProfileAuthenticated {
            profile_id: profile_id.to_string(),
            name: profile_name.to_string(),
        };

        integration.lock().await.handle_profile_event(auth_event).await.unwrap();

        // Verifica che ci siano ora 2 notifiche
        let notifications = manager.lock().await.get_notifications(profile_id, filter.clone()).await.unwrap();
        assert_eq!(notifications.len(), 2);

        // 3. Simula cambio profilo
        let switch_event = ProfileEvent::ProfileSwitched {
            from_id: Some("old_profile".to_string()),
            to_id: profile_id.to_string(),
        };

        integration.lock().await.handle_profile_event(switch_event).await.unwrap();

        // Verifica che ci siano ora 3 notifiche
        let notifications = manager.lock().await.get_notifications(profile_id, filter.clone()).await.unwrap();
        assert_eq!(notifications.len(), 3);

        // 4. Verifica isolamento - crea un altro profilo
        let other_profile_id = "other_profile";
        let other_create_event = ProfileEvent::ProfileCreated {
            profile_id: other_profile_id.to_string(),
            name: "Other Profile".to_string(),
        };

        integration.lock().await.handle_profile_event(other_create_event).await.unwrap();

        // Verifica che ogni profilo veda solo le proprie notifiche
        let profile1_notifications = manager.lock().await.get_notifications(profile_id, filter.clone()).await.unwrap();
        let profile2_notifications = manager.lock().await.get_notifications(other_profile_id, filter.clone()).await.unwrap();

        assert_eq!(profile1_notifications.len(), 3);
        assert_eq!(profile2_notifications.len(), 1);

        // Verifica che tutte le notifiche appartengano al profilo corretto
        assert!(profile1_notifications.iter().all(|n| n.profile_id == profile_id));
        assert!(profile2_notifications.iter().all(|n| n.profile_id == other_profile_id));

        // 5. Test eliminazione profilo
        let _delete_event = ProfileEvent::ProfileDeleted {
            profile_id: other_profile_id.to_string(),
            name: "Other Profile".to_string(),
        };

        // Prepara il profilo per l'eliminazione
        let deleted_count = event_handler.prepare_profile_for_deletion(other_profile_id).await.unwrap();
        assert_eq!(deleted_count, 1);

        // Verifica che le notifiche del profilo eliminato siano state rimosse
        let remaining_notifications = manager.lock().await.get_notifications(other_profile_id, filter).await.unwrap();
        assert_eq!(remaining_notifications.len(), 0);

        // Verifica che le notifiche dell'altro profilo siano ancora presenti
        let profile1_notifications = manager.lock().await.get_notifications(profile_id, NotificationFilter {
            notification_type: None,
            priority: None,
            unread_only: None,
            category: None,
            limit: None,
            offset: None,
        }).await.unwrap();
        assert_eq!(profile1_notifications.len(), 3);
    }

    #[tokio::test]
    async fn test_unauthorized_cross_profile_operations() {
        let (manager, integration, _) = create_test_system().await;

        let profile1_id = "profile1";
        let profile2_id = "profile2";

        // Crea notifiche per entrambi i profili
        let create_event1 = ProfileEvent::ProfileCreated {
            profile_id: profile1_id.to_string(),
            name: "Profile 1".to_string(),
        };

        let create_event2 = ProfileEvent::ProfileCreated {
            profile_id: profile2_id.to_string(),
            name: "Profile 2".to_string(),
        };

        integration.lock().await.handle_profile_event(create_event1).await.unwrap();
        integration.lock().await.handle_profile_event(create_event2).await.unwrap();

        // Ottieni le notifiche del profilo 1
        let filter = NotificationFilter {
            notification_type: None,
            priority: None,
            unread_only: None,
            category: None,
            limit: None,
            offset: None,
        };

        let profile1_notifications = manager.lock().await.get_notifications(profile1_id, filter).await.unwrap();
        assert_eq!(profile1_notifications.len(), 1);

        let notification_id = profile1_notifications[0].id.clone();

        // Tenta di marcare come letta la notifica del profilo 1 usando il profilo 2
        let result = manager.lock().await.mark_as_read(&notification_id, profile2_id).await;
        assert!(result.is_err(), "Il profilo 2 non dovrebbe poter marcare come letta la notifica del profilo 1");

        // Tenta di eliminare la notifica del profilo 1 usando il profilo 2
        let result = manager.lock().await.delete_notification(&notification_id, profile2_id).await;
        assert!(result.is_err(), "Il profilo 2 non dovrebbe poter eliminare la notifica del profilo 1");

        // Verifica che la notifica sia ancora presente per il profilo 1
        let profile1_notifications = manager.lock().await.get_notifications(profile1_id, NotificationFilter {
            notification_type: None,
            priority: None,
            unread_only: None,
            category: None,
            limit: None,
            offset: None,
        }).await.unwrap();
        assert_eq!(profile1_notifications.len(), 1);
        assert!(!profile1_notifications[0].is_read(), "La notifica non dovrebbe essere stata marcata come letta");
    }

    #[tokio::test]
    async fn test_notification_preferences_isolation() {
        let (manager, _, _) = create_test_system().await;

        let profile1_id = "profile1";
        let profile2_id = "profile2";

        // Ottieni le preferenze predefinite per entrambi i profili
        let prefs1 = manager.lock().await.get_preferences(profile1_id).await.unwrap();
        let prefs2 = manager.lock().await.get_preferences(profile2_id).await.unwrap();

        // Verifica che abbiano ID profilo diversi
        assert_eq!(prefs1.profile_id, profile1_id);
        assert_eq!(prefs2.profile_id, profile2_id);

        // Modifica le preferenze del profilo 1
        let mut modified_prefs1 = prefs1.clone();
        modified_prefs1.global_enabled = false;
        modified_prefs1.sound_enabled = false;

        manager.lock().await.update_preferences(modified_prefs1).await.unwrap();

        // Verifica che solo le preferenze del profilo 1 siano cambiate
        let updated_prefs1 = manager.lock().await.get_preferences(profile1_id).await.unwrap();
        let unchanged_prefs2 = manager.lock().await.get_preferences(profile2_id).await.unwrap();

        assert!(!updated_prefs1.global_enabled);
        assert!(!updated_prefs1.sound_enabled);

        assert!(unchanged_prefs2.global_enabled);
        assert!(unchanged_prefs2.sound_enabled);
    }

    #[tokio::test]
    async fn test_security_report_generation() {
        let (_manager, integration, event_handler) = create_test_system().await;

        let profile_id = "test_profile";

        // Crea alcune notifiche
        let create_event = ProfileEvent::ProfileCreated {
            profile_id: profile_id.to_string(),
            name: "Test Profile".to_string(),
        };

        integration.lock().await.handle_profile_event(create_event).await.unwrap();

        // Genera un report di sicurezza
        let report = event_handler.get_profile_notification_stats(profile_id).await.unwrap();

        assert_eq!(report.total_notifications, 1);
        assert_eq!(report.unread_notifications, 1);
        assert_eq!(report.expired_notifications, 0);

        // Verifica l'integrità del profilo
        let integrity_ok = event_handler.verify_profile_integrity(profile_id).await.unwrap();
        assert!(integrity_ok, "L'integrità del profilo dovrebbe essere OK");
    }

    #[tokio::test]
    async fn test_notification_cleanup_on_profile_switch() {
        let (manager, integration, event_handler) = create_test_system().await;

        let profile1_id = "profile1";
        let profile2_id = "profile2";

        // Crea notifiche per il profilo 1
        let create_event = ProfileEvent::ProfileCreated {
            profile_id: profile1_id.to_string(),
            name: "Profile 1".to_string(),
        };

        integration.lock().await.handle_profile_event(create_event).await.unwrap();

        // Simula cambio profilo
        event_handler.handle_profile_switch_with_cleanup(Some(profile1_id), profile2_id).await.unwrap();

        // Verifica che il cambio profilo sia stato registrato correttamente
        // (Non ci sono notifiche da pulire in questo test, ma il metodo dovrebbe funzionare)

        // Crea notifiche per il nuovo profilo
        let create_event2 = ProfileEvent::ProfileCreated {
            profile_id: profile2_id.to_string(),
            name: "Profile 2".to_string(),
        };

        integration.lock().await.handle_profile_event(create_event2).await.unwrap();

        // Verifica che ogni profilo abbia le proprie notifiche
        let filter = NotificationFilter {
            notification_type: None,
            priority: None,
            unread_only: None,
            category: None,
            limit: None,
            offset: None,
        };

        let profile1_notifications = manager.lock().await.get_notifications(profile1_id, filter.clone()).await.unwrap();
        let profile2_notifications = manager.lock().await.get_notifications(profile2_id, filter).await.unwrap();

        assert_eq!(profile1_notifications.len(), 1);
        assert_eq!(profile2_notifications.len(), 1);

        // Verifica che le notifiche appartengano ai profili corretti
        assert_eq!(profile1_notifications[0].profile_id, profile1_id);
        assert_eq!(profile2_notifications[0].profile_id, profile2_id);
    }
}
