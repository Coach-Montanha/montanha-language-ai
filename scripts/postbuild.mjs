import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

if (existsSync('dist/index.html')) {
  copyFileSync('dist/index.html', 'dist/auth.html');
  mkdirSync('dist/auth', { recursive: true });
  copyFileSync('dist/index.html', 'dist/auth/index.html');
  console.log('Postbuild: generated dist/auth.html and dist/auth/index.html');
}
