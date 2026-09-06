import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
);

export default defineConfig(() => {
  const buildTimestamp = new Date().toISOString();
  const appVersion = packageJson.version || '1.0.0';

  return {
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      __APP_BUILD_ID__: JSON.stringify(buildTimestamp),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'diagnostic-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/diagnostic-report', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const targetPath = path.resolve(__dirname, 'carousel-diagnostic.json');
                  fs.writeFileSync(targetPath, body);
                  console.log('[DIAGNOSTIC] Report received and written to', targetPath);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ status: 'ok' }));
                } catch (e: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            } else {
              res.writeHead(405);
              res.end();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
