# Audit stringhe hardcoded — GameStringer

> Generato automaticamente (scan AST TypeScript di `app/` e `components/`).

## Riepilogo

- File scansionati: **360**
- File con stringhe hardcoded: **227**
- Totale stringhe hardcoded: **3144**
  - Testo JSX: **2527**
  - Attributi (placeholder/title/aria-label/alt/label): **297**
  - Messaggi (toast/alert/confirm): **320**

> ⚠️ Conteggio euristico con possibili falsi positivi (singole parole, nomi tecnici, simboli). Da usare come mappa di priorità, non come numero esatto.

## Metodologia

Rileva: testo JSX con almeno 2 lettere; valori stringa-letterale negli attributi placeholder/title/aria-label/alt/label/tooltip/description; primo argomento stringa di success/error/info/warning/message/loading/alert/confirm/alert/confirm. Esclude stringhe già passate da `t()` (sono espressioni, non letterali). I file non parsabili al momento dello scan sono saltati.

## Inventario completo (ordinato per numero di stringhe)

| # | Tot | JSX | Attr | Msg | File |
|---|----|----|----|----|------|
| 1 | 98 | 96 | 0 | 2 | `app/auto-translate/page.tsx` |
| 2 | 91 | 58 | 29 | 4 | `app/settings/page.tsx` |
| 3 | 82 | 81 | 1 | 0 | `app/prediction-tool/page.tsx` |
| 4 | 59 | 51 | 2 | 6 | `app/danganronpa-patcher/page.tsx` |
| 5 | 51 | 45 | 6 | 0 | `components/translator/character-voice-editor.tsx` |
| 6 | 49 | 18 | 2 | 29 | `components/game-detail-client.tsx` |
| 7 | 48 | 39 | 7 | 2 | `app/glossary/page.tsx` |
| 8 | 45 | 38 | 3 | 4 | `app/video-extractor/page.tsx` |
| 9 | 44 | 38 | 5 | 1 | `app/cri-patcher/page.tsx` |
| 10 | 44 | 34 | 0 | 10 | `components/profiles/security-dialog.tsx` |
| 11 | 44 | 38 | 6 | 0 | `components/tools/unity-ink-translator.tsx` |
| 12 | 41 | 32 | 2 | 7 | `app/translation-wizard/page.tsx` |
| 13 | 41 | 38 | 2 | 1 | `app/unity-localization/page.tsx` |
| 14 | 40 | 36 | 3 | 1 | `app/bethesda-patcher/page.tsx` |
| 15 | 40 | 34 | 5 | 1 | `components/community-translations.tsx` |
| 16 | 38 | 28 | 5 | 5 | `components/cover-picker.tsx` |
| 17 | 38 | 37 | 0 | 1 | `components/tools/rom-patcher-ui.tsx` |
| 18 | 37 | 34 | 3 | 0 | `components/tools/wad-extractor.tsx` |
| 19 | 37 | 26 | 0 | 11 | `components/translation-recommendation.tsx` |
| 20 | 36 | 33 | 1 | 2 | `app/binary-patcher/page.tsx` |
| 21 | 34 | 12 | 12 | 10 | `app/library/page.tsx` |
| 22 | 33 | 33 | 0 | 0 | `app/unity-csv-translator/page.tsx` |
| 23 | 33 | 28 | 5 | 0 | `components/notifications/notification-center.tsx` |
| 24 | 33 | 23 | 7 | 3 | `components/translation-profile-manager.tsx` |
| 25 | 32 | 30 | 1 | 1 | `app/emulator-translator/page.tsx` |
| 26 | 32 | 18 | 7 | 7 | `app/projects/page.tsx` |
| 27 | 32 | 28 | 4 | 0 | `components/settings/voice-profile-manager.tsx` |
| 28 | 30 | 25 | 4 | 1 | `app/translation-bridge/page.tsx` |
| 29 | 30 | 28 | 1 | 1 | `app/translator/pro/page.tsx` |
| 30 | 29 | 21 | 3 | 5 | `app/editor/page.tsx` |
| 31 | 29 | 22 | 2 | 5 | `components/injekt-ui-enhanced.tsx` |
| 32 | 28 | 27 | 1 | 0 | `app/translator/mtpe/page.tsx` |
| 33 | 28 | 25 | 0 | 3 | `components/ocr-image-processor.tsx` |
| 34 | 27 | 25 | 2 | 0 | `app/context-harvester/page.tsx` |
| 35 | 27 | 26 | 1 | 0 | `components/gamemaker-translator.tsx` |
| 36 | 27 | 25 | 0 | 2 | `components/tools/live-ocr-overlay.tsx` |
| 37 | 26 | 26 | 0 | 0 | `app/prediction-tool/ranking/page.tsx` |
| 38 | 26 | 21 | 1 | 4 | `components/steam-family-sharing.tsx` |
| 39 | 26 | 26 | 0 | 0 | `components/translator-pro/file-selector.tsx` |
| 40 | 25 | 24 | 0 | 1 | `app/dubbing/page.tsx` |
| 41 | 25 | 20 | 2 | 3 | `app/ocr-translator/page.tsx` |
| 42 | 24 | 18 | 2 | 4 | `components/tools/ai-translation-assistant.tsx` |
| 43 | 23 | 13 | 1 | 9 | `components/admin/secrets-dashboard.tsx` |
| 44 | 23 | 21 | 1 | 1 | `components/injekt-overlay-config.tsx` |
| 45 | 23 | 23 | 0 | 0 | `components/ocr/retro-ocr-panel.tsx` |
| 46 | 23 | 21 | 2 | 0 | `components/tools/lip-sync-panel.tsx` |
| 47 | 23 | 15 | 8 | 0 | `components/translator/smart-context-panel.tsx` |
| 48 | 22 | 20 | 2 | 0 | `components/inline-translator.tsx` |
| 49 | 22 | 17 | 3 | 2 | `components/settings/custom-prompt-settings.tsx` |
| 50 | 22 | 19 | 2 | 1 | `components/tools/community-chat.tsx` |
| 51 | 21 | 17 | 2 | 2 | `components/layout/main-layout.tsx` |
| 52 | 21 | 21 | 0 | 0 | `components/settings/fine-tuning-manager.tsx` |
| 53 | 21 | 18 | 1 | 2 | `components/tools/visual-translation-editor.tsx` |
| 54 | 20 | 13 | 6 | 1 | `app/workshop-export/page.tsx` |
| 55 | 20 | 18 | 2 | 0 | `components/translator/mtpe-workflow.tsx` |
| 56 | 19 | 17 | 1 | 1 | `app/ai-pipeline/page.tsx` |
| 57 | 19 | 17 | 2 | 0 | `app/ollama-manager/page.tsx` |
| 58 | 19 | 16 | 1 | 2 | `app/wolfrpg-patcher/page.tsx` |
| 59 | 19 | 12 | 2 | 5 | `components/custom-sorting.tsx` |
| 60 | 19 | 7 | 3 | 9 | `components/extensions/extension-manager.tsx` |
| 61 | 19 | 11 | 1 | 7 | `components/mods/mod-profile-manager.tsx` |
| 62 | 18 | 14 | 0 | 4 | `components/forum/thread-view.tsx` |
| 63 | 18 | 9 | 9 | 0 | `components/glossary/game-context-editor.tsx` |
| 64 | 17 | 6 | 6 | 5 | `app/stores/page.tsx` |
| 65 | 17 | 2 | 2 | 13 | `components/tools/unreal-translator.tsx` |
| 66 | 16 | 16 | 0 | 0 | `app/live-translate/page.tsx` |
| 67 | 16 | 13 | 2 | 1 | `app/renpy-patcher/page.tsx` |
| 68 | 16 | 13 | 2 | 1 | `components/context-aware-translation.tsx` |
| 69 | 16 | 16 | 0 | 0 | `components/donation-dialog.tsx` |
| 70 | 16 | 14 | 2 | 0 | `components/game-detail/game-tools-panel.tsx` |
| 71 | 16 | 13 | 3 | 0 | `components/tools/vision-translator.tsx` |
| 72 | 16 | 10 | 5 | 1 | `components/translator/character-profile-manager.tsx` |
| 73 | 15 | 15 | 0 | 0 | `app/godot-translator/page.tsx` |
| 74 | 15 | 12 | 1 | 2 | `app/ocr-engines/page.tsx` |
| 75 | 15 | 12 | 1 | 2 | `app/rpgmaker-patcher/page.tsx` |
| 76 | 15 | 15 | 0 | 0 | `app/rpgmaker-translator/page.tsx` |
| 77 | 15 | 12 | 0 | 3 | `components/settings/ollama-manager.tsx` |
| 78 | 15 | 13 | 1 | 1 | `components/tools/quality-scoring-dashboard.tsx` |
| 79 | 15 | 14 | 1 | 0 | `components/translator-pro/review-step.tsx` |
| 80 | 14 | 12 | 2 | 0 | `components/advanced-filters.tsx` |
| 81 | 14 | 12 | 0 | 2 | `components/game-detail/auto-translate-stepper.tsx` |
| 82 | 14 | 14 | 0 | 0 | `components/theme/theme-customizer.tsx` |
| 83 | 13 | 5 | 2 | 6 | `components/audio-patcher.tsx` |
| 84 | 13 | 3 | 0 | 10 | `components/audio-translation.tsx` |
| 85 | 13 | 12 | 1 | 0 | `components/library/advanced-filters.tsx` |
| 86 | 13 | 12 | 1 | 0 | `components/modals/steam-modal.tsx` |
| 87 | 13 | 12 | 0 | 1 | `components/translator/adaptive-translation-panel.tsx` |
| 88 | 13 | 13 | 0 | 0 | `components/translator-pro/translation-progress.tsx` |
| 89 | 12 | 5 | 7 | 0 | `components/dashboard/global-progress-widget.tsx` |
| 90 | 12 | 9 | 3 | 0 | `components/profiles/password-recovery-dialog.tsx` |
| 91 | 12 | 12 | 0 | 0 | `components/settings/multi-llm-comparison-settings.tsx` |
| 92 | 12 | 9 | 0 | 3 | `components/tools/batch-translation-queue.tsx` |
| 93 | 11 | 5 | 4 | 2 | `components/admin/logging-dashboard.tsx` |
| 94 | 11 | 10 | 0 | 1 | `components/dashboard/translation-stats-widget.tsx` |
| 95 | 11 | 7 | 4 | 0 | `components/dry-run-scanner.tsx` |
| 96 | 11 | 10 | 0 | 1 | `components/injekt-realtime-stats.tsx` |
| 97 | 11 | 11 | 0 | 0 | `components/social/chat-empty-state.tsx` |
| 98 | 11 | 9 | 0 | 2 | `components/tools/export-dialog.tsx` |
| 99 | 11 | 11 | 0 | 0 | `components/tools/ollama-setup-wizard.tsx` |
| 100 | 11 | 10 | 1 | 0 | `components/translation-batch-editor.tsx` |
| 101 | 11 | 11 | 0 | 0 | `components/translator/background-jobs-widget.tsx` |
| 102 | 11 | 11 | 0 | 0 | `components/translator/pixel-font-preview.tsx` |
| 103 | 11 | 9 | 0 | 2 | `components/translator/tts-preview.tsx` |
| 104 | 11 | 7 | 0 | 4 | `components/ui/error-boundary.tsx` |
| 105 | 10 | 7 | 3 | 0 | `components/progress/progress-modal.tsx` |
| 106 | 10 | 10 | 0 | 0 | `components/settings/tray-notification-preferences.tsx` |
| 107 | 10 | 7 | 2 | 1 | `components/social/friends-sidebar.tsx` |
| 108 | 10 | 8 | 2 | 0 | `components/tools/auto-hook-scanner.tsx` |
| 109 | 10 | 8 | 1 | 1 | `components/tools/steam-workshop-browser.tsx` |
| 110 | 10 | 8 | 2 | 0 | `components/tools/subtitle-overlay.tsx` |
| 111 | 10 | 6 | 4 | 0 | `components/translation-search.tsx` |
| 112 | 10 | 9 | 0 | 1 | `components/ui/error-fallback.tsx` |
| 113 | 9 | 7 | 0 | 2 | `components/error-boundary.tsx` |
| 114 | 9 | 8 | 0 | 1 | `components/intelligent-search.tsx` |
| 115 | 9 | 7 | 0 | 2 | `components/store-manager.tsx` |
| 116 | 8 | 7 | 0 | 1 | `app/activity/page.tsx` |
| 117 | 8 | 8 | 0 | 0 | `app/translator/tools/page.tsx` |
| 118 | 8 | 6 | 0 | 2 | `components/game-detail/unity-assets-panel.tsx` |
| 119 | 8 | 4 | 2 | 2 | `components/tools/translation-history-panel.tsx` |
| 120 | 8 | 8 | 0 | 0 | `components/translator/confidence-heatmap.tsx` |
| 121 | 7 | 5 | 0 | 2 | `app/memory/page.tsx` |
| 122 | 7 | 6 | 0 | 1 | `components/notifications/auto-updater.tsx` |
| 123 | 7 | 7 | 0 | 0 | `components/settings/vram-settings-card.tsx` |
| 124 | 7 | 4 | 3 | 0 | `components/tools/lore-assistant.tsx` |
| 125 | 7 | 1 | 0 | 6 | `components/tools/telltale-patcher.tsx` |
| 126 | 7 | 6 | 1 | 0 | `components/tools/voice-clone-studio.tsx` |
| 127 | 7 | 7 | 0 | 0 | `components/ui/command-palette.tsx` |
| 128 | 6 | 2 | 3 | 1 | `components/forum/new-thread.tsx` |
| 129 | 6 | 5 | 1 | 0 | `components/game-detail/game-update-banner.tsx` |
| 130 | 6 | 6 | 0 | 0 | `components/layout/network-status-bar.tsx` |
| 131 | 6 | 4 | 1 | 1 | `components/layout/persistent-chat.tsx` |
| 132 | 6 | 5 | 1 | 0 | `components/modals/itchio-modal.tsx` |
| 133 | 6 | 3 | 0 | 3 | `components/profiles/avatar-upload.tsx` |
| 134 | 6 | 6 | 0 | 0 | `components/social/chat-panel.tsx` |
| 135 | 6 | 5 | 1 | 0 | `components/tools/player-feedback-panel.tsx` |
| 136 | 6 | 4 | 1 | 1 | `components/tools/unity-patcher.tsx` |
| 137 | 6 | 5 | 0 | 1 | `components/update-notification.tsx` |
| 138 | 5 | 2 | 0 | 3 | `app/auth/steam/verify/page.tsx` |
| 139 | 5 | 5 | 0 | 0 | `app/page.tsx` |
| 140 | 5 | 3 | 2 | 0 | `app/retro/page.tsx` |
| 141 | 5 | 2 | 1 | 2 | `components/debug/login-debug-monitor.tsx` |
| 142 | 5 | 4 | 0 | 1 | `components/forum/forum-home.tsx` |
| 143 | 5 | 2 | 3 | 0 | `components/game-card.tsx` |
| 144 | 5 | 5 | 0 | 0 | `components/game-detail/community-translations-banner.tsx` |
| 145 | 5 | 3 | 2 | 0 | `components/modals/generic-credentials-modal.tsx` |
| 146 | 5 | 5 | 0 | 0 | `components/notifications/update-bell.tsx` |
| 147 | 5 | 3 | 1 | 1 | `components/profiles/profile-selector.tsx` |
| 148 | 5 | 0 | 0 | 5 | `components/scan-button.tsx` |
| 149 | 5 | 5 | 0 | 0 | `components/tools/system-monitor.tsx` |
| 150 | 5 | 4 | 1 | 0 | `components/tools/texture-translator.tsx` |
| 151 | 5 | 5 | 0 | 0 | `components/translation-import-dialog.tsx` |
| 152 | 5 | 5 | 0 | 0 | `components/translator/emotion-badge.tsx` |
| 153 | 4 | 1 | 3 | 0 | `app/blog/page.tsx` |
| 154 | 4 | 2 | 0 | 2 | `app/region-select/page.tsx` |
| 155 | 4 | 4 | 0 | 0 | `app/unity-patcher/page.tsx` |
| 156 | 4 | 4 | 0 | 0 | `components/auth/session-status.tsx` |
| 157 | 4 | 4 | 0 | 0 | `components/game-detail/screenshot-lightbox.tsx` |
| 158 | 4 | 4 | 0 | 0 | `components/game-detail/unreal-localization-panel.tsx` |
| 159 | 4 | 2 | 2 | 0 | `components/layout/global-search.tsx` |
| 160 | 4 | 4 | 0 | 0 | `components/profiles/default-profile-alert.tsx` |
| 161 | 4 | 3 | 0 | 1 | `components/profiles/recovery-key-display.tsx` |
| 162 | 4 | 0 | 0 | 4 | `components/progress/progress-provider.tsx` |
| 163 | 4 | 4 | 0 | 0 | `components/settings/auto-backup-settings.tsx` |
| 164 | 4 | 4 | 0 | 0 | `components/social/social-onboarding.tsx` |
| 165 | 4 | 2 | 0 | 2 | `components/stats-dashboard.tsx` |
| 166 | 4 | 2 | 2 | 0 | `components/tools/debug-console.tsx` |
| 167 | 4 | 3 | 0 | 1 | `components/tools/nexus-mods-browser.tsx` |
| 168 | 4 | 3 | 0 | 1 | `components/tools/universal-injector.tsx` |
| 169 | 4 | 3 | 0 | 1 | `components/translator/batch-folder-translator.tsx` |
| 170 | 4 | 3 | 0 | 1 | `components/translator/multi-llm-compare.tsx` |
| 171 | 4 | 3 | 1 | 0 | `components/translator-pro/game-selector.tsx` |
| 172 | 4 | 1 | 0 | 3 | `components/ui/force-refresh-button.tsx` |
| 173 | 4 | 4 | 0 | 0 | `components/ui/info-tooltip.tsx` |
| 174 | 3 | 1 | 2 | 0 | `app/ai-review/page.tsx` |
| 175 | 3 | 3 | 0 | 0 | `app/ai-translator/page.tsx` |
| 176 | 3 | 1 | 0 | 2 | `app/auth/itchio/callback/page.tsx` |
| 177 | 3 | 3 | 0 | 0 | `app/chat-popup/page.tsx` |
| 178 | 3 | 0 | 3 | 0 | `app/components/HowLongToBeatDisplay.tsx` |
| 179 | 3 | 3 | 0 | 0 | `app/system-monitor/page.tsx` |
| 180 | 3 | 2 | 0 | 1 | `components/profiles/profile-manager.tsx` |
| 181 | 3 | 3 | 0 | 0 | `components/social/quick-access.tsx` |
| 182 | 3 | 3 | 0 | 0 | `components/tools/vr-overlay-panel.tsx` |
| 183 | 3 | 3 | 0 | 0 | `components/translator/translation-insights.tsx` |
| 184 | 3 | 3 | 0 | 0 | `components/tutorial/tutorial-menu.tsx` |
| 185 | 3 | 3 | 0 | 0 | `components/ui/drop-zone.tsx` |
| 186 | 3 | 2 | 1 | 0 | `components/ui/theme-toggle.tsx` |
| 187 | 3 | 3 | 0 | 0 | `components/voice/voice-translator.tsx` |
| 188 | 2 | 2 | 0 | 0 | `app/advanced-tools/page.tsx` |
| 189 | 2 | 2 | 0 | 0 | `app/info/page.tsx` |
| 190 | 2 | 2 | 0 | 0 | `app/plugins/page.tsx` |
| 191 | 2 | 0 | 0 | 2 | `app/unity-bundle/page.tsx` |
| 192 | 2 | 1 | 1 | 0 | `components/auth/auth-status-sidebar.tsx` |
| 193 | 2 | 2 | 0 | 0 | `components/detailed-statistics.tsx` |
| 194 | 2 | 2 | 0 | 0 | `components/game-detail/screenshot-gallery.tsx` |
| 195 | 2 | 0 | 0 | 2 | `components/notifications/profile-notification-settings.tsx` |
| 196 | 2 | 1 | 0 | 1 | `components/offline-translator.tsx` |
| 197 | 2 | 2 | 0 | 0 | `components/onboarding/onboarding-wizard.tsx` |
| 198 | 2 | 2 | 0 | 0 | `components/onboarding/quick-start-guide.tsx` |
| 199 | 2 | 0 | 1 | 1 | `components/profiles/create-profile-dialog.tsx` |
| 200 | 2 | 1 | 0 | 1 | `components/social/add-friend-dialog.tsx` |
| 201 | 2 | 1 | 0 | 1 | `components/social/notifications-panel.tsx` |
| 202 | 2 | 1 | 1 | 0 | `components/social/online-users-widget.tsx` |
| 203 | 2 | 1 | 0 | 1 | `components/social/user-profile.tsx` |
| 204 | 2 | 2 | 0 | 0 | `components/system-overlay.tsx` |
| 205 | 2 | 1 | 1 | 0 | `components/theme-toggle.tsx` |
| 206 | 2 | 1 | 1 | 0 | `components/tools/manga-translator.tsx` |
| 207 | 2 | 2 | 0 | 0 | `components/tools/translation-fixer.tsx` |
| 208 | 2 | 2 | 0 | 0 | `components/translation-stats.tsx` |
| 209 | 2 | 1 | 0 | 1 | `components/translator/subtitle-translator.tsx` |
| 210 | 2 | 1 | 1 | 0 | `components/ui/dialog.tsx` |
| 211 | 1 | 0 | 1 | 0 | `app/heatmap/page.tsx` |
| 212 | 1 | 1 | 0 | 0 | `app/quality-scoring/page.tsx` |
| 213 | 1 | 1 | 0 | 0 | `app/rom-patcher/page.tsx` |
| 214 | 1 | 0 | 0 | 1 | `app/subtitles/page.tsx` |
| 215 | 1 | 1 | 0 | 0 | `app/translator/page.tsx` |
| 216 | 1 | 0 | 0 | 1 | `app/utils/steam-local-files.ts` |
| 217 | 1 | 1 | 0 | 0 | `app/vision-translator/page.tsx` |
| 218 | 1 | 1 | 0 | 0 | `components/notifications/keyboard-shortcuts-help.tsx` |
| 219 | 1 | 0 | 1 | 0 | `components/onboarding/interactive-tutorial.tsx` |
| 220 | 1 | 1 | 0 | 0 | `components/profiles/profile-header.tsx` |
| 221 | 1 | 1 | 0 | 0 | `components/profiles/profile-notifications.tsx` |
| 222 | 1 | 0 | 0 | 1 | `components/profiles/profile-wrapper.tsx` |
| 223 | 1 | 1 | 0 | 0 | `components/progress/progress-bar.tsx` |
| 224 | 1 | 1 | 0 | 0 | `components/progress/progress-notification.tsx` |
| 225 | 1 | 0 | 0 | 1 | `components/tools/qa-checker.tsx` |
| 226 | 1 | 1 | 0 | 0 | `components/ui/featured-game-widget.tsx` |
| 227 | 1 | 1 | 0 | 0 | `components/ui/rss-ticker.tsx` |

## Esempi reali (top 15 file)

### `app/auto-translate/page.tsx` — 98 stringhe

- `identical`
- `[AutoTranslate] Auto-stop: 3 batch consecutivi senza traduzioni`
- `[AutoTranslate] Auto-stop: 5 batch consecutivi senza output`
- `Restart`
- `strings already translated (`
- `) — saved on`

### `app/settings/page.tsx` — 91 stringhe

- `Community Hub — Supabase Backend`
- `https://abcdefgh.supabase.co`
- `eyJhbGciOiJIUzI1NiIs...`
- `Error loading cache stats:`
- `GB totali`
- `% utilizzato •`

### `app/prediction-tool/page.tsx` — 82 stringhe

- `Torna alla Libreria`
- `P.T.`
- `Prediction Tool`
- `Il gioco non è installato. Installalo per analizzare i file.`
- `Scansione profonda dei file di gioco...`
- `Analisi motore, lingue, formati, volume testo`

### `app/danganronpa-patcher/page.tsx` — 59 stringhe

- `Errore caricamento info DRAT:`
- `Errore caricamento info All-Ice:`
- `Errore ricerca giochi Steam:`
- `Errore caricamento backup:`
- `Creazione ZIP in corso... (~626 MB, potrebbe richiedere qualche minuto`
- `Errore calcolo stats LIN:`

### `components/translator/character-voice-editor.tsx` — 51 stringhe

- `Character Voice AI`
- `Profili personalità per traduzioni contestuali`
- `Nuovo Personaggio`
- `Nome personaggio`
- `Es: Captain Blackbeard`
- `Tratti (separati da virgola)`

### `components/game-detail-client.tsx` — 49 stringhe

- `Impossibile trovare cartella gioco:`
- `Errore installazione patch:`
- `Sei sicuro di voler rimuovere la patch Unity AutoTranslator?`
- `Errore rimozione patch Unity:`
- `Nessuna stringa di localizzazione trovata. Verifica che il gioco abbia`
- `[UE AI]`

### `app/glossary/page.tsx` — 48 stringhe

- `Termine aggiunto`
- `Tutti i termini di default sono già presenti`
- `Estrai e gestisci terminologia di gioco per traduzioni consistenti`
- `Config`
- `New Glossary`
- `terms)`

### `app/video-extractor/page.tsx` — 45 stringhe

- `Errore caricamento preset:`
- `Errore scansione:`
- `Errore analisi header:`
- `Errore conversione:`
- `Video Extractor`
- `VMD / BIK / SMK / USM / ROQ`

### `app/cri-patcher/page.tsx` — 44 stringhe

- `Errore selezione cartella:`
- `CRI Middleware Patcher`
- `Persona, Yakuza, Tales of, Dragon Ball, Danganronpa V3`
- `Archive`
- `Seleziona Cartella Gioco`
- `Scegli la cartella di installazione del gioco CRI (contiene file .cpk `

### `components/profiles/security-dialog.tsx` — 44 stringhe

- `Error loading security settings:`
- `Error loading activity logs:`
- `Enter current password`
- `New password must be at least 4 characters`
- `Le password non coincidono`
- `Password changed successfully!`

### `components/tools/unity-ink-translator.tsx` — 44 stringhe

- `Ollama:`
- `file`
- `D:\SteamLibrary\steamapps\common\Esoteric Ebb\Esoteric Ebb_Data`
- `Rileva`
- `Estrai stringhe Ink`
- `Scansione di`

### `app/translation-wizard/page.tsx` — 41 stringhe

- `[TranslationWizard] Render error:`
- `Error loading settings:`
- `[Wizard] Errore auto-start:`
- `Error loading games:`
- `Analysis error:`
- `[Wizard] Scan error:`

### `app/unity-localization/page.tsx` — 41 stringhe

- `Errore selezione cartella:`
- `Unity Localization Package`
- `StringTable, Smart Strings e cataloghi Addressables`
- `Smart`
- `Strings`
- `Seleziona Cartella Progetto`

### `app/bethesda-patcher/page.tsx` — 40 stringhe

- `Errore selezione cartella:`
- `Bethesda Engine Patcher`
- `Skyrim, Fallout 4, Starfield, Oblivion, Fallout 3/NV`
- `/BA2`
- `/ESM`
- `Seleziona Cartella Gioco`

### `components/community-translations.tsx` — 40 stringhe

- `Compila tutti i campi obbligatori`
- `Traduzioni Community`
- `Collabora con la community per migliorare le traduzioni`
- `Nuova Traduzione`
- `Aiuta la community con una nuova traduzione`
- `🇺🇸 Inglese`

