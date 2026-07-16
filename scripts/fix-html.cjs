// Post-process Vite build output for Capacitor WebView compatibility
// - Strips type="module" (Android WebView doesn't support ES modules reliably)
// - Adds defer so the script runs after DOM is ready
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace type="module" crossorigin scripts with deferred regular scripts
html = html.replace(
  /<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/g,
  '<script defer src="$1"></script>'
);

fs.writeFileSync(htmlPath, html);
console.log('[fix-html] Patched index.html for Capacitor');
