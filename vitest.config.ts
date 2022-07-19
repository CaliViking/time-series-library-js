// vite.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // globals: true,
    // watch: false,
    watchExclude: ['node_modules/**', 'dist/**', 'data/**', 'digest/**', 'build/**', 'collectors/**'],
    include: ['test/**/*'],
    exclude: ['**/node_modules/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
  },
});
