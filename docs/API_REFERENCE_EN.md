# API Reference - GameStringer

> ℹ️ **Two runtime modes — read this first.** The `/api/*` routes below are real Next.js API routes that work in **web/dev mode** (`npm run dev`). However, the **desktop app is built with `output: 'export'`** (static export, see `next.config.js`), which **strips all `/api/*` routes**. In the packaged desktop (Tauri) app those endpoints do **not** exist: the frontend talks to the Rust backend via Tauri **`invoke()`** commands instead. Any `fetch('/api/...')` left in the UI works only in web/dev and will fail in the desktop build — see the project rule "0 active `fetch('/api/')`". The **Public API v1** (`app/api/v1`) is the external/integration HTTP API and applies when the app runs as a server, not in the static-export desktop build.

## 🌐 Overview

GameStringer exposes two interfaces: **(1)** Next.js API Routes (`/api/*`) used in web/dev mode, documented below; and **(2)** Tauri `invoke()` commands, the actual backend interface of the packaged desktop app. The APIs below are organized by functional domain and follow RESTful principles (web/dev mode).

## 🔐 Authentication

### Base URL

```text
http://localhost:3000/api
```

### Required Headers

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <session-token>' // For protected endpoints
}
```

## 📚 Endpoints

### 🎮 Games API

#### `GET /api/games`

Retrieves the list of games.

**Response:**

```json
[
  {
    "id": "game-id",
    "title": "Game Title",
    "path": "/path/to/game",
    "isInstalled": true
  }
]
```

#### `POST /api/games`

Creates a new game.

**Request Body:**

```json
{
  "title": "Game Title",
  "installPath": "/path/to/game",
  "platform": "steam",
  "isInstalled": true
}
```

### 🔧 Patches API

#### `GET /api/patches`

Lists all patches or a specific one.

**Query Parameters:**

- `id` (optional): Specific patch ID
- `gameId` (optional): Filter by game

**Response:**

```json
[
  {
    "id": "patch-id",
    "gameId": "game-id",
    "name": "Patch Name",
    "description": "Description",
    "version": "1.0.0",
    "author": "Author Name",
    "language": "it",
    "files": [],
    "isActive": true,
    "createdAt": "2025-07-01T12:00:00Z",
    "updatedAt": "2025-07-01T12:00:00Z"
  }
]
```

#### `POST /api/patches`

Creates a new patch.

**Request Body:**

```json
{
  "gameId": "game-id",
  "name": "Patch Name",
  "description": "Description",
  "version": "1.0.0",
  "author": "Author Name",
  "language": "it"
}
```

#### `PUT /api/patches`

Updates an existing patch.

**Request Body:**

```json
{
  "id": "patch-id",
  "name": "Updated Name",
  "description": "Updated Description",
  "version": "1.0.1"
}
```

#### `DELETE /api/patches`

Deletes a patch.

**Query Parameters:**

- `id` (required): ID of the patch to delete

#### `POST /api/patches/export`

Exports a patch as a ZIP.

**Request Body:**

```json
{
  "patchId": "patch-id",
  "options": {
    "includeOriginals": true,
    "compress": true
  }
}
```

**Response:** Binary ZIP file

### 🌍 Translations API

#### `GET /api/translations`

Retrieves translations with filters.

**Query Parameters:**

- `gameId` (optional): Filter by game
- `status` (optional): pending | completed | reviewed | edited
- `search` (optional): Text search

**Response:**

```json
[
  {
    "id": "translation-id",
    "gameId": "game-id",
    "filePath": "/path/to/file",
    "originalText": "Original text",
    "translatedText": "Translated text",
    "targetLanguage": "it",
    "sourceLanguage": "en",
    "status": "completed",
    "confidence": 0.95,
    "isManualEdit": false,
    "context": "UI Button",
    "createdAt": "2025-07-01T12:00:00Z",
    "updatedAt": "2025-07-01T12:00:00Z",
    "game": {
      "id": "game-id",
      "title": "Game Title"
    },
    "suggestions": []
  }
]
```

#### `POST /api/translations`

Creates a new translation.

**Request Body:**

```json
{
  "gameId": "game-id",
  "filePath": "/path/to/file",
  "originalText": "Text to translate",
  "targetLanguage": "it",
  "sourceLanguage": "en"
}
```

#### `PUT /api/translations`

Updates a translation.

**Request Body:**

```json
{
  "id": "translation-id",
  "translatedText": "Updated translation",
  "status": "edited",
  "isManualEdit": true
}
```

#### `DELETE /api/translations`

Deletes a translation.

**Query Parameters:**

- `id` (required): Translation ID

#### `POST /api/translations/suggestions`

Generates AI suggestions for a translation.

**Request Body:**

```json
{
  "translationId": "translation-id",
  "originalText": "Text to translate",
  "targetLanguage": "it"
}
```

**Response:**

```json
[
  {
    "id": "suggestion-id",
    "suggestion": "Suggested translation",
    "confidence": 0.92,
    "provider": "openai"
  }
]
```

#### `POST /api/translations/import`

Imports translations from a file.

**Request Body (multipart/form-data):**

- `file`: File to import (JSON, CSV, PO)
- `gameId`: Game ID
- `language`: Target language

#### `GET /api/translations/export`

Exports translations.

**Query Parameters:**

- `gameId` (required): Game ID
- `format` (required): json | csv | po
- `status` (optional): Filter by status

### 🏪 Stores API

#### `POST /api/stores/test-connection`

Tests the connection to a store.

**Request Body:**

```json
{
  "provider": "steam-credentials"
}
```

**Response:**

```json
{
  "connected": true,
  "error": null
}
```

### 🔑 Auth API

#### `POST /api/auth/signin`

Sign in with a provider.

**Supported Providers:**

- `steam-credentials`
- `epicgames`
- `ubisoft-credentials`
- `itchio-credentials`
- `gog-credentials`
- `origin-credentials`
- `battlenet-credentials`

#### `POST /api/auth/signout`

Signs out the current user.

#### `GET /api/auth/session`

Retrieves the current session.

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "accounts": [
      {
        "provider": "steam-credentials",
        "providerAccountId": "76561198000000000"
      }
    ]
  }
}
```

### 🛠️ Utilities API

#### `POST /api/utilities/howlongtobeat`

Searches for completion-time information.

**Request Body:**

```json
{
  "search": "The Witcher 3"
}
```

**Response:**

```json
{
  "gameId": 10270,
  "name": "The Witcher 3: Wild Hunt",
  "imageUrl": "...",
  "timeLabels": [
    ["Main Story", "51½ Hours"],
    ["Main + Extras", "103 Hours"],
    ["Completionist", "173 Hours"]
  ]
}
```

#### `GET /api/utilities/steamgriddb`

Searches for game artwork.

**Query Parameters:**

- `search` (required): Game name

**Headers:**

- `X-API-Key` (required): SteamGridDB API key

**Response:**

```json
[
  {
    "id": 1234,
    "url": "https://...",
    "thumb": "https://...",
    "width": 920,
    "height": 430
  }
]
```

#### `POST /api/utilities/preferences`

Saves utility preferences.

**Request Body:**

```json
{
  "service": "steamgriddb",
  "enabled": true,
  "apiKey": "your-api-key"
}
```

#### `DELETE /api/utilities/preferences`

Removes utility preferences.

**Query Parameters:**

- `service` (required): Service name

### 🚂 Steam API

#### `POST /api/steam/auto-detect-config`

Automatically detects the Steam configuration.

**Response:**

```json
{
  "sharedAccounts": ["76561198000000001", "76561198000000002"],
  "steamPath": "C:\\Program Files (x86)\\Steam"
}
```

## 🔒 Error Handling

All APIs follow a standard error schema:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `400` - Bad Request: Missing or invalid parameters
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

## 📝 Rate Limiting

- **Requests per minute**: 60 (authenticated), 30 (unauthenticated)
- **Response headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## 🧪 Testing

### Test Environment

```bash
# Set environment variables
cp .env.example .env.test

# Run API tests
npm run test:api
```

### Example with cURL

```bash
# Get games
curl http://localhost:3000/api/games

# Create patch (authenticated)
curl -X POST http://localhost:3000/api/patches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"gameId":"1","name":"Test Patch"}'
```

## 🔗 TypeScript SDK

```typescript
// TypeScript client example
class GameStringerAPI {
  private baseURL = "http://localhost:3000/api";

  async getGames(): Promise<Game[]> {
    const res = await fetch(`${this.baseURL}/games`);
    return res.json();
  }

  async createPatch(data: PatchData): Promise<Patch> {
    const res = await fetch(`${this.baseURL}/patches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }
}
```

---

**Last updated**: July 1, 2025
