// Preview changes only HTTP responses. index.html is never written.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.avif': 'image/avif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

function createServer() {
  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
      let body = fs.readFileSync(file);
      if (file === path.join(root, 'index.html') && url.searchParams.get('minified') === '0') {
        body = Buffer.from(body.toString('utf8')
          .replaceAll('href="assets/css/bootstrap-talassa.min.css"', 'href="assets/css/bootstrap-talassa.css"')
          .replaceAll('href="styles.min.css"', 'href="styles.css"')
          .replaceAll('src="script.min.js"', 'src="script.js"'));
      }
      res.setHeader('Content-Type', (types[path.extname(file)] || 'application/octet-stream') + (['.html', '.css', '.js'].includes(path.extname(file)) ? '; charset=utf-8' : ''));
      res.end(body);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
}

if (require.main === module) {
  createServer().listen(8767, '127.0.0.1', () => {
    console.log('Production: http://127.0.0.1:8767/');
    console.log('Sources: http://127.0.0.1:8767/?minified=0');
  });
}
module.exports = { createServer };
