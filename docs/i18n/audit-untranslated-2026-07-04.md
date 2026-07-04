# Audit i18n — copertura traduzioni (lib/i18n/locales)

Data: 2026-07-04  ·  Lingue: it, en, es, fr, de, ja, zh, ko, pt, ru, pl, el  ·  Chiavi riferimento (it): 6354

## 1. Parità chiavi

| Lingua | #chiavi | Mancanti vs it |
|---|---:|---:|
| it | 6354 | 0 |
| en | 6354 | 0 |
| es | 6265 | 89 |
| fr | 6265 | 89 |
| de | 6265 | 89 |
| ja | 6265 | 89 |
| zh | 6265 | 89 |
| ko | 6354 | 0 |
| pt | 6354 | 0 |
| ru | 6354 | 0 |
| pl | 6354 | 0 |
| el | 6354 | 0 |

**Esito:** es/fr/de/ja/zh mancano di 89 chiavi (identiche in tutte e 5), tutte array `guidePage.*`. Le altre lingue sono complete come chiavi.

### 89 chiavi mancanti (es, fr, de, ja, zh)

- `guidePage.autoDetectLanguageDetails[0]`
- `guidePage.autoDetectLanguageDetails[1]`
- `guidePage.autoDetectLanguageDetails[2]`
- `guidePage.autoDetectLanguageDetails[3]`
- `guidePage.autoDetectLanguageDetails[4]`
- `guidePage.customGlossaryDetails[0]`
- `guidePage.customGlossaryDetails[1]`
- `guidePage.customGlossaryDetails[2]`
- `guidePage.customGlossaryDetails[3]`
- `guidePage.customGlossaryDetails[4]`
- `guidePage.customGlossaryDetails[5]`
- `guidePage.dictionaryFeatures[0]`
- `guidePage.dictionaryFeatures[1]`
- `guidePage.dictionaryFeatures[2]`
- `guidePage.dictionaryFeatures[3]`
- `guidePage.dictionaryFeatures[4]`
- `guidePage.dictionaryFeatures[5]`
- `guidePage.dictionaryNewDetails[0]`
- `guidePage.dictionaryNewDetails[1]`
- `guidePage.dictionaryNewDetails[2]`
- `guidePage.dictionaryNewDetails[3]`
- `guidePage.dictionaryNewDetails[4]`
- `guidePage.gameLibraryFeatures[0]`
- `guidePage.gameLibraryFeatures[1]`
- `guidePage.gameLibraryFeatures[2]`
- `guidePage.gameLibraryFeatures[3]`
- `guidePage.globalHotkeysDetails[0]`
- `guidePage.globalHotkeysDetails[1]`
- `guidePage.globalHotkeysDetails[2]`
- `guidePage.globalHotkeysDetails[3]`
- `guidePage.multiLlmCompareFeatures[0]`
- `guidePage.multiLlmCompareFeatures[1]`
- `guidePage.multiLlmCompareFeatures[2]`
- `guidePage.multiLlmCompareFeatures[3]`
- `guidePage.multiLlmCompareFeatures[4]`
- `guidePage.multiLlmCompareFeatures[5]`
- `guidePage.multiLlmCompareNewDetails[0]`
- `guidePage.multiLlmCompareNewDetails[1]`
- `guidePage.multiLlmCompareNewDetails[2]`
- `guidePage.multiLlmCompareNewDetails[3]`
- `guidePage.multiLlmCompareNewDetails[4]`
- `guidePage.neuralTranslatorFeatures[0]`
- `guidePage.neuralTranslatorFeatures[1]`
- `guidePage.neuralTranslatorFeatures[2]`
- `guidePage.neuralTranslatorFeatures[3]`
- `guidePage.neuralTranslatorFeatures[4]`
- `guidePage.ocrTranslatorFeatures[0]`
- `guidePage.ocrTranslatorFeatures[1]`
- `guidePage.ocrTranslatorFeatures[2]`
- `guidePage.ocrTranslatorFeatures[3]`
- `guidePage.ocrTranslatorFeatures[4]`
- `guidePage.telltalePatcherFeatures[0]`
- `guidePage.telltalePatcherFeatures[1]`
- `guidePage.telltalePatcherFeatures[2]`
- `guidePage.telltalePatcherFeatures[3]`
- `guidePage.telltalePatcherFeatures[4]`
- `guidePage.telltalePatcherFeatures[5]`
- `guidePage.translationHistoryDetails[0]`
- `guidePage.translationHistoryDetails[1]`
- `guidePage.translationHistoryDetails[2]`
- `guidePage.translationHistoryDetails[3]`
- `guidePage.translationHistoryDetails[4]`
- `guidePage.translationHistoryDetails[5]`
- `guidePage.ueTranslatorFeatures[0]`
- `guidePage.ueTranslatorFeatures[1]`
- `guidePage.ueTranslatorFeatures[2]`
- `guidePage.ueTranslatorFeatures[3]`
- `guidePage.uiLanguageSelectorDetails[0]`
- `guidePage.uiLanguageSelectorDetails[1]`
- `guidePage.uiLanguageSelectorDetails[2]`
- `guidePage.uiLanguageSelectorDetails[3]`
- `guidePage.uiLanguageSelectorDetails[4]`
- `guidePage.unityPatcherFeatures[0]`
- `guidePage.unityPatcherFeatures[1]`
- `guidePage.unityPatcherFeatures[2]`
- `guidePage.unityPatcherFeatures[3]`
- `guidePage.unityPatcherFeatures[4]`
- `guidePage.unityPatcherFeatures[5]`
- `guidePage.voiceTranslatorFeatures[0]`
- `guidePage.voiceTranslatorFeatures[1]`
- `guidePage.voiceTranslatorFeatures[2]`
- `guidePage.voiceTranslatorFeatures[3]`
- `guidePage.voiceTranslatorFeatures[4]`
- `guidePage.voiceTranslatorFeatures[5]`
- `guidePage.voiceTranslatorNewDetails[0]`
- `guidePage.voiceTranslatorNewDetails[1]`
- `guidePage.voiceTranslatorNewDetails[2]`
- `guidePage.voiceTranslatorNewDetails[3]`
- `guidePage.voiceTranslatorNewDetails[4]`

## 2. Valori non tradotti (fallback inglese)

Valori di prosa identici all'inglese e diversi dall'italiano (esclusi acronimi/placeholder/termini universali).

| Lingua | Stringhe non tradotte |
|---|---:|
| es | 711 |
| fr | 705 |
| de | 712 |
| ja | 701 |
| zh | 702 |
| ko | 700 |
| pt | 703 |
| ru | 700 |
| pl | 703 |
| el | 700 |

**700 chiavi** risultano NON tradotte in **tutte e 10** le lingue (stesso blocco di stringhe rimaste in inglese ovunque).

### Distribuzione per sezione (le 700 comuni)

| Sezione | # |
|---|---:|
| guidePage | 33 |
| translationRecommendationComp | 27 |
| danganronpaPatcher | 25 |
| securityDialog | 25 |
| romPatcher | 23 |
| characterVoiceEditor | 20 |
| criPatcher | 20 |
| gameDetail | 20 |
| communityTranslations | 18 |
| injektUi | 18 |
| unityLoc | 17 |
| customPromptSettings | 16 |
| translationProfileManager | 16 |
| videoExtractor | 16 |
| contextHarvesterPage | 15 |
| coverPicker | 15 |
| fileSelector | 15 |
| glossaryPage | 15 |
| secretsDashboardComp | 15 |
| steamFamilySharing | 15 |
| wadExtractor | 15 |
| autoTranslatePage | 14 |
| editorPage | 14 |
| ocrImageProcessor | 14 |
| communityChat | 13 |
| projectsPage | 13 |
| dubbingPage | 12 |
| notificationCenter | 12 |
| translationBridge | 12 |
| translationWizard | 12 |
| bethPatcher | 11 |
| binaryPatcherPage | 11 |
| gameMakerTranslator | 11 |
| unityInkTranslator | 11 |
| voiceProfileManager | 11 |
| lipSyncPanel | 10 |
| ocrTranslator | 10 |
| smartContextPanelComp | 10 |
| fineTuningManager | 9 |
| inlineTranslatorComp | 9 |
| predictionRankingPage | 9 |
| retroOcrPanel | 9 |
| visualTranslationEditor | 9 |
| emulatorTranslator | 8 |
| liveOcrOverlay | 8 |
| translatorProPage | 7 |
| unityCsvPage | 7 |
| aiTranslationAssistant | 6 |
| mtpePage | 6 |
| injektOverlayConfigComp | 5 |
| settingsPage | 4 |
| mainLayout | 3 |
| patchHubPage | 1 |

### Elenco completo delle 700 chiavi non tradotte (comuni a tutte le lingue)

- `aiTranslationAssistant.contextPh` — EN: "e.g. medieval fantasy"
- `aiTranslationAssistant.copiedToClipboard` — EN: "Copied to clipboard"
- `aiTranslationAssistant.enterText` — EN: "Enter text to translate"
- `aiTranslationAssistant.gameNamePh` — EN: "e.g. The Witcher 3"
- `aiTranslationAssistant.ollamaNotDetected` — EN: "Ollama not detected."
- `aiTranslationAssistant.termAdded` — EN: "Term added to glossary"
- `autoTranslatePage.backToReview` — EN: "Back to Review"
- `autoTranslatePage.createPatch` — EN: "Create Patch"
- `autoTranslatePage.downloadZip` — EN: "Download ZIP"
- `autoTranslatePage.exportAs` — EN: "Export As (standard formats)"
- `autoTranslatePage.filesInPatch` — EN: "Files in Patch"
- `autoTranslatePage.filesLoadedAuto` — EN: ". Game files will be loaded automatically."
- `autoTranslatePage.freeLimitReached` — EN: "Free services (Lingva, MyMemory) have reached their request limit. Translations completed so far have been saved."
- `autoTranslatePage.openGameClick` — EN: ", open a game and click"
- `autoTranslatePage.progressSaved` — EN: "Progress is saved automatically. You can resume at any time."
- `autoTranslatePage.stringsTranslated` — EN: "strings translated"
- `autoTranslatePage.thanksAuthors` — EN: "Thanks to the original authors for their incredible open-source work."
- `autoTranslatePage.toTranslateOffline` — EN: "to translate offline without limits"
- `autoTranslatePage.translateAll` — EN: "Translate all"
- `autoTranslatePage.translateAllQuoted` — EN: "\"Translate All\""
- `bethPatcher.backToEditor` — EN: "Back to Editor"
- `bethPatcher.exportOptions` — EN: "Export Options"
- `bethPatcher.noResults` — EN: "No results found"
- `bethPatcher.selectFolderDesc` — EN: "Choose the main folder of the Bethesda game (containing the Data folder)"
- `bethPatcher.selectGameFolder` — EN: "Select Game Folder"
- `bethPatcher.sourceLanguage` — EN: "Source language"
- `bethPatcher.stringTablesUnit` — EN: "string tables"
- `bethPatcher.targetLanguage` — EN: "Target language"
- `bethPatcher.toClipboard` — EN: "To clipboard"
- `bethPatcher.translateAll` — EN: "Translate All"
- `bethPatcher.translationSummary` — EN: "Translation Summary"
- `binaryPatcherPage.antiCheatDetected` — EN: "Anti-cheat detected:"
- `binaryPatcherPage.extractStrings` — EN: "Extract strings from binary"
- `binaryPatcherPage.goToReview` — EN: "Go to Review"
- `binaryPatcherPage.resumeTranslation` — EN: "Resume translation"
- `binaryPatcherPage.searchPh` — EN: "Search strings..."
- `binaryPatcherPage.selectExeDll` — EN: "Select a game .exe or .dll to extract translatable strings"
- `binaryPatcherPage.showing200Of` — EN: "Showing 200 of"
- `binaryPatcherPage.stopTranslation` — EN: "Stop translation"
- `binaryPatcherPage.translatedStrings` — EN: "translated strings"
- `binaryPatcherPage.translationMethod` — EN: "Translation method"
- `binaryPatcherPage.useSearchFilter` — EN: "— use search to filter"
- `characterVoiceEditor.charName` — EN: "Character name"
- `characterVoiceEditor.charNamePlaceholder` — EN: "e.g. Captain Blackbeard"
- `characterVoiceEditor.createCharacter` — EN: "Create Character"
- `characterVoiceEditor.createFirst` — EN: "Create the first one!"
- `characterVoiceEditor.fillers` — EN: "Fillers (comma-separated)"
- `characterVoiceEditor.fillersPlaceholder` — EN: "um, like, you know"
- `characterVoiceEditor.formalityVeryFormal` — EN: "👔 Very formal"
- `characterVoiceEditor.formalityVeryInformal` — EN: "🎸 Very informal"
- `characterVoiceEditor.newCharacter` — EN: "New Character"
- `characterVoiceEditor.originalText` — EN: "Original text (EN)"
- `characterVoiceEditor.originalTextPlaceholder` — EN: "Enter a dialogue to translate..."
- `characterVoiceEditor.substitutions` — EN: "Preferred substitutions (word=replacement, one per line)"
- `characterVoiceEditor.subtitle` — EN: "Personality profiles for contextual translations"
- `characterVoiceEditor.testTranslation` — EN: "Translation Test"
- `characterVoiceEditor.traits` — EN: "Traits (comma-separated)"
- `characterVoiceEditor.traitsPlaceholder` — EN: "e.g. brave, sarcastic, loyal"
- `characterVoiceEditor.translateWithPersonality` — EN: "Translate with Personality"
- `characterVoiceEditor.translation` — EN: "Translation (IT)"
- `characterVoiceEditor.typicalPhrases` — EN: "Typical phrases (one per line)"
- `characterVoiceEditor.typicalPhrasesPlaceholder` — EN: "Arrr!\nShiver me timbers!"
- `communityChat.catGame` — EN: "Specific game"
- `communityChat.catTranslation` — EN: "Translation request"
- `communityChat.configBackend` — EN: "To use the chat, configure the Supabase backend in"
- `communityChat.editMessage` — EN: "Edit message"
- `communityChat.loginPrompt` — EN: "Log in to GameStringer to join the community chat."
- `communityChat.mustLogin` — EN: "You must log in to GameStringer first."
- `communityChat.noMessages` — EN: "No messages. Start the conversation!"
- `communityChat.replyToMessage` — EN: "↳ reply to a message"
- `communityChat.replyingTo` — EN: "↳ Replying to"
- `communityChat.retryConnection` — EN: "Retry connection"
- `communityChat.roomDescPh` — EN: "What is this room about?"
- `communityChat.roomNamePh` — EN: "e.g. Hollow Knight IT"
- `communityChat.settingsPath` — EN: "Settings → Community Hub Backend"
- `communityTranslations.activeContributors` — EN: "Active Contributors"
- `communityTranslations.allStatuses` — EN: "All statuses"
- `communityTranslations.contextOptional` — EN: "Context (optional)"
- `communityTranslations.contextPh` — EN: "Describe the translation context..."
- `communityTranslations.feedbackDesc` — EN: "Provide feedback to help improve the translation"
- `communityTranslations.feedbackPh` — EN: "Write your feedback..."
- `communityTranslations.fillAllFields` — EN: "Fill in all required fields"
- `communityTranslations.newTranslation` — EN: "New Translation"
- `communityTranslations.newTranslationDesc` — EN: "Help the community with a new translation"
- `communityTranslations.originalTextPh` — EN: "Enter the original text..."
- `communityTranslations.searchPh` — EN: "Search translations..."
- `communityTranslations.submitReview` — EN: "Submit Review"
- `communityTranslations.submitTranslation` — EN: "Submit Translation"
- `communityTranslations.subtitle` — EN: "Collaborate with the community to improve translations"
- `communityTranslations.targetLanguage` — EN: "Target Language"
- `communityTranslations.title` — EN: "Community Translations"
- `communityTranslations.totalTranslations` — EN: "Total Translations"
- `communityTranslations.yourTranslationPh` — EN: "Enter your translation..."
- `contextHarvesterPage.allUppercase` — EN: "All uppercase"
- `contextHarvesterPage.analyzedStrings` — EN: "Analyzed Strings"
- `contextHarvesterPage.charsMaxAvg` — EN: "avg max chars"
- `contextHarvesterPage.clickStringPrompt` — EN: "Click a string to see the extracted context"
- `contextHarvesterPage.demoBtn` — EN: "Demo (30 strings)"
- `contextHarvesterPage.demoDesc` — EN: "30 example strings from a generic RPG — menus, dialogues, combat, inventory, quests, system."
- `contextHarvesterPage.gameNamePh` — EN: "e.g. The Elder Scrolls"
- `contextHarvesterPage.genrePh` — EN: "e.g. RPG, Visual Novel, FPS"
- `contextHarvesterPage.inputStrings` — EN: "Strings Input"
- `contextHarvesterPage.loadFileDesc` — EN: "Load JSON, CSV or TXT file"
- `contextHarvesterPage.promptHintGenerated` — EN: "Generated Prompt Hint (auto-injected)"
- `contextHarvesterPage.saveForGame` — EN: "Save for Game"
- `contextHarvesterPage.savedHarvests` — EN: "Saved Harvests"
- `contextHarvesterPage.withPlaceholder` — EN: "with placeholders"
- `contextHarvesterPage.withUiConstraints` — EN: "with UI constraints"
- `coverPicker.apiKeyNeeded` — EN: "A free API Key is required to search covers on SteamGridDB."
- `coverPicker.apiKeyPh` — EN: "Paste your API Key here..."
- `coverPicker.chooseCoverFor` — EN: "Choose Cover for"
- `coverPicker.coversAvailable` — EN: "covers available"
- `coverPicker.getApiKey` — EN: "Get your free API Key"
- `coverPicker.invalidUrl` — EN: "Invalid URL or inaccessible image"
- `coverPicker.searchGoogle` — EN: "Search on Google"
- `coverPicker.searchGoogleImages` — EN: "Search on Google Images"
- `coverPicker.searchMoreGoogle` — EN: "Search more covers on Google Images"
- `coverPicker.searchingWeb` — EN: "Searching covers on the web..."
- `coverPicker.subtitle` — EN: "Select your preferred cover from SteamGridDB"
- `coverPicker.supportedFormats` — EN: "Supports: JPG, PNG, GIF, WebP, Steam CDN, IGDB"
- `coverPicker.tryManualUrl` — EN: "Try Manual URL or search on Google Images"
- `coverPicker.useThisCover` — EN: "Use this cover"
- `coverPicker.webCoversInfo` — EN: "Covers found from MobyGames, TheGamesDB and other sources. Click to select."
- `criPatcher.allSpeakers` — EN: "All speakers"
- `criPatcher.backToEditor` — EN: "Back to Editor"
- `criPatcher.backToEditorAria` — EN: "Back to editor"
- `criPatcher.cpkArchives` — EN: "CPK Archives"
- `criPatcher.cpkArchivesFound` — EN: "CPK archives found"
- `criPatcher.cpkContents` — EN: "CPK Contents"
- `criPatcher.exportOptions` — EN: "Export Options"
- `criPatcher.gameDetected` — EN: "Game Detected"
- `criPatcher.goToExportAria` — EN: "Proceed to export"
- `criPatcher.loadingContents` — EN: "Loading contents..."
- `criPatcher.noResults` — EN: "No results found"
- `criPatcher.searchPh` — EN: "Search key, text or speaker..."
- `criPatcher.selectArchivePrompt` — EN: "Select a CPK archive to view its content"
- `criPatcher.selectFolderDesc` — EN: "Choose the installation folder of the CRI game (contains .cpk or .par files)"
- `criPatcher.selectGameFolder` — EN: "Select Game Folder"
- `criPatcher.toClipboard` — EN: "To clipboard"
- `criPatcher.toTranslate` — EN: "To translate"
- `criPatcher.translateAll` — EN: "Translate All"
- `criPatcher.translationSummary` — EN: "Translation Summary"
- `criPatcher.withSpeaker` — EN: "With Speaker"
- `customPromptSettings.customPrompt` — EN: "Custom Prompt"
- `customPromptSettings.customPromptDesc` — EN: "Additional instructions that will be added to the system prompt"
- `customPromptSettings.customPromptPh` — EN: "E.g.: Use archaic vocabulary, speak formally, use fantasy-specific terms..."
- `customPromptSettings.enableCustomPrompt` — EN: "Enable Custom Prompt"
- `customPromptSettings.enableDesc` — EN: "Adds custom instructions to all translations"
- `customPromptSettings.personaDesc` — EN: "Translate as if you were this character"
- `customPromptSettings.personaPh` — EN: "Select a persona..."
- `customPromptSettings.personaRole` — EN: "Persona / Role"
- `customPromptSettings.preserveVoice` — EN: "Preserve original voice characteristics"
- `customPromptSettings.preserveVoiceDesc` — EN: "Keeps tone, emphasis and style of the original voice (beta)"
- `customPromptSettings.settingsReset` — EN: "Settings reset"
- `customPromptSettings.settingsSaved` — EN: "Custom Prompt settings saved"
- `customPromptSettings.subtitle` — EN: "Customize LLM provider behavior with persona, tone and custom prompt"
- `customPromptSettings.tonePh` — EN: "Select a tone..."
- `customPromptSettings.toneStyle` — EN: "Tone / Style"
- `customPromptSettings.voiceDesc` — EN: "Real-time voice translation (40+ languages)"
- `danganronpaPatcher.applyItalianPatch` — EN: "Apply Italian Patch"
- `danganronpaPatcher.backupsAvailable` — EN: "Available Backups"
- `danganronpaPatcher.compressingWad` — EN: "Compressing WAD (~626 MB)... may take a few minutes"
- `danganronpaPatcher.creatingZip` — EN: "Creating ZIP... (~626 MB, may take a few minutes)"
- `danganronpaPatcher.descInstaller` — EN: "— Automatic Steam installer"
- `danganronpaPatcher.descReadme` — EN: "— Installation instructions"
- `danganronpaPatcher.descTranslations` — EN: "— Source translations"
- `danganronpaPatcher.descWadPatched` — EN: "— Italian patched WAD"
- `danganronpaPatcher.downloadDrat` — EN: "Download DRAT"
- `danganronpaPatcher.errCalcLin` — EN: "Error computing LIN stats:"
- `danganronpaPatcher.errLoadAllIce` — EN: "Error loading All-Ice info:"
- `danganronpaPatcher.errLoadBackup` — EN: "Error loading backups:"
- `danganronpaPatcher.errLoadDrat` — EN: "Error loading DRAT info:"
- `danganronpaPatcher.errSearchSteam` — EN: "Error searching Steam games:"
- `danganronpaPatcher.exportPatch` — EN: "Export Distributable Patch"
- `danganronpaPatcher.exportPatchDesc` — EN: ".zip with WAD, installer and instructions"
- `danganronpaPatcher.linDialogues` — EN: "LIN Script Dialogues"
- `danganronpaPatcher.onlyUntranslated` — EN: "Only untranslated"
- `danganronpaPatcher.searchDialogues` — EN: "Search dialogues or characters..."
- `danganronpaPatcher.searchTexts` — EN: "Search texts..."
- `danganronpaPatcher.selectGameFirst` — EN: "Select a game from the Steam list first"
- `danganronpaPatcher.selectWadPatch` — EN: "Select WAD Patch File"
- `danganronpaPatcher.steamGamesDetected` — EN: "Detected Steam Games"
- `danganronpaPatcher.translateWithAi` — EN: "Translate with AI"
- `danganronpaPatcher.translationsPo` — EN: "PO Translations"
- `dubbingPage.audioSegments` — EN: "Audio segments"
- `dubbingPage.defaultVoice` — EN: "Default voice"
- `dubbingPage.generateSubtitles` — EN: "Generate subtitles"
- `dubbingPage.groqWhisper` — EN: "Groq Whisper (fast)"
- `dubbingPage.labsExperimental` — EN: "Labs · Experimental"
- `dubbingPage.labsWarning1` — EN: "Labs · experimental feature."
- `dubbingPage.labsWarning2` — EN: "AI dubbing (Whisper → translation → TTS) may have imperfections in"
- `dubbingPage.labsWarning3` — EN: ". It's not part of the \"one button\" flow and does not replace professional dubbing. Keep a backup of the audio files before applying."
- `dubbingPage.selectFolderPrompt` — EN: "Select a game folder to start automatic dubbing. The pipeline will run: audio scan → Whisper transcription → AI translation → voice synthesis → audio file patching."
- `dubbingPage.startDubbing` — EN: "Start Dubbing"
- `dubbingPage.timingVoices` — EN: "timing and voices"
- `dubbingPage.voiceProvider` — EN: "Voice & Provider"
- `editorPage.cacheHit` — EN: "Translation found in cache"
- `editorPage.cannotGenerateSuggestions` — EN: "Unable to generate suggestions"
- `editorPage.confirmDelete` — EN: "Delete this translation?"
- `editorPage.fileProgress` — EN: "File Progress"
- `editorPage.lockedTermTitle` — EN: "Locked term (high priority)"
- `editorPage.notTranslated` — EN: "— not translated —"
- `editorPage.offlineUnavailable` — EN: "Offline - translation not available"
- `editorPage.searchPh` — EN: "Search string or game..."
- `editorPage.selectStringFirst` — EN: "Select a string to translate first"
- `editorPage.selectStringPrompt` — EN: "Select a string from the list to start editing the translation"
- `editorPage.startEditingHint` — EN: "to start editing the translation"
- `editorPage.translateAi` — EN: "AI Translate"
- `editorPage.translationArea` — EN: "Translation Area"
- `editorPage.translationPh` — EN: "Enter the translation for this string..."
- `emulatorTranslator.captureInterval` — EN: "Capture interval"
- `emulatorTranslator.clipboardError` — EN: "Unable to read clipboard"
- `emulatorTranslator.dragScreenshot` — EN: "Drag a screenshot of the emulator"
- `emulatorTranslator.emulatorWindow` — EN: "Emulator window"
- `emulatorTranslator.intervalHint` — EN: "Lower intervals = more responsive but more CPU. For games with slowly changing text (JRPG), 2-3 seconds are enough."
- `emulatorTranslator.liveCapture` — EN: "Live Capture"
- `emulatorTranslator.ocrInProgress` — EN: "OCR + translation in progress..."
- `emulatorTranslator.startCapture` — EN: "Start capture"
- `fileSelector.analyzingGame` — EN: "Analyzing game..."
- `fileSelector.andOthers1` — EN: "...and others"
- `fileSelector.andOthersMore` — EN: "... and another"
- `fileSelector.dragOrClick` — EN: "Drag or click •"
- `fileSelector.excludedFiles` — EN: "Excluded files"
- `fileSelector.filesToTranslate` — EN: "Files to translate"
- `fileSelector.fromWizard` — EN: "Coming from the Translation Wizard"
- `fileSelector.goToUnityPatcher` — EN: "Go to Unity Patcher"
- `fileSelector.loadEnTranslateIt` — EN: "Load EN → Translate IT"
- `fileSelector.orLoadManually` — EN: "or load manually"
- `fileSelector.recommendedMethod` — EN: "Recommended method:"
- `fileSelector.removeUnselected` — EN: "Remove unselected"
- `fileSelector.searchTranslationFiles` — EN: "Search translation files"
- `fileSelector.stringsToTranslate` — EN: "strings to translate"
- `fileSelector.xunityDesc` — EN: "XUnity AutoTranslator intercepts the game text in real time and lets you translate it."
- `fineTuningManager.exportFormat` — EN: "Export Format"
- `fineTuningManager.fineTunedModels` — EN: "Fine-Tuned Models"
- `fineTuningManager.fromLang` — EN: "From language"
- `fineTuningManager.generateDataset` — EN: "Generate Dataset"
- `fineTuningManager.noDataset` — EN: "No dataset. Correct some translations and generate your first dataset."
- `fineTuningManager.noModels` — EN: "No fine-tuned model. Generate a dataset and start training."
- `fineTuningManager.onlyApproved` — EN: "Only approved corrections"
- `fineTuningManager.subtitle` — EN: "Generate training datasets from your human corrections and manage custom per-game models."
- `fineTuningManager.totalExamples` — EN: "total examples"
- `gameDetail.alertSaveError` — EN: "Error saving translation"
- `gameDetail.backToLibrary` — EN: "Back to Library"
- `gameDetail.confirmRemoveTranslation` — EN: "Are you sure you want to remove the translation patch?"
- `gameDetail.confirmRemoveUnity` — EN: "Are you sure you want to remove the Unity AutoTranslator patch?"
- `gameDetail.errHendrix` — EN: "Hendrix: error (is Ollama running?)"
- `gameDetail.errNoLocStrings` — EN: "No localization strings found. Make sure the game has .locres or .pak files."
- `gameDetail.errNoStringsCaptured` — EN: "No strings captured. Launch the game at least once with BepInEx installed."
- `gameDetail.errRenpy` — EN: "Ren'Py: error (is Ollama running?)"
- `gameDetail.errRpgMaker` — EN: "RPG Maker: error (is Ollama running?)"
- `gameDetail.errUnsupported` — EN: "Unsupported engine or no extractable strings"
- `gameDetail.loadingHendrixApply` — EN: "Hendrix: applying the language column..."
- `gameDetail.loadingHendrixEnable` — EN: "Hendrix: enabling plugin and language..."
- `gameDetail.loadingHendrixExtract` — EN: "Hendrix: extracting strings..."
- `gameDetail.notInLibrary` — EN: "The requested game is not in your library."
- `gameDetail.openMetacritic` — EN: "Open on Metacritic"
- `gameDetail.predictiveAnalysis` — EN: "Predictive Analysis"
- `gameDetail.ptDesc` — EN: "P.T. analyzes the game structure and suggests the optimal configuration for translation."
- `gameDetail.runPtFirst` — EN: "Run P.T. first"
- `gameDetail.translateAnyway` — EN: "Translate anyway"
- `gameDetail.translateIn` — EN: "Translate to"
- `gameMakerTranslator.aiTranslationLabel` — EN: "AI Translation:"
- `gameMakerTranslator.analyzing` — EN: "Analysis in progress..."
- `gameMakerTranslator.clickExtractPrompt` — EN: "Click \"Extract Strings\" to start"
- `gameMakerTranslator.dataWinNotFound` — EN: "data.win not found in this folder"
- `gameMakerTranslator.extractStrings` — EN: "Extract Strings"
- `gameMakerTranslator.noteText` — EN: "An automatic backup (data.win.bak) is created before every change. Use \"Restore\" to return to the original. Translations longer than the original will be truncated for compatibility with the GameMaker format."
- `gameMakerTranslator.onlyUntranslated` — EN: "Only untranslated"
- `gameMakerTranslator.searchPh` — EN: "Search strings..."
- `gameMakerTranslator.translateAll` — EN: "Translate All"
- `gameMakerTranslator.translatePage` — EN: "Translate Page"
- `gameMakerTranslator.willExtractDesc` — EN: "Translatable strings will be extracted from data.win"
- `glossaryPage.aiExtraction` — EN: "AI Extraction"
- `glossaryPage.defaultsPresent` — EN: "All default terms are already present"
- `glossaryPage.extractionDesc1` — EN: "Analyze the game texts with an LLM to automatically identify character names, places, items, skills and other terms to translate consistently."
- `glossaryPage.extractionDesc2` — EN: "Extraction uses the active provider in the translation chain. Extracted terms are automatically classified by tier and category. You can then review and edit them manually."
- `glossaryPage.maxTermsExtraction` — EN: "Max terms per extraction:"
- `glossaryPage.maxTermsPrompt` — EN: "Max terms in prompt:"
- `glossaryPage.minConfidence` — EN: "Min confidence:"
- `glossaryPage.phContext` — EN: "e.g. Final boss name"
- `glossaryPage.phSource` — EN: "e.g. Dragon Slayer"
- `glossaryPage.phTarget` — EN: "e.g. Dragon Slayer (translated)"
- `glossaryPage.removeGlossary` — EN: "Removes the glossary and all terms for this game"
- `glossaryPage.subtitle` — EN: "Extract and manage game terminology for consistent translations"
- `glossaryPage.tierFluidDesc` — EN: "Dialogue, descriptions. Can adapt to context."
- `glossaryPage.tierLockedDesc` — EN: "Proper nouns, places. Never editable. Always identical everywhere."
- `glossaryPage.tierSyncDesc` — EN: "UI, menus, system. Updated together for consistency."
- `guidePage.brainIcon` — EN: "Brain icon (purple)"
- `guidePage.dryErrors` — EN: "Corrupt manifest / blocking DRM"
- `guidePage.dryGamesBatch` — EN: "your Steam games (800+) in batch"
- `guidePage.dryIdentify` — EN: ". Identifies which are translatable and with which engine."
- `guidePage.dryLaunchDesc` — EN: ". Real-time progress, no file touched. When finished, JSON report saved in"
- `guidePage.dryNoModify` — EN: "without modifying any file"
- `guidePage.dryReady` — EN: "Supported engine + extractable strings"
- `guidePage.dryRunFlow` — EN: "Dry run flow"
- `guidePage.dryRunTitle` — EN: "Dry Run Scanner — Safe scan of the entire library"
- `guidePage.howToLaunch` — EN: "How to launch: button"
- `guidePage.howToOpen` — EN: "How to open:"
- `guidePage.inTopPanel` — EN: "in the panel at the top of the page"
- `guidePage.onGameCard` — EN: "on the game card in the library (hover) or from the button"
- `guidePage.ptChainsDesc` — EN: "Local (privacy), Cloud (quality), Hybrid (balanced) — with automatic fallback and estimated quality/cost."
- `guidePage.ptChainsTitle` — EN: "5 suggested chains"
- `guidePage.ptDescA` — EN: "Analyze a game in depth"
- `guidePage.ptDescB` — EN: "translating it: difficulty, engine, string volume, DRM, encoding, estimated LLM times and suggested chains."
- `guidePage.ptDifficultyDesc` — EN: "Weighted combination of string volume, engine, DRM, encoding and linguistic complexity. Lower = easier."
- `guidePage.ptDrmDesc` — EN: "Detects Denuvo, VMProtect, Steam DRM + Shift-JIS/UTF-8/UTF-16 encoding per file before translating."
- `guidePage.ptModelsDesc` — EN: "Ollama (Gemma 4, Qwen, Llama), OpenAI, DeepL, Gemini — with time and cost for each model."
- `guidePage.ptModelsTitle` — EN: "18 estimated LLM models"
- `guidePage.ptOutput` — EN: "in the game detail page. Output: exportable report + \"Run workflow\" button."
- `guidePage.ptRankTitle` — EN: "P.T.Rank — Quick Ranking"
- `guidePage.ptTitle` — EN: "Prediction Tool (P.T.) — The most powerful tool"
- `guidePage.ptWhereDesc` — EN: ". Click a game in the list to directly open its full P.T. report."
- `guidePage.purpleButton` — EN: "Purple button"
- `guidePage.rankExample` — EN: "Ranking example"
- `guidePage.sortDesc` — EN: "to translate. Perfect for deciding where to start."
- `guidePage.sortGames` — EN: "Sort all analyzed games from"
- `guidePage.stringItDesc` — EN: "on the game card: directly launches the Translation Wizard pre-filled with everything needed (appid, engine, path)."
- `guidePage.stringItTitle` — EN: "\"String it!\" — One-click translation"
- `guidePage.thatAppearsIn` — EN: "that appears on"
- `guidePage.whereToFind` — EN: "Where to find:"
- `injektOverlayConfigComp.colorsStyle` — EN: "Colors and Style"
- `injektOverlayConfigComp.hotkeyPh` — EN: "e.g. Ctrl+Shift+T"
- `injektOverlayConfigComp.overlayPreview` — EN: "Overlay Preview"
- `injektOverlayConfigComp.previewDesc` — EN: "Preview how the overlay will look in-game"
- `injektOverlayConfigComp.resetDefault` — EN: "Reset to Default"
- `injektUi.activeMonitoring` — EN: "Active monitoring for"
- `injektUi.customTranslations` — EN: "Custom Translations"
- `injektUi.customTranslationsUnit` — EN: "custom translations"
- `injektUi.detectedProcesses` — EN: "Detected Processes"
- `injektUi.exportProfile` — EN: "Export Profile"
- `injektUi.importError` — EN: "Error importing profile"
- `injektUi.importProfile` — EN: "Import Profile"
- `injektUi.importSuccess` — EN: "Profile imported successfully!"
- `injektUi.injectionInProgress` — EN: "Injection in Progress"
- `injektUi.memoryAddresses` — EN: "Memory Addresses"
- `injektUi.originalPh` — EN: "Original text (EN)"
- `injektUi.profileManagement` — EN: "Profile Management"
- `injektUi.selectProcess` — EN: "Select a process to manage translations"
- `injektUi.startInjection` — EN: "Start Injection"
- `injektUi.stopInjection` — EN: "Stop Injection"
- `injektUi.totalInjections` — EN: "Total Injections"
- `injektUi.totalTranslations` — EN: "Total Translations"
- `injektUi.translationPh` — EN: "Translation (IT)"
- `inlineTranslatorComp.apiKeyPh` — EN: "Enter your API key"
- `inlineTranslatorComp.estimatedCost` — EN: "Estimated cost:"
- `inlineTranslatorComp.resultPh` — EN: "Translation will appear here"
- `inlineTranslatorComp.saveTranslation` — EN: "Save Translation"
- `inlineTranslatorComp.searchingFiles` — EN: "Searching for translatable files in the game"
- `inlineTranslatorComp.startAiTranslation` — EN: "Start AI Translation"
- `inlineTranslatorComp.successMsg` — EN: "has been successfully translated"
- `inlineTranslatorComp.translateOther` — EN: "Translate Other Files"
- `inlineTranslatorComp.translationOf` — EN: "Translation of"
- `lipSyncPanel.addToPath` — EN: "and add it to the system PATH."
- `lipSyncPanel.audioFile` — EN: "Audio File (WAV, OGG, MP3)"
- `lipSyncPanel.audioPathPh` — EN: "Audio file path..."
- `lipSyncPanel.dataBased` — EN: "Data-based (accurate)"
- `lipSyncPanel.dialogPh` — EN: "Enter the text spoken in the audio file..."
- `lipSyncPanel.dialogText` — EN: "Dialog text (optional, improves accuracy)"
- `lipSyncPanel.downloadFrom` — EN: "Download from"
- `lipSyncPanel.notFound` — EN: "Rhubarb Lip Sync not found"
- `lipSyncPanel.phonetic` — EN: "Phonetic (fast)"
- `lipSyncPanel.subtitle` — EN: "Generate lip-sync data from audio for dubbing"
- `liveOcrOverlay.captureInterval` — EN: "Capture interval"
- `liveOcrOverlay.currentTexts` — EN: "Current texts"
- `liveOcrOverlay.detectedTexts` — EN: "Detected texts"
- `liveOcrOverlay.exportComplete` — EN: "Export complete!"
- `liveOcrOverlay.sessionTotal` — EN: "Session total"
- `liveOcrOverlay.sourceLanguage` — EN: "Source language"
- `liveOcrOverlay.subtitle` — EN: "Real-time translation of the game screen"
- `liveOcrOverlay.targetLanguage` — EN: "Target language"
- `mainLayout.searchHint` — EN: "Type 2+ characters to search among"
- `mainLayout.skipToContent` — EN: "Skip to main content"
- `mainLayout.visitSite` — EN: "Visit gamestringer.ai"
- `mtpePage.inputPh` — EN: "Enter one text per line...\n\nHello, adventurer!\nWelcome to our world.\nChoose your destiny..."
- `mtpePage.newWorkflow` — EN: "New workflow"
- `mtpePage.savedToTm` — EN: "Approved/modified translations have been saved to the Translation Memory"
- `mtpePage.startAiTranslation` — EN: "Start AI translation"
- `mtpePage.step1` — EN: "1. Enter texts to translate"
- `mtpePage.step2` — EN: "2. Review translations"
- `notificationCenter.clearFilters` — EN: "Clear filters"
- `notificationCenter.closeAria` — EN: "Close notification center"
- `notificationCenter.deleteSelected` — EN: "Delete selected"
- `notificationCenter.filtersHelp` — EN: "Use filters to search for specific notifications. Press Escape to close, Ctrl+A to select all, Ctrl+F to search."
- `notificationCenter.loadingAria` — EN: "Loading notifications"
- `notificationCenter.markAllRead` — EN: "Mark all as read"
- `notificationCenter.markReadTitle` — EN: "Mark as read"
- `notificationCenter.markSelectedRead` — EN: "Mark selected as read"
- `notificationCenter.searchAria` — EN: "Search notifications by title, message or category"
- `notificationCenter.searchHelp` — EN: "Type to search notifications. Search includes title, message and categories."
- `notificationCenter.searchPh` — EN: "Search notifications..."
- `notificationCenter.srDescBefore` — EN: "Notification center with"
- `ocrImageProcessor.copiedToClipboard` — EN: "Text copied to clipboard"
- `ocrImageProcessor.detectedElements` — EN: "detected elements"
- `ocrImageProcessor.detectionMode` — EN: "Detection Mode"
- `ocrImageProcessor.dragImage` — EN: "Drag an image here or click to select"
- `ocrImageProcessor.extractedOn` — EN: "Extracted on"
- `ocrImageProcessor.minConfidence` — EN: "Minimum Confidence:"
- `ocrImageProcessor.noiseReduction` — EN: "Noise Reduction"
- `ocrImageProcessor.ocrSettings` — EN: "OCR Settings"
- `ocrImageProcessor.ocrSettingsDesc` — EN: "Configure text recognition options"
- `ocrImageProcessor.recognitionLanguage` — EN: "Recognition Language"
- `ocrImageProcessor.resultDeleted` — EN: "Result deleted"
- `ocrImageProcessor.saveSettings` — EN: "Save Settings"
- `ocrImageProcessor.subtitle` — EN: "Extract text from screenshots and game images"
- `ocrImageProcessor.supportedFormats` — EN: "Supports PNG, JPG, JPEG, WebP"
- `ocrTranslator.analyzing` — EN: "OCR analysis and translation in progress..."
- `ocrTranslator.dragScreenshot` — EN: "Drag a screenshot here"
- `ocrTranslator.dragToReplace` — EN: "Drag another screenshot to replace"
- `ocrTranslator.geminiOption` — EN: "Gemini (API Key required)"
- `ocrTranslator.linesExtracted` — EN: "extracted lines"
- `ocrTranslator.lingvaOption` — EN: "Lingva (Free/Fast)"
- `ocrTranslator.liveCapture` — EN: "Live Capture"
- `ocrTranslator.liveOcrStarted` — EN: "Live OCR translation started"
- `ocrTranslator.paste` — EN: "Paste (Ctrl+V)"
- `ocrTranslator.vlmDesc` — EN: "The image will be sent directly to Ollama. Make sure you have downloaded `llava`, `qwen2-vl` or `pixtral`. This mode is slow but very precise for Japanese and complex languages."
- `patchHubPage.publishOnlineLoginRequired` — EN: "Sign in to the Community Hub to publish online. The pack was saved as a local draft."
- `predictionRankingPage.analyzing` — EN: "Analyzing installed games..."
- `predictionRankingPage.backToLibrary` — EN: "Back to Library"
- `predictionRankingPage.clickScanPrompt` — EN: "Click \"Scan All\" to analyze all installed games and get a ranking sorted by translation difficulty, with time and cost estimates."
- `predictionRankingPage.noGamesFound` — EN: "No installed games found."
- `predictionRankingPage.scanningDetail` — EN: "Scanning files, detecting languages, analyzing formats... This may take a few minutes."
- `predictionRankingPage.subtitle` — EN: "Scan all installed games and rank by translation difficulty"
- `predictionRankingPage.title` — EN: "P.T. Quick Ranking"
- `predictionRankingPage.totalCloudCost` — EN: "Total Cloud Cost"
- `predictionRankingPage.totalStrings` — EN: "Total Strings"
- `projectsPage.allLanguages` — EN: "All languages"
- `projectsPage.allStatuses` — EN: "All statuses"
- `projectsPage.importError` — EN: "Import error"
- `projectsPage.invalidFile` — EN: "Invalid file"
- `projectsPage.loadError` — EN: "Error loading projects"
- `projectsPage.loadingProjects` — EN: "Loading projects..."
- `projectsPage.projectDeleted` — EN: "Project deleted"
- `projectsPage.projectExported` — EN: "Project exported"
- `projectsPage.searchPh` — EN: "Search projects..."
- `projectsPage.startTranslating` — EN: "Start translating"
- `projectsPage.subtitle` — EN: "All the games you are translating or have already translated"
- `projectsPage.totalProjectsLabel` — EN: "Total projects"
- `projectsPage.translatedStringsLabel` — EN: "Translated strings"
- `retroOcrPanel.binaryThreshold` — EN: "Binary Threshold"
- `retroOcrPanel.preprocessingParams` — EN: "Pre-Processing Parameters"
- `retroOcrPanel.startRetroOcr` — EN: "Start Retro OCR"
- `retroOcrPanel.thresholdDesc` — EN: "Converts the image to black/white for better recognition"
- `retroOcrPanel.tip8bit` — EN: ": use 4x upscale and high threshold"
- `retroOcrPanel.tipDos` — EN: ": enable \"Remove Dithering\" for limited palettes"
- `retroOcrPanel.tipInvert` — EN: "• If the text is dark on a light background, try \"Invert Colors\""
- `retroOcrPanel.tipJapanese` — EN: "(PC-98): use 4x upscale with sharpen"
- `retroOcrPanel.upscaleDesc` — EN: "Enlarges the image preserving the pixels (nearest neighbor)"
- `romPatcher.applyPatchDesc` — EN: "Select the original ROM and the patch file. The format is detected automatically."
- `romPatcher.applyPatchTitle` — EN: "Apply IPS/BPS Patch to a ROM"
- `romPatcher.autoFormat` — EN: "Auto (IPS if ≤16MB, otherwise BPS)"
- `romPatcher.betweenRoms` — EN: "between the two ROMs — they don't include copyright-protected content."
- `romPatcher.bpsInfo` — EN: "— modern format by byuu. No size limit. Includes CRC32 checksum for source, target and patch ROM."
- `romPatcher.bpsOption` — EN: "BPS (modern, with CRC32 verification)"
- `romPatcher.createPatchDesc` — EN: "Compare the original ROM with the translated one to generate a distributable patch file."
- `romPatcher.createPatchExport` — EN: "Create Patch (Export)"
- `romPatcher.createPatchTitle` — EN: "Create IPS/BPS Patch from ROM"
- `romPatcher.downloadPatchedRom` — EN: "Download Patched ROM"
- `romPatcher.ipsInfo` — EN: "— classic format, supported by all emulators and patchers. Max 16MB. No integrity check."
- `romPatcher.ipsOption` — EN: "IPS (classic, compatible with all patchers)"
- `romPatcher.onlyDifferences` — EN: "only the differences"
- `romPatcher.originalRom` — EN: "Original ROM"
- `romPatcher.originalRomLang` — EN: "Original Japanese/English ROM"
- `romPatcher.originalRomUnmodified` — EN: "Original ROM (unmodified)"
- `romPatcher.patchFormat` — EN: "Patch Format"
- `romPatcher.publishToHub` — EN: "Publish to Hub"
- `romPatcher.safeToDistribute` — EN: "The patch contains only the differences between the two ROMs — safe to distribute, no copyright-protected data."
- `romPatcher.selectPatchPrompt` — EN: "Click to select the patch (.ips, .bps)"
- `romPatcher.selectRomPrompt` — EN: "Click to select the ROM (.smc, .sfc, .nes, .gba, .nds, .bin, ...)"
- `romPatcher.translatedRomModified` — EN: "Translated ROM (modified)"
- `romPatcher.verifyOk` — EN: "Verify OK: the patch reproduces the translated ROM perfectly!"
- `secretsDashboardComp.copiedToClipboard` — EN: "Copied to clipboard"
- `secretsDashboardComp.copyFailed` — EN: "Failed to copy to clipboard"
- `secretsDashboardComp.copyKeyWarning` — EN: "Copy this key to your .env.local file. It will not be shown again."
- `secretsDashboardComp.gen32` — EN: "Generate 32-char Key"
- `secretsDashboardComp.gen64` — EN: "Generate 64-char Key"
- `secretsDashboardComp.generateDesc` — EN: "Generate secure random keys for your application"
- `secretsDashboardComp.generateFailed` — EN: "Failed to generate secret key"
- `secretsDashboardComp.invalidFormats` — EN: "These secrets have invalid formats and should be updated."
- `secretsDashboardComp.keyGenerated` — EN: "Secret key generated successfully"
- `secretsDashboardComp.loadFailed` — EN: "Failed to load secrets status"
- `secretsDashboardComp.missingWarning` — EN: "The application may not function properly without these secrets."
- `secretsDashboardComp.requiredMissing` — EN: "Required secrets missing"
- `secretsDashboardComp.statusDesc` — EN: "Current status of all configured secrets"
- `secretsDashboardComp.validateDesc` — EN: "Validate secret formats before adding them to your environment"
- `secretsDashboardComp.validatePh` — EN: "Enter secret value to validate..."
- `securityDialog.accountProtected` — EN: "Your account is protected"
- `securityDialog.activityHistory` — EN: "Activity History"
- `securityDialog.addExtraSecurity` — EN: "Add an extra layer of security"
- `securityDialog.changePassword` — EN: "Change Password"
- `securityDialog.changePasswordDesc` — EN: "Change your profile password"
- `securityDialog.configure2fa` — EN: "Configure 2FA"
- `securityDialog.disconnectAfterInactivity` — EN: "Disconnect after inactivity"
- `securityDialog.disconnectAll` — EN: "Disconnect All Sessions"
- `securityDialog.enter6DigitCode` — EN: "Enter a 6 digit code"
- `securityDialog.enterCurrentPassword` — EN: "Enter current password"
- `securityDialog.invalidCode` — EN: "Invalid code"
- `securityDialog.notifyNewLogins` — EN: "Notify for new logins"
- `securityDialog.passwordChanged` — EN: "Password changed successfully!"
- `securityDialog.passwordMinLength` — EN: "New password must be at least 4 characters"
- `securityDialog.passwordsDontMatch` — EN: "Passwords don't match"
- `securityDialog.passwordsMatch` — EN: "Passwords match"
- `securityDialog.protectAccount` — EN: "Protect your account with a second authentication factor"
- `securityDialog.recentActivity` — EN: "Recent logins and changes"
- `securityDialog.requirePassword` — EN: "Require password after inactivity"
- `securityDialog.saveInAuthApp` — EN: "Save it in an authenticator app (Google Authenticator, Authy, etc.)"
- `securityDialog.sessionManagement` — EN: "Session Management"
- `securityDialog.sessionMgmtDesc` — EN: "Configure timeout and auto-lock"
- `securityDialog.twoFaDisabledMsg` — EN: "Two-factor authentication disabled"
- `securityDialog.twoFaEnabledMsg` — EN: "Two-factor authentication enabled!"
- `securityDialog.twoFactorAuth` — EN: "Two-Factor Authentication"
- `settingsPage.anthropicHeader` — EN: "🔑 Anthropic Claude API Key"
- `settingsPage.deepseekHeader` — EN: "🔑 DeepSeek API Key"
- `settingsPage.geminiHeader` — EN: "🔑 Google Gemini API Key"
- `settingsPage.openaiHeader` — EN: "🔑 OpenAI API Key"
- `smartContextPanelComp.addCharacter` — EN: "Add Character"
- `smartContextPanelComp.autoLearnDesc` — EN: "Smart Context learns automatically as you translate. Characters and terms are detected from the dialogues."
- `smartContextPanelComp.charOrigPh` — EN: "e.g. Commander Shepard"
- `smartContextPanelComp.charTraitsPh` — EN: "e.g. Serious, leader, military"
- `smartContextPanelComp.charTransPh` — EN: "e.g. Commander Shepard"
- `smartContextPanelComp.newCharacter` — EN: "New Character"
- `smartContextPanelComp.notesPh` — EN: "Additional notes on the translation..."
- `smartContextPanelComp.termContextPh` — EN: "e.g. Inventory item"
- `smartContextPanelComp.termOrigPh` — EN: "e.g. Health Potion"
- `smartContextPanelComp.termTransPh` — EN: "e.g. Health Potion"
- `steamFamilySharing.analyzeFile` — EN: "Analyze File"
- `steamFamilySharing.analyzingConfig` — EN: "Analyzing Steam configuration..."
- `steamFamilySharing.autoDetectDesc` — EN: "Automatically search for the Steam configuration on the PC."
- `steamFamilySharing.enterSteamIdDesc` — EN: "Enter your friends' Steam ID (17 digits). Find it in the Steam profile."
- `steamFamilySharing.familySharingConfigured` — EN: "Family Sharing configured!"
- `steamFamilySharing.goToLibrary` — EN: "Go to Library"
- `steamFamilySharing.invalidSteamId` — EN: "Invalid Steam ID. It must be a 17-digit number."
- `steamFamilySharing.noSharedGames` — EN: "No shared games found."
- `steamFamilySharing.noSharedGamesToast` — EN: "No shared games found. Make sure Family Sharing is enabled."
- `steamFamilySharing.refreshList` — EN: "Refresh List"
- `steamFamilySharing.startAutoDetect` — EN: "Start Automatic Detection"
- `steamFamilySharing.steamIdAdded` — EN: "Steam ID added!"
- `steamFamilySharing.steamIdPh` — EN: "Steam ID (e.g. 76561198012345678)"
- `steamFamilySharing.steamIdRemoved` — EN: "Steam ID removed"
- `steamFamilySharing.subtitle` — EN: "Detect Steam accounts sharing their library with you"
- `translationBridge.addSinglePair` — EN: "Add a single original/translation pair"
- `translationBridge.applyLanguages` — EN: "Apply Languages"
- `translationBridge.availablePairs` — EN: "Available pairs:"
- `translationBridge.bulkImportDesc` — EN: "Load multiple translations in JSON format or line by line"
- `translationBridge.clearDictionary` — EN: "Clear Dictionary"
- `translationBridge.confirmClear` — EN: "Are you sure you want to clear all translations?"
- `translationBridge.lookupDesc` — EN: "Check if a string has a translation in the dictionary"
- `translationBridge.originalText` — EN: "Original Text"
- `translationBridge.searchResultPh` — EN: "(enter text and press Search)"
- `translationBridge.searchTranslation` — EN: "Search Translation"
- `translationBridge.setActivePair` — EN: "Set the active language pair"
- `translationBridge.subtitle` — EN: "In-game translation system for Unity"
- `translationProfileManager.confirmDelete` — EN: "Are you sure you want to delete this profile?"
- `translationProfileManager.createProfile` — EN: "Create Profile"
- `translationProfileManager.descPh` — EN: "Profile description..."
- `translationProfileManager.editDesc` — EN: "Edit translations and profile settings"
- `translationProfileManager.exePh` — EN: "e.g. hollow_knight.exe"
- `translationProfileManager.gameNamePh` — EN: "e.g. Hollow Knight"
- `translationProfileManager.importError` — EN: "Error importing profile"
- `translationProfileManager.importSuccess` — EN: "Profile imported successfully!"
- `translationProfileManager.newProfileDesc` — EN: "Create a new translation profile for a game"
- `translationProfileManager.originalTextPh` — EN: "Original text"
- `translationProfileManager.saveChanges` — EN: "Save Changes"
- `translationProfileManager.searchPh` — EN: "Search profiles by name, game or tag..."
- `translationProfileManager.selectProfilePrompt` — EN: "Select a profile to view details"
- `translationProfileManager.tagsPh` — EN: "e.g. rpg, fantasy, indie"
- `translationProfileManager.totalProfiles` — EN: "Total Profiles"
- `translationProfileManager.useThisProfile` — EN: "Use This Profile"
- `translationRecommendationComp.andOthers` — EN: "...and others"
- `translationRecommendationComp.autoTranslationProgress` — EN: "Automatic translation progress"
- `translationRecommendationComp.bepinexInstalled` — EN: "BepInEx + XUnity AutoTranslator installed!"
- `translationRecommendationComp.checkingRequirements` — EN: "Checking requirements..."
- `translationRecommendationComp.exportTranslations` — EN: "Export translations"
- `translationRecommendationComp.fullAutoTranslation` — EN: "Full Automatic Translation"
- `translationRecommendationComp.godotHint` — EN: "For Godot, use gdsdecomp: https://github.com/bruvzg/gdsdecomp"
- `translationRecommendationComp.missingRequirements` — EN: "Missing requirements (the chain will work with the available providers)"
- `translationRecommendationComp.noPckFound` — EN: "No PCK file found. Try manual extraction with gdsdecomp."
- `translationRecommendationComp.optionalProvidersNotConfigured` — EN: "optional providers not configured"
- `translationRecommendationComp.patchInstalled` — EN: "Patch installed"
- `translationRecommendationComp.qualityCheckApplyPatch` — EN: "Quality check + Apply patch"
- `translationRecommendationComp.qualityValidation` — EN: "Quality validation"
- `translationRecommendationComp.renpyExtracted` — EN: "Ren'Py: archives extracted. Now translate the .rpy files"
- `translationRecommendationComp.renpyFound` — EN: "Ren'Py: .rpy files found. Translate directly with Neural Translator."
- `translationRecommendationComp.renpyHint` — EN: "For Ren'Py, use UnRPA: https://github.com/Lattyware/unrpa"
- `translationRecommendationComp.rpgMakerVxHint` — EN: "For RPG Maker VX/Ace, use RPG Maker Trans"
- `translationRecommendationComp.scanTranslatableFiles` — EN: "Scan translatable files"
- `translationRecommendationComp.startTranslation` — EN: "Start Translation"
- `translationRecommendationComp.translateAll` — EN: "Translate All"
- `translationRecommendationComp.translationChain` — EN: "Translation Chain:"
- `translationRecommendationComp.translationStats` — EN: "Translation statistics"
- `translationRecommendationComp.useNeuralTranslatorPro` — EN: "For localization files, use Neural Translator Pro manually."
- `translationRecommendationComp.wantFullHelp` — EN: "Do you want to use GameStringer's full assistance?"
- `translationRecommendationComp.willExecuteSteps` — EN: "GameStringer will automatically execute all the steps of the optimal strategy:"
- `translationRecommendationComp.wolfRpgHint` — EN: "For Wolf RPG, use the official Wolf RPG Editor to export the texts"
- `translationRecommendationComp.xunityConfigured` — EN: "XUnity configured! Launch the game from Steam for automatic translation."
- `translationWizard.analyzing` — EN: "Analysis in progress..."
- `translationWizard.chooseAnotherGame` — EN: "← Choose another game"
- `translationWizard.directTranslation` — EN: "Direct translation"
- `translationWizard.downloadTranslation` — EN: "Download Translation"
- `translationWizard.openGameFolder` — EN: "Open Game Folder"
- `translationWizard.renderError` — EN: "Render error"
- `translationWizard.searchGame` — EN: "Search game..."
- `translationWizard.selectGame` — EN: "Select a game"
- `translationWizard.selectGameDesc` — EN: "Choose the game you want to translate from your library"
- `translationWizard.subtitle` — EN: "Automatically analyze games and discover how to translate them"
- `translationWizard.translateAnotherGame` — EN: "← Translate another game"
- `translationWizard.translateNow` — EN: "Translate Now"
- `translatorProPage.advancedOptions` — EN: "Advanced options"
- `translatorProPage.aiRecommendation` — EN: "AI Recommendation"
- `translatorProPage.apiKeyPh` — EN: "Enter your API key (saved automatically)"
- `translatorProPage.bypassWarning` — EN: "Bypasses smart filter. Re-select the game after enabling."
- `translatorProPage.patchExported` — EN: "Patch Exported Successfully!"
- `translatorProPage.recommendedSelected` — EN: "Recommended provider selected"
- `translatorProPage.startTranslation` — EN: "Start Translation"
- `unityCsvPage.alreadyTranslatedClick` — EN: "strings already translated. Click"
- `unityCsvPage.checkpointFound` — EN: "Checkpoint found:"
- `unityCsvPage.clearCheckpoint` — EN: "Clear checkpoint"
- `unityCsvPage.diffInfo1` — EN: "Only new and modified strings will be translated. The"
- `unityCsvPage.diffInfo2` — EN: "unchanged ones keep the previous translation."
- `unityCsvPage.toContinue` — EN: "to continue where you left off."
- `unityCsvPage.vsPrevious` — EN: "vs the previous translation"
- `unityInkTranslator.backupInfo` — EN: "Original files will be automatically saved as backup (.backup)"
- `unityInkTranslator.characterVoiceDesc` — EN: "Translates using characters' psychological profiles — dialogue, narration and actions are detected automatically. Uses Ollama's Chat API for richer prompts."
- `unityInkTranslator.extractInkTitle` — EN: "Extract Ink Strings"
- `unityInkTranslator.injectTitle` — EN: "Inject translations into the game"
- `unityInkTranslator.injectionInProgress` — EN: "Injection in progress... this may take a few minutes."
- `unityInkTranslator.proceedToTranslation` — EN: "Proceed to Translation"
- `unityInkTranslator.searchPh` — EN: "Search in translations..."
- `unityInkTranslator.startInjection` — EN: "Start Injection"
- `unityInkTranslator.stringsWith` — EN: "strings with"
- `unityInkTranslator.toExtractDesc` — EN: "to extract all dialogue strings from Ink JSON blobs."
- `unityInkTranslator.translationInProgress` — EN: "Translation in progress"
- `unityLoc.backToEditor` — EN: "Back to Editor"
- `unityLoc.entriesTranslated` — EN: "Translated entries"
- `unityLoc.exportOptions` — EN: "Export Options"
- `unityLoc.localesDetected` — EN: "Detected Locales"
- `unityLoc.noResults` — EN: "No results found"
- `unityLoc.noStringTable` — EN: "No StringTable found"
- `unityLoc.searchPh` — EN: "Search key or value..."
- `unityLoc.selectFolderDesc` — EN: "Choose the folder containing the Unity localization files (StreamingAssets, Localization, etc.)"
- `unityLoc.selectProjectFolder` — EN: "Select Project Folder"
- `unityLoc.sourceLanguage` — EN: "Source language"
- `unityLoc.subtitle` — EN: "StringTable, Smart Strings and Addressables catalogs"
- `unityLoc.targetLanguage` — EN: "Target language"
- `unityLoc.toClipboard` — EN: "To clipboard"
- `unityLoc.toTranslate` — EN: "To translate"
- `unityLoc.translateAll` — EN: "Translate All"
- `unityLoc.translationSummary` — EN: "Translation Summary"
- `unityLoc.validateAll` — EN: "Validate All"
- `videoExtractor.chooseFromLibrary` — EN: "Choose from Library"
- `videoExtractor.conversionResults` — EN: "Conversion Results"
- `videoExtractor.convertedSuccess` — EN: "converted successfully"
- `videoExtractor.convertibleOnly` — EN: "Convertible only"
- `videoExtractor.ffmpegHint` — EN: "To convert game videos, install FFmpeg and make sure it's in the PATH. Scanning and file analysis work without FFmpeg anyway."
- `videoExtractor.filesSelected` — EN: "files selected"
- `videoExtractor.formatsFound` — EN: "Formats Found"
- `videoExtractor.noVideoFiles` — EN: "No video files found"
- `videoExtractor.outputDir` — EN: "Output Directory"
- `videoExtractor.outputDirEmpty` — EN: "Output Directory (empty = same folder)"
- `videoExtractor.scale4x` — EN: "4x (recommended for retro FMV)"
- `videoExtractor.searchFiles` — EN: "Search files..."
- `videoExtractor.searchInstalledGame` — EN: "Search installed game..."
- `videoExtractor.supportedFormats` — EN: "Supported Formats"
- `videoExtractor.upscalingHint` — EN: "Runs on GPU (Vulkan) — ideal for upscaling retro FMV videos like Gabriel Knight 2."
- `videoExtractor.upscalingPipeline` — EN: "Extracts frames → AI upscale on GPU → reassembles into MP4 H.264. May take several minutes per video."
- `visualTranslationEditor.bgOpacity` — EN: "Background Opacity:"
- `visualTranslationEditor.exportDesc` — EN: "Choose how to export your work"
- `visualTranslationEditor.exportImage` — EN: "Export as Image (PNG)"
- `visualTranslationEditor.imageExported` — EN: "Image exported"
- `visualTranslationEditor.loadScreenshot` — EN: "Load Screenshot"
- `visualTranslationEditor.quickStyles` — EN: "Quick Styles"
- `visualTranslationEditor.saveProject` — EN: "Save Project (.gsvte)"
- `visualTranslationEditor.screenshotLoaded` — EN: "Screenshot loaded"
- `visualTranslationEditor.subtitle` — EN: "Preview translations on game screenshots"
- `voiceProfileManager.catchphrasesField` — EN: "Catchphrases (separated by ;)"
- `voiceProfileManager.catchphrasesPh` — EN: "e.g. By the gods!; Hmm, interesting..."
- `voiceProfileManager.characterName` — EN: "Character Name"
- `voiceProfileManager.exampleDialogues` — EN: "Example dialogues:"
- `voiceProfileManager.noProfiles` — EN: "No voice profile configured."
- `voiceProfileManager.noProfilesDesc` — EN: "Create a profile manually or extract automatically from the game strings."
- `voiceProfileManager.patternsPh` — EN: "e.g. Use archaic words; Speak slowly; Nature references"
- `voiceProfileManager.personalityPh` — EN: "e.g. A wise wizard who speaks in riddles"
- `voiceProfileManager.subtitle` — EN: "Preserve characters' personality and style during translation. Voice profiles are automatically injected into the translation prompt."
- `voiceProfileManager.title` — EN: "Character Voice Profiles"
- `voiceProfileManager.voicePatterns` — EN: "Voice Patterns (separated by ;)"
- `wadExtractor.applyPatchCli` — EN: "Apply patch (CLI)"
- `wadExtractor.exportTranslations` — EN: "Export translations"
- `wadExtractor.extractAllText` — EN: "Extract all text from a WAD file"
- `wadExtractor.extractTextCli` — EN: "Extract text (CLI)"
- `wadExtractor.extractedText` — EN: "Extracted Text"
- `wadExtractor.loadExtractedJson` — EN: "Load Extracted JSON"
- `wadExtractor.onlyUntranslated` — EN: "Only untranslated"
- `wadExtractor.runCommandHint` — EN: "Run the extraction command in the terminal, then load the resulting JSON."
- `wadExtractor.searchPh` — EN: "Search text, file..."
- `wadExtractor.showing200Of` — EN: "Showing 200 of"
- `wadExtractor.stringsUseSearch` — EN: "strings. Use search to filter."
- `wadExtractor.translateAi` — EN: "AI Translate"
- `wadExtractor.translateAiManual` — EN: "Translate (AI/manual)"
- `wadExtractor.translationPh` — EN: "Enter Italian translation..."
- `wadExtractor.wadExtraction` — EN: "WAD Extraction"