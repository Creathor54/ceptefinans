import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Manually declare process to avoid type errors when @types/node is missing
declare const process: {
  cwd: () => string;
  env: Record<string, string | undefined>;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so it works in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
    }
  };
});