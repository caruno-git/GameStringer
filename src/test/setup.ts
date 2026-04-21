import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri API
Object.defineProperty(window, '__TAURI__', {
  value: {
    tauri: {
      invoke: vi.fn()
    },
    event: {
      listen: vi.fn(),
      emit: vi.fn()
    }
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock globale i18n: evita "useTranslation must be used within an I18nProvider"
// nei test che non wrappano i componenti con <I18nProvider>.
// Il testo restituito è la key stessa (pattern comune nei test).
vi.mock('@/lib/i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/i18n')>().catch(() => ({}));
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, fallback?: string) => fallback ?? key,
      language: 'it',
      setLanguage: vi.fn(),
      availableLanguages: ['it', 'en'],
    }),
    I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});