import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts']
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
});
