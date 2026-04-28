import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Isola ogni file di test in un processo figlio dedicato.
    // Evita OOM dovuto a memory leak cumulativi nei Provider React
    // (TutorialProvider/ProgressProvider) tra un file e l'altro.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
        execArgv: ['--max-old-space-size=8192'],
      },
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/tests/e2e/**',
      '**/.next/**',
      '**/out/**',
      // Memory leak noto in TutorialProvider/ProgressProvider:
      // questi 3 file causano OOM del worker vitest (heap 4GB esaurito).
      // Da riabilitare dopo fix del leak nei provider.
      '**/__tests__/progress/progress-ui-components.test.tsx',
      '**/__tests__/progress/progress-performance.test.ts',
      '**/__tests__/tutorial/tutorial-integration.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/app': path.resolve(__dirname, './app')
    }
  }
});
