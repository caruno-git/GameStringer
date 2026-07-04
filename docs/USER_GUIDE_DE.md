# GameStringer - Vollständige Anleitung

## 🆕 Neu in v1.11.2

- **Mehr Stores**: Humble App, Game Jolt und Big Fish Games werden jetzt automatisch erkannt.
- **Übersetzungs-Lookup**: prüft via PCGamingWiki, ob ein Spiel deine Sprache bereits enthält, plus Suchlinks für italienische Fan-Patches.
- **Ins Patch Hub veröffentlichen**: ein fertiges Projekt in einem Schritt ans Community-Patch-Hub senden (Projekte → Veröffentlichen).
- **Neue Engines**: TyranoScript-Cloud-Pipeline und ein neu geschriebener `.pck`-Parser, der echte Godot-4.4+-Archive liest.
- **Unity**: lokale Ollama-Brücke für XUnity (CustomTranslate); Downloads (BepInEx/XUnity/TMP/UABEA) über die GitHub-API.

## Inhaltsverzeichnis

1. [Ersteinrichtung](#phase-1-ersteinrichtung)
2. [Store-Verbindung](#phase-2-store-verbindung)
3. [Spielebibliothek](#phase-3-spielebibliothek)
4. [Spiel übersetzen (Auto-Translate)](#phase-4-spiel-übersetzen)
5. [Patcher Engine](#phase-5-patcher-engine)
6. [Unity CSV Translator](#phase-6-unity-csv-translator)
7. [BepInEx + XUnity](#phase-7-bepinex--xunity)
8. [AI Pipeline Multi-Agent](#phase-8-ai-pipeline)
9. [AI-Übersetzer](#phase-9-ai-übersetzer)
10. [OCR-Übersetzer und Multi-Engine](#phase-10-ocr-übersetzer)
11. [Sprachübersetzer](#phase-11-sprachübersetzer)
12. [Batch- und Offline-Übersetzung](#phase-12-batch--offline)
13. [Danganronpa Patcher](#phase-13-danganronpa-patcher)
14. [Prediction Tool und QA Check](#phase-14-prediction-tool--qa-check)
15. [Glossar, TM und Adaptive MT](#phase-15-glossar-tm--adaptive-mt)
16. [Erweiterte Tools](#phase-16-erweiterte-tools)
17. [Sicherheit und Recovery Key](#phase-17-sicherheit)
18. [Fehlerbehebung](#phase-18-fehlerbehebung)
19. [Community-Chat (Echtzeit)](#phase-19-community-chat) *(NEU v1.5.0)*

---

## PHASE 1: ERSTEINRICHTUNG

### Erster Start

Starten Sie GameStringer. Beim ersten Start erscheint der Profilerstellungsbildschirm.

### Profil erstellen

- **Name**: Wählen Sie einen Namen (z.B. "Mario Gaming")
- **Avatar**: Wählen Sie eine Farbe/einen Verlauf
- **Passwort**: Mindestens 4 Zeichen
- Klicken Sie auf **"Profil erstellen"** — automatische Authentifizierung

### Benutzeroberfläche

- **Seitenleiste** (links): Navigation zwischen Bereichen
- **Dashboard** (Mitte): Spieleübersicht, Statistiken, AI Engine Widget
- **Strg+K**: Globale Schnellsuche für den Zugriff auf jede Seite

---

## PHASE 2: STORE-VERBINDUNG

### Unterstützte Stores

Steam, Epic Games, GOG, Ubisoft Connect, Origin/EA, Battle.net, Itch.io, Rockstar, Amazon Games.

### Steam-Konfiguration (Priorität)

1. API-Schlüssel von https://steamcommunity.com/dev/apikey
2. Steam ID64 von https://steamid.io/
3. In GS: **Einstellungen** → API-Schlüssel und Steam-ID eingeben
4. Das Steam-Profil muss **Öffentlich** sein

GS erkennt auch Spiele aus **Steam Family Sharing**.

---

## PHASE 3: SPIELEBIBLIOTHEK

- Seitenleiste → **"Bibliothek"** oder Dashboard → **"Bibliothek aktualisieren"**
- Das Laden dauert 1-2 Minuten für Hunderte von Spielen
- Klick auf ein Spiel: Details, erkannte Engine, Pfad, **"Spiel übersetzen"**-Button

---

## PHASE 4: SPIEL ÜBERSETZEN

Seitenleiste → **"Spiel übersetzen"** (Auto-Translate). Das Herzstück von GameStringer.

### Arbeitsablauf

1. **Spiel auswählen** aus der Bibliothek oder manueller Pfad
2. **Scan**: Erkennt Engine (Unity, Unreal, Godot, RPG Maker, Ren'Py, etc.) und übersetzbare Dateien
3. **Smart Auto-Select**: Empfiehlt die beste Methode für die erkannte Engine
4. **AI-Übersetzung**: Strings werden mit der konfigurierten AI-Engine übersetzt
5. **Überprüfung**: Prüfen, bearbeiten, genehmigen
6. **Patch anwenden**: Automatisches Backup + Anwendung

### Smart Auto-Select für Unity

| Typ | Empfohlene Methode | Alternative |
|-----|-------------------|-------------|
| Unity Mono (ohne BepInEx) | Unity CSV Translator | BepInEx + XUnity |
| Unity Mono (BepInEx vorhanden) | Unity CSV Translator | Erfasste Strings mit AI übersetzen |
| Unity IL2CPP | Unity CSV Translator | Keine (BepInEx inkompatibel) |

### Erkannte Engines

Unity (Mono/IL2CPP), Unreal Engine, Godot, RPG Maker, Ren'Py, Source Engine, CryEngine, RE Engine, Frostbite, id Tech, Creation Engine, Construct, AGS, Defold, Love2D.

---

## PHASE 5: PATCHER ENGINE

Seitenleiste → **Patcher** → **Patcher Engine**. 5 spezialisierte Patcher:

- **Unity**: BepInEx + XUnity AutoTranslator für Mono
- **Unreal Engine**: .locres-Dateiübersetzung (UE4/UE5)
- **Godot**: .pck-Dateien extrahieren/übersetzen/neu packen (Godot 3/4)
- **RPG Maker**: JSON-Übersetzung für MV/MZ (Dialoge, Gegenstände, Fähigkeiten)
- **Ren'Py**: .rpy-Dateiübersetzung (Visual Novels)

---

## PHASE 6: UNITY CSV TRANSLATOR

Die **beste Methode** für Unity-Spiele (Mono und IL2CPP).

### Funktionsweise

1. Scannt Unity-Assets (resources.assets, etc.)
2. Extrahiert CSV-Lokalisierungstabellen
3. Übersetzt mit AI (Ollama oder Cloud)
4. Injiziert Übersetzungen mit **Resize Injection** (keine Kürzung)

### Vorteile

- Funktioniert mit **allen** Unity-Spielen (Mono und IL2CPP)
- Keine Kürzung dank Resize
- Vollständige Abdeckung (alle Strings, nicht nur Bildschirmtexte)
- Keine externen Abhängigkeiten
- Automatisches Backup (.backup) und Wiederherstellung

---

## PHASE 7: BEPINEX + XUNITY

Für **Unity Mono**-Spiele — Live-Übersetzung während des Spielens.

1. GS erkennt das Unity-Spiel und findet die Exe
2. Klicken Sie auf **"BepInEx + XUnity installieren"**
3. Starten Sie das Spiel — XUnity erfasst Bildschirmtexte
4. Schließen und zurück zu GS — erfasste Strings mit AI übersetzen

**Einschränkung**: Funktioniert nicht mit IL2CPP (verursacht Absturz). Verwenden Sie Unity CSV Translator für IL2CPP.

---

## PHASE 8: AI PIPELINE

Suchen Sie **"AI Pipeline"** mit Strg+K. Mehrstufiges System für hohe Qualität.

### 6 Schritte

Harvest → Translate → QA Check → Auto-Fix → Review → Score

### 3 Modi

- **Quick**: Translate + QA (schnell)
- **Balanced**: + Auto-Fix (empfohlen)
- **Max Quality**: Alle 6 Schritte, Schwellenwert 75, maximal 3 Versuche

### Multi-Agent

Verschiedene Modelle pro Schritt zuweisen (z.B. qwen für Translate, gemma für Review). 4 Presets: Default, Speed, Max Quality, Diversified.

### Benchmark

Ausführungsverlauf mit Score, Dauer, ms/String. Preset-Vergleich.

---

## PHASE 9: AI-ÜBERSETZER

Seitenleiste → **Übersetzung** → **AI-Übersetzer**.

### Anbieter

- **Ollama** (lokal, kostenlos), **OpenAI/GPT-4**, **Claude**, **Gemini**, **DeepL**, **Lingva**

### Funktionen

- Einzel- oder Batch-Übersetzung
- Automatische Erkennung der Quellsprache
- Stil: natürlich, wörtlich, Gaming
- Placeholder-Erhaltung ({0}, %s, \n)
- Integration mit Glossar + Translation Memory + Adaptive MT

---

## PHASE 10: OCR-ÜBERSETZER

Seitenleiste → **Übersetzung** → **OCR-Übersetzer**.

Übersetzt Text vom Bildschirm in Echtzeit:

- Manueller Screenshot oder ausgewählter Bereich
- Kontinuierliches Live-OCR
- Globaler Hotkey: **Strg+Umschalt+T**

### OCR Multi-Engine

4 Engines: **OneOCR** (Win11), **PaddleOCR** (CJK), **RapidOCR** (ONNX), **Tesseract** (Fallback).

- Automatische Engine-Erkennung
- Automatische Fallback-Kette
- Paralleler Vergleichsmodus

---

## PHASE 11: SPRACHÜBERSETZER

Seitenleiste → **Übersetzung** → **Sprachübersetzer**.

- In-Game-Spracherkennung
- Audio → übersetzter Text
- Echtzeit-Untertitel-Overlay

---

## PHASE 12: BATCH- UND OFFLINE-ÜBERSETZUNG

### Batch

Seitenleiste → **Übersetzung** → **Batch**. Übersetzt ganze Ordner:

- Unterstützt .txt, .json, .csv, .po, .xml, .rpy, .ini
- Echtzeit-Fortschritt pro Datei
- AI-Pipeline-Option für maximale Qualität

### Offline (Ollama)

Seitenleiste → **Übersetzung** → **Offline-Übersetzer**.

- Vollständig lokale Übersetzung mit Ollama
- Keine Internetverbindung erforderlich
- Totale Privatsphäre — Daten verlassen Ihren PC nicht

---

## PHASE 13: DANGANRONPA PATCHER

Suchen Sie **"Danganronpa"** mit Strg+K.

### Funktionen

1. **Tab Patch anwenden**: Steam-Spiel auswählen, WAD-Dateien anzeigen, Patch anwenden
2. **Tab WAD Extractor**: 35.865 Strings extrahieren, suchen, filtern und übersetzen
3. **AI-Batch-Übersetzung**: Strings auswählen → mit AI übersetzen → JSON exportieren
4. **Verteilbares .zip exportieren**: Gepatchte WAD + Auto-Installer + Anleitung
5. Im Spiel: Einstellungen → Control Hints → "Keyboard and Mouse"

---

## PHASE 14: PREDICTION TOOL UND QA CHECK

### Prediction Tool

Mit Strg+K suchen. Analysiert ein Spiel vor der Übersetzung:

- Geschätzte String- und Wortanzahl
- Geschätzte Kosten pro Anbieter (DeepL, OpenAI, lokal)
- Geschätzte Zeit pro Methode
- Empfohlene Übersetzungsketten

### QA Check

Mit Strg+K suchen. Qualitätskontrolle nach der Übersetzung:

- Placeholder-Überprüfung
- Zahlen- und Werteprüfung
- String-Längenüberprüfung
- Format- und Zeichensetzungsprüfung
- Qualitätsbewertung pro String

---

## PHASE 15: GLOSSAR, TM UND ADAPTIVE MT

### Glossar

Mit Strg+K suchen. Benutzerdefinierte Terminologie pro Spiel:

- Begriffe hinzufügen (z.B. "quest" → "Aufgabe")
- Kategorien: Gameplay, UI, Charaktere, Lore
- Automatisch in die AI-Übersetzung integriert

### Smart Glossary

Generiert automatisch ein Glossar aus der Analyse der Spieldateien.

### Translation Memory

Dashboard → Widget "TM-Einträge". Übersetzungsspeicher:

- Speichert automatisch jedes übersetzte Paar
- Verwendet frühere Übersetzungen wieder
- Rust-Backend für Performance

### Adaptive MT

Lernt aus Ihren Korrekturen:

- Speichert: Original → AI → menschliche Korrektur
- Findet ähnliche Korrekturen mit Trigram/Wort-Ähnlichkeit
- Injiziert Few-Shot-Beispiele in den AI-Prompt
- Verbessert sich mit der Zeit

---

## PHASE 16: ERWEITERTE TOOLS

### Context Harvester

Scannt Spieldateien und extrahiert Kontext für die AI-Übersetzung.

### Übersetzungseditor

Erweiterter Editor für manuelle String-Überprüfung mit Filtern und Suche.

### Untertitel-Overlay

In-Game-Overlay für übersetzte Untertitel in Echtzeit.

### ROM Patcher

IPS/BPS-Patches für Retro-Übersetzungen anwenden und erstellen (SNES, GBA, etc.).

### Export-Formate

Übersetzungen exportieren nach: PO, XLIFF, CSV, JSON, TMX.

### Community Hub

Übersetzungen teilen, abstimmen, kommentieren, Community-Übersetzungen herunterladen.

---

## PHASE 17: SICHERHEIT

### Recovery Key

Bei der Profilerstellung wird ein **Recovery Key** generiert (12 mnemonische Wörter).

- Kopieren oder als .txt herunterladen
- **An einem sicheren Ort aufbewahren!**

### Passwort-Wiederherstellung

Anmeldebildschirm → **"Passwort vergessen?"** → 12 Wörter eingeben → neues Passwort.

---

## PHASE 18: FEHLERBEHEBUNG

### Spiel nicht gefunden

- Überprüfen Sie, ob es installiert ist und Steam/Epic geöffnet ist
- Bibliothek aktualisieren und GS neu starten

### Übersetzung nicht angewendet

- Spiel vollständig neu starten
- Schreibberechtigungen prüfen
- GS als Administrator ausführen

### AI antwortet nicht

- Internetverbindung prüfen (für Cloud-Anbieter)
- Für Ollama: Überprüfen, ob es läuft (grüner Punkt in der Seitenleiste)
- Andere Engine ausprobieren

### Spiel stürzt nach Patch ab

- Klicken Sie auf **"Backup wiederherstellen"** im verwendeten Tool
- Dateiintegrität auf Steam überprüfen (Rechtsklick → Eigenschaften → Lokale Dateien)

### Unity IL2CPP + BepInEx = Absturz

- GS blockiert jetzt automatisch BepInEx für IL2CPP
- Verwenden Sie stattdessen Unity CSV Translator

### Ollama langsam oder reagiert nicht

- Seitenleiste: grüner Punkt = online, rot = offline
- Ollama Manager → installierte Modelle prüfen
- Empfohlen: 7B-Modell für Geschwindigkeit, 13B+ für Qualität

---

## PHASE 19: COMMUNITY-CHAT

*(NEU v1.5.0)*

Echtzeit-Community-Chat im Community Hub, betrieben mit Supabase Realtime.

### Zugang

1. Gehen Sie zum **Community Hub** in der Seitenleiste
2. Klicken Sie auf den **Chat**-Tab oder das Chat-Symbol unten rechts
3. Wenn Sie in Ihrem GameStringer-Profil angemeldet sind, werden Sie **automatisch verbunden**!

### Standard-Räume

- **Allgemein**: freier Chat der GameStringer-Community
- **Übersetzungen**: Übersetzungen diskutieren, Hilfe bitten, Fortschritte teilen
- **Feedback & Bugs**: Fehler melden und Verbesserungen vorschlagen
- **Ankündigungen**: offizielle Neuigkeiten und Updates

### Funktionen

- **Echtzeit-Nachrichten**: Nachrichten erscheinen sofort über Supabase Realtime
- **Online-Präsenz**: sehen, wer gerade online ist
- **Antworten**: auf Nachrichten antworten
- **Bearbeiten/Löschen**: eigene Nachrichten bearbeiten oder löschen
- **Eigene Räume erstellen**: dedizierte Räume für Projekte oder Spiele
- **Auto-Login**: automatische Verbindung über GameStringer-Profil

## Neu in v1.9.0

### Bethesda Engine Patcher
- **Unterstützte Spiele**: Skyrim LE/SE/AE, Fallout 3/NV/4, Oblivion, Starfield
- **Archivformate**: BSA v103/v104/v105 und BA2 (GNRL + DX10)
- **Plugins**: ESP/ESM-Parsing mit Extraktion übersetzbarer Datensätze
- **Lokalisierte Strings**: STRINGS, DLSTRINGS, ILSTRINGS

### CRI Middleware Patcher
- **Unterstützte Spiele**: Persona 5 Royal, Yakuza, Tales of, Dragon Ball und alle CRI-Titel
- **Archive**: CPK mit CRILAYLA-Dekompression
- **Nachrichtenformate**: MSG, BMD, FTD

### Unity Localization Package
- Pipeline für das offizielle Unity Localization Package (Unity 2021.3+)
- StringTable + SharedTableData, Addressables, Smart Strings
- Dedizierter Validator für Platzhalter und Pluralformen

### Universal PO Export
- gettext PO-Export mit vollständigen Metadaten aus jedem Patcher
- Kompatibel mit Poedit, Weblate, Crowdin

### Barrierefreiheit WCAG 2.1 AA
- aria-label, semantische Überschriften, focus-visible
- Skip-Link, prefers-reduced-motion, Windows High Contrast

### Design System und OCR
- Card-Varianten via cva, Button xs/icon-sm
- Echtes Tauri Tesseract OCR-Backend statt Stub
- Fix: Konsolen-Flash-Loop unter Windows beim Tray-Betrieb

---

## Patch Hub (Community-Übersetzungspakete)

Der Patch Hub ist ein Marktplatz im Stil des Steam Workshop zum Teilen und Herunterladen von Community-Übersetzungspaketen, der vom GameStringer-Community-Server bereitgestellt wird. Öffnen Sie ihn über den Eintrag **Patch Hub** in der Seitenleiste (orange/bernsteinfarbener Bereich).

### Pakete durchsuchen
Die Hauptansicht listet veröffentlichte Pakete mit Suche und Sortierung auf (am häufigsten heruntergeladen, am besten bewertet, kürzlich aktualisiert, Fertigstellungsgrad). Jede Karte zeigt das Spiel, die Quell- und Zielsprache (Quelle→Ziel), den Fertigstellungsgrad in %, die Bewertung und die Anzahl der Downloads. Klicken Sie auf ein Paket, um seine Detailseite mit Statistiken, Beschreibung, enthaltenen Dateien und Änderungsprotokoll zu öffnen.

### Ein Paket herunterladen
Klicken Sie auf der Detailseite eines Pakets auf **Download** (Herunterladen). GameStringer ruft alle Dateien des Pakets vom Community-Server ab und speichert sie lokal als `.gspack`-Bündel in Ihrer Paketbibliothek (`Documents/GameStringer/packs`). Von dort aus können Sie das Paket verwalten und es von der Detailseite eines Spiels aus importieren, um die Übersetzung anzuwenden.

### Ein Paket veröffentlichen
Klicken Sie auf **Publish patch** (Patch veröffentlichen), um das Veröffentlichungsformular zu öffnen. Geben Sie den Paketnamen, das Spiel, die Quell- und Zielsprache, eine optionale Beschreibung und Tags ein und fügen Sie Ihre Übersetzungsdatei(en) an. Wenn Sie im Community Hub angemeldet sind, wird das Paket auf den Community-Server hochgeladen und durchläuft eine Moderationswarteschlange, bevor es öffentlich sichtbar wird. Wenn Sie nicht angemeldet sind, wird das Paket als lokaler Entwurf gespeichert — melden Sie sich an und veröffentlichen Sie erneut, um es online zu teilen.

> Für die Online-Veröffentlichung ist ein Community-Hub-Konto erforderlich (getrennt von Ihrem lokalen Profil). Das Durchsuchen und Herunterladen funktioniert ohne Konto.

---

## Neu in v1.8.1

### Live-Übersetzungs-Overlay
- Gehen Sie zur Seite **/live-translate** oder drücken Sie **Strg+Alt+O**
- Wählen Sie Quell-/Zielsprache und AI-Anbieter
- Klicken Sie auf **Start** — das Overlay erscheint über dem Spiel
- Text wird alle 2 Sekunden per OCR erfasst
- Übersetzungen erscheinen als transparente Overlay-Boxen
- Diff-Erkennung überspringt unveränderten Text (spart API-Aufrufe)

### Hub-Marktplatz
- Gehen Sie zum **Community Hub**, um Übersetzungspakete zu durchsuchen
- **1-Klick-Installation**: Herunterladen → Validieren → Importieren
- Bewerten und rezensieren Sie Community-Pakete
- Veröffentlichen Sie Ihre eigenen Übersetzungen als **.gspack**-Dateien
- Benutzerprofile mit Reputation und Abzeichen

### Translation-Memory-Netzwerk
- Aktivieren Sie es unter **Einstellungen → TM-Netzwerk**
- Opt-in: Ihre hochwertigen Übersetzungen fließen in den globalen Pool ein
- Datenschutz zuerst: Quelltext gehasht, keine Benutzerdaten geteilt
- Der nächste Benutzer, der dasselbe Spiel übersetzt, erhält vorausgefüllte Vorschläge
- Automatisch in die Übersetzungspipeline integriert

### AI-Synchronisations-Pipeline
- Gehen Sie zur Seite **/dubbing**
- Wählen Sie den Spieleordner und konfigurieren Sie Sprachen/Stimme
- 7-Schritt-Pipeline: Scannen → Transkribieren → Übersetzen → Synthetisieren → Patchen → Lippensynchronisation → Untertitel
- Längenanpassung hält die übersetzte Audiodatei genauso lang wie das Original
- Charakter-Stimmprofile mit 16 Archetypen

### Plugin-System
- Die Community kann neue Spiel-Engine-Patcher in JavaScript erstellen
- Keine Rust-Kompilierung erforderlich
- Vorlagen-Generator erstellt vollständiges Plugin-Gerüst
- Plugins werden als **.gsplugin**-Pakete verteilt

---

## Neu in v1.9.0

### Community Hub UI-Verbesserungen
- **Redesigned Community Hub**: saubereres, konsistentes Design ohne übermäßige Farbverläufe und dekorative Blobs
- **Kompakte KPI-Cards**: kleinere, dezentere Statistik-Cards mit minimalen Farben
- **Minimalistische Category-Cards**: sauberes Design ohne schwere Farbverläufe und Schatten
- **Einheitliche Trending-Cards**: konsistente Gestaltung über alle Card-Typen

### Kompakte Freunde-Sidebar
- **Reduzierte Breite**: von 72 auf 56 (w-56) für mehr Bildschirmplatz
- **Kompakte Friend-Cards**: kleinere Avatare (7x7), engere Abstände
- **Kleinere Abschnitte**: Online/Offline-Header mit reduzierter Textgröße
- **Ultra-dünne Scrollbar**: 4px, standardmäßig unsichtbar, erscheint beim Hover

### Verbesserungen an der beständigen Chat
- **Diskreter Chat-Button**: elegant, kleiner Button unten rechts
- **Auf allen Seiten sichtbar**: Chat im gesamten App zugänglich
- **Saubereres Design**: übermäßige Animationen und Dekorationen entfernt

### Supabase-Social-Funktionen
- **Kompatibles Schema**: Supabase-Social-Schema an Frontend-Erwartungen angepasst (tools/supabase_social_compatible.sql)
- **RLS vorübergehend deaktiviert**: für einfacheres Debugging der Social-Funktionen
- **Chat-Participants-Fix**: Spaltennamen für UUID-Validierung korrigiert

### Bug-Fixes
- **Chat-Loop-Fix**: chatAttempted-Status hinzugefügt, um Endlosschleife in startDirectChat zu verhindern
- **Mock-Data-Entfernung**: ungültige UUID-Mock-Daten (user-123, etc.) entfernt, die 400-Fehler verursachten
- **Ollama-IPC-Fix**: Alle check_ollama_status-IPC-Aufrufe durch direktes HTTP zu localhost:11434 ersetzt
- **Stores-Link**: Stores-Link im Sidebar-Ressourcenabschnitt hinzugefügt
- **Epic-Connect**: von defektem OAuth zu Anmelde-Modal mit Anmeldedaten geändert
- **Verbindungstest**: testConnection verwendet nun echte Tauri-Befehle statt simulierter API
- **Disconnect-Fix**: Löschung von Epic/Steam-Anmeldedaten im Tauri-Backend hinzugefügt
- **Presence-Fix**: Session-Guard in updatePresence hinzugefügt, um 400 Bad Request zu vermeiden

---

## Was ist neu in v1.9.0

### 🟢 Einheitliche Online-Präsenz

Einheitliches Präsenzsystem, das Supabase Realtime und Datenbank kombiniert:

- **Sofortige Updates**: Online-Nutzer erscheinen in Echtzeit (Supabase Realtime Presence)
- **Globaler Heartbeat**: Präsenzstatus wird automatisch alle 30 Sekunden aktualisiert
- **Auto-away**: Wenn das Fenster 2+ Minuten nicht fokussiert ist, wird der Status "Abwesend"
- **Auto-online**: Wenn das Fenster wieder fokussiert wird, kehrt der Status zu "Online" zurück
- **DB-Fallback**: Wenn Realtime nicht verfügbar ist, verwendet das System die Datenbank als Fallback
- **Aktualisiertes Widget**: Das "Online-Nutzer"-Widget zeigt Benutzernamen, Avatare und Realtime-Indikator

### 🔔 System-Tray-Benachrichtigungen

Native OS-Benachrichtigungen für wichtige Ereignisse:

- **💬 Chat-Nachrichten**: OS-Benachrichtigung bei einer Nachricht im Community-Chat
- **✅ Übersetzungen abgeschlossen**: Benachrichtigung bei erfolgreicher Übersetzung
- **❌ Übersetzungs-/Systemfehler**: Benachrichtigung bei kritischen Fehlern (immer sichtbar)
- **🔄 App-Updates**: Benachrichtigung bei verfügbarem GameStringer-Update
- **🎮 Spiel-Updates**: Benachrichtigung, wenn ein aktualisiertes Spiel den Patch ungültig gemacht haben könnte
- **🟢 Freunde online**: Benachrichtigung, wenn ein Freund online kommt
- **📰 Neuigkeiten**: Benachrichtigungen für Community-News

**Konfiguration**: Einstellungen → Benachrichtigungen → System-Tray-Benachrichtigungen
- Toggle für jeden Benachrichtigungstyp
- **Ruhezeiten**: Benachrichtigungen in bestimmten Stunden unterdrücken (z.B. 23:00-07:00)
- **Test-Button**: Testbenachrichtigung senden zur Überprüfung
- **Tray-Tooltip**: Das Tray-Icon zeigt die Anzahl ungelesener Benachrichtigungen

### 🛡️ Error Boundaries + Crash-Recovery

Schutz vor Komponentenabstürzen:

- **WidgetErrorBoundary**: Wenn ein Widget abstürzt, wird eine kompakte Meldung angezeigt und automatisch nach 5 Sekunden versucht, es wiederherzustellen (max. 3 Versuche)
- **AppErrorBoundary**: Bei einem App-Absturz wird ein Fehlerbildschirm mit "App neu laden"-Option angezeigt
- **Auto-Recovery**: Widgets stellen sich automatisch ohne Benutzereingriff wieder her

### 🌐 Netzwerkresilienz / Offline-Modus

Korrekte Behandlung von Verbindungsabbrüchen:

- **Netzwerk-Monitor**: Erkennt Online-/Offline-Status + Supabase-Gesundheitsprüfung alle 30 Sekunden
- **Verbindungsstatusleiste**: Rote Leiste oben wenn offline, amber wenn Supabase down, grün wenn Verbindung wiederhergestellt
- **Retry mit Backoff**: Fehlgeschlagene Netzwerkoperationen werden automatisch mit exponentiellem Backoff (1s, 2s, 4s) erneut versucht
- **Offline-Warteschlange**: Im Offline-Modus werden Operationen (Chat-Nachrichten, Präsenz-Updates) in die Warteschlange gestellt und bei Verbindungsrückkehr ausgeführt
- **"Offline-Modus"**: Änderungen werden automatisch synchronisiert, wenn die Verbindung zurückkehrt

### 🎙️ Charakter-Sprachprofile (Voice Cloning)

System zur Bewahrung der Charakter-"Stimme" bei der Übersetzung:

- **Auto-Extraktion**: Analysiert Spieldialoge, um Charaktere und ihren Sprachstil zu identifizieren
- **16 verfügbare Töne**: Formell, Casual, Aggressiv, Sanft, Mysteriös, Komödiantisch, Dramatisch, Stoisch, Sarkastisch, Weise, Kindlich, Edel, Pirat, Militärisch, Akademisch, Straßen-Slang
- **5 Formalitätsstufen**: Sehr formell → Sehr informell
- **5 Altersgruppen**: Kind, Teenager, Junger Erwachsener, Erwachsener, Älterer
- **Sprachmuster**: Automatische Erkennung von Mustern (veraltete Wörter, Ausrufe, häufige Fragen)
- **Catchphrases**: Automatische Identifizierung wiederkehrender Charakterausdrücke
- **Prompt-Injektion**: Sprachprofile werden automatisch in den Übersetzungs-Prompt injiziert
- **Standardprofil**: Ein Profil als Fallback für nicht identifizierte Charaktere festlegen

**Verwendung**:
1. Auf der Auto-Translate-Seite erscheint nach dem Laden der Dateien das Panel "Charakter-Sprachprofile"
2. Klicken Sie auf **"Auto-Extrahieren"** zur Analyse der Dialoge
3. Oder erstellen Sie Profile manuell mit **"Neues Profil"**
4. Profile werden automatisch bei der Übersetzung angewendet

### 🧠 Fine-Tuning-Infrastruktur

System zum Generieren von Trainings-Datasets und Verwalten von spiel-spezifischen Modellen:

- **Dataset aus Korrekturen**: JSONL-Datasets aus menschlichen Korrekturen generieren (Adaptive MT)
- **4 Exportformate**: OpenAI JSONL, Ollama JSONL, Alpaca JSON, ChatML TXT
- **Nur Genehmigte**: Option, nur genehmigte Korrekturen im Dataset zu verwenden
- **Modellverwaltung**: Spiel-spezifische Fine-Tuned-Modelle registrieren und verwalten
- **Ollama-Integration**: Ollama-Verfügbarkeit für lokales Training prüfen
- **Dataset-Statistiken**: Beispielanzahl, durchschnittliche Länge, Qualitätsbewertung

**Verwendung**:
1. Gehen Sie zu **Einstellungen → AI → Fine-Tuning-Infrastruktur**
2. Wählen Sie das Sprachpaar und klicken Sie auf **"Generieren"**
3. Klicken Sie auf **"Export"** zum Herunterladen im gewünschten Format
4. Verwenden Sie das Dataset für Fine-Tuning mit Ollama oder Cloud-Anbietern

### ⚡ Code Splitting / Lazy Loading

Optimierung der Startzeit:

- 8 schwere Komponenten (Chat, Hintergrund-Jobs, Befehlspalette usw.) werden nur bei Bedarf geladen
- Die App startet schneller und verbraucht weniger Speicher

---

GameStringer v1.9.0 - Anleitung aktualisiert am 26.04.2026
