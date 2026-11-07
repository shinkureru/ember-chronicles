import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Actions exposes GITHUB_REPOSITORY="owner/repo".
// This keeps the same source working at localhost and owner.github.io/repo/.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS === 'true' && repository ? `/${repository}/` : '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
