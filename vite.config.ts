import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
const appVersion=(JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8')) as {version:string}).version;
const buildRevision=(process.env.GITHUB_SHA??'local').slice(0,7);

// GitHub Actions exposes GITHUB_REPOSITORY="owner/repo".
// This keeps the same source working at localhost and owner.github.io/repo/.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS === 'true' && repository ? `/${repository}/` : '/';

export default defineConfig({
  base,
  define:{__APP_VERSION__:JSON.stringify(appVersion),__BUILD_REVISION__:JSON.stringify(buildRevision)},
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
