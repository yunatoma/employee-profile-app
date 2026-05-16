import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        include: [
          'src/features/employees/utils/**',
          'src/features/dashboard/utils/**',
        ],
      },
    },
  }),
);
