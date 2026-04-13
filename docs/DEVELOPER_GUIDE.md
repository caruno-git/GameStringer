# GameStringer Developer Guide

Practical reference for developers working on or contributing to the GameStringer codebase.

---

## 1. Architecture Overview

GameStringer is a desktop app for managing and translating game libraries. It combines:

- **Next.js 15 (App Router)** -- React frontend with `'use client'` pages
- **Tauri 2 (Rust)** -- native backend for file I/O, process injection, store integrations
- **SQLite via Prisma** -- local database for game metadata, translations, profiles
- **Shadcn/ui + Radix + Tailwind** -- component library and styling

### How Frontend and Backend Communicate

The frontend calls Rust commands through an invoke bridge (`lib/tauri-api.ts`). Tauri automatically converts JS camelCase args to Rust snake_case. The bridge detects whether the app is running inside Tauri or a browser and throws a controlled error if Tauri is unavailable.

```
React Page --> invoke<T>('command_name', { args }) --> Tauri Rust Command --> Result<T>
```

### Build Modes

Configured in `next.config.js`:
- **Dev mode**: `npm run dev` -- runs Next.js dev server, Tauri connects to it
- **Tauri production**: `TAURI_BUILD=true` triggers static export (`output: 'export'`, `distDir: 'out'`)

---

## 2. Directory Map

```
app/                    Pages (App Router, ~73 routes)
  api/                  API routes (translate, library sync, auth, etc.)
  library/              Library page
  editor/               Translation editor
  translator/           Pro translator, MTPE
  ...
components/             React components (~254 files)
  ui/                   Shadcn/ui primitives (button, badge, dialog, etc.)
  modals/               Modal dialogs (steam-modal, epic-modal)
  tools/                Feature panels (unity-patcher, community-hub)
  layout/               Main layout, navigation
  ...
lib/                    Utilities, services, types (~189 files)
  i18n/                 Internationalization (translations, locales/)
  client-logger.ts      Client-side logging singleton
  tauri-api.ts          Tauri invoke bridge
  ai-translate-*.ts     AI translation services
  ...
hooks/                  Custom React hooks
  use-auto-backup.ts
  use-batch-operations.ts
  use-global-hotkeys.ts
  use-notifications.ts
  use-profiles.ts
  ...
src-tauri/
  src/
    commands/           Rust commands (~99 files)
      mod.rs            Command module registry
      steam.rs          Steam integration
      unity_patcher.rs  Unity game patching
      ...
    lib.rs              Tauri app setup, module declarations
    main.rs             Entry point
    models.rs           Shared Rust types
  Cargo.toml            Rust dependencies
__tests__/              Vitest test suites
  lib/                  Unit tests for lib/
  components/           Component tests
  hooks/                Hook tests
  ...
prisma/
  schema.prisma         SQLite schema (Game, Translation, Profile, etc.)
docs/                   Project documentation
```

---

## 3. Key Patterns

### Logging

Use the singleton `clientLogger` from `lib/client-logger.ts`. It buffers logs and flushes to `/api/logs` in production; in dev it logs to console.

```typescript
import { clientLogger } from '@/lib/client-logger';

// Simple message
clientLogger.info('Library loaded');

// With error object (2nd arg accepts unknown -- errors, objects, primitives)
clientLogger.error('Failed to fetch games', error);

// With component name and metadata
clientLogger.warn('Stale cache', 'LibraryPage', { age: 3600 });

// Component-scoped logger (binds component name automatically)
import { createClientComponentLogger } from '@/lib/client-logger';
const log = createClientComponentLogger('MyComponent');
log.info('Mounted');
log.logError(error, { context: 'init' });
```

Log levels: `debug`, `info`, `warn`, `error`, `fatal`. Fatal flushes immediately.

### i18n

11 languages: it, en, es, fr, de, ja, zh, ko, pt, ru, pl.

```typescript
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t, language } = useTranslation();
  return <h1>{t('library.title')}</h1>;
}
```

Translation keys live in JSON files under `lib/i18n/locales/`. The `I18nProvider` in `lib/i18n/index.tsx` wraps the app, reads language from localStorage (per-profile), and applies RTL direction for applicable languages.

### Tauri Bridge

```typescript
import { invoke } from '@/lib/tauri-api';

// Call a Rust command with typed return
const games = await invoke<Game[]>('get_library_games', { profileId: '...' });
```

The bridge:
- Lazy-loads `@tauri-apps/api/core` on first call
- Returns controlled errors when not in Tauri environment
- Sanitizes sensitive fields in debug logs
- Handles credential and rate-limit errors gracefully

### State Management

No global state library. Pages use `useState` + `useEffect` + `useCallback`. Some pages use global cache objects on `globalThis` to survive HMR (see `app/library/page.tsx`). IndexedDB via `idb-keyval` for persistent client caches (covers, dates).

### UI Components

Based on shadcn/ui (Radix primitives + Tailwind). Icons from `lucide-react`. Animations with `framer-motion`. Long lists use `react-virtuoso`.

```typescript
import { Badge } from '@/components/ui/badge';
import { Gamepad2 } from 'lucide-react';
```

### Error Handling

Standard pattern throughout the codebase:

```typescript
try {
  const result = await invoke<Data>('some_command', args);
  // use result
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  clientLogger.error('Operation failed', error);
  toast.error(message);
}
```

---

## 4. Adding a New Page

1. **Create the route file** at `app/my-feature/page.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { invoke } from '@/lib/tauri-api';
import { clientLogger } from '@/lib/client-logger';

export default function MyFeaturePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<MyData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await invoke<MyData>('get_my_data');
        setData(result);
      } catch (error: unknown) {
        clientLogger.error('Failed to load my feature', error);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('myFeature.title')}</h1>
      {/* component content */}
    </div>
  );
}
```

2. **Add translations** -- add keys to each locale file in `lib/i18n/locales/` (at minimum `en.json` and `it.json`).

3. **Add navigation** -- update `components/layout/main-layout.tsx` to include a link/menu item.

4. **Add the Rust command** if needed (see next section).

---

## 5. Adding a New Rust Command

1. **Create or edit a command file** in `src-tauri/src/commands/`:

```rust
// src-tauri/src/commands/my_feature.rs
use tauri::command;

#[command]
pub async fn get_my_data(profile_id: String) -> Result<Vec<MyItem>, String> {
    // implementation
    Ok(vec![])
}
```

2. **Register the module** in `src-tauri/src/commands/mod.rs`:

```rust
pub mod my_feature;
```

3. **Register the command handler** in the Tauri builder (typically in `src-tauri/src/lib.rs` or `main.rs`). Add your function to the `.invoke_handler(tauri::generate_handler![...])` list.

4. **Call from the frontend**:

```typescript
const data = await invoke<MyItem[]>('get_my_data', { profileId: '...' });
```

Note: Tauri automatically converts `profileId` (JS) to `profile_id` (Rust).

---

## 6. Testing

### Config

Vitest with jsdom environment, configured in `vitest.config.ts`:
- React plugin enabled
- Path aliases (`@/lib`, `@/components`, etc.) mapped
- Setup file: `src/test/setup.ts`
- Coverage via v8 provider

### Running Tests

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

### Test Patterns

Tests live in `__tests__/` mirroring the source structure. Example from `__tests__/lib/api-client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/lib/api-client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/lib/notifications', () => ({
  notifications: { error: vi.fn(), success: vi.fn() },
}));

describe('apiRequest', () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it('makes successful GET request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: 'test' }),
    });
    const result = await apiRequest('/api/test');
    expect(result.data).toEqual({ data: 'test' });
  });
});
```

Key conventions:
- Mock `fetch`, Tauri `invoke`, and external modules with `vi.mock()`
- Use `beforeEach` to reset mocks
- Test files named `*.test.ts` or `*.test.tsx`

---

## 7. Code Quality

### ESLint

```bash
npm run lint
```

Current state: clean except for ~20 unfixable architectural errors (circular dependencies, dynamic requires). The `next.config.js` sets `eslint.ignoreDuringBuilds: true` so CI runs lint as a separate quality gate.

### TypeScript

```bash
npx tsc --noEmit
```

Strict mode enabled. 2 unfixable type errors remain (third-party type mismatches). The config sets `typescript.ignoreBuildErrors: true` for the same CI-gate reason.

### npm audit

```bash
npm audit
```

2 low-risk advisories remaining (transitive dependencies).

### Bundle Optimizations

`next.config.js` configures:
- `optimizePackageImports` for lucide-react, framer-motion, recharts, etc.
- `removeConsole` in production (keeps error/warn)
- `turbopack.resolveAlias` for `winreg` browser stub

---

## 8. Common Gotchas

1. **`.env` file required for builds** -- Prisma needs `DATABASE_URL` at generate time:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. **Run `prisma generate` after `npm install`** -- the Prisma client is generated into `node_modules/.prisma/client`. Without it, imports fail.

3. **Tauri commands must be registered in two places** -- both `commands/mod.rs` (module declaration) and the `generate_handler![]` macro in `lib.rs`/`main.rs`. Missing either causes "Command not found" at runtime.

4. **`clientLogger` accepts `unknown` as 2nd arg** -- you can pass Error objects, plain objects, or primitives directly. It normalizes internally via `normalizeArgs()`. No need to stringify errors.

5. **`'use client'` on every page** -- all pages are client components (Tauri runs in a webview, no SSR). Forgetting this directive causes hydration errors.

6. **HMR cache survival** -- some pages attach caches to `globalThis` to survive React 18 double-mount and Fast Refresh. Check for `_g.__gsXxxCache` patterns before adding new global state.

7. **Tauri env detection** -- `lib/tauri-api.ts` checks for `window.__TAURI_INTERNALS__`. In browser-only dev, all `invoke()` calls throw. Pages should handle this gracefully.

8. **Italian comments in code** -- the original codebase was written in Italian. Many Rust and JS comments are in Italian. This is normal and expected.

9. **Static export for Tauri** -- production builds use `output: 'export'` (no server). API routes only work in dev mode. Features needing server endpoints use Tauri commands instead.

10. **Path aliases** -- always use `@/` imports (`@/lib/...`, `@/components/...`). Both Next.js and Vitest are configured to resolve them.
