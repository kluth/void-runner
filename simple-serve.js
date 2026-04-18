const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4200;
const ROOT = path.join(__dirname, 'dist/hacker-game/browser');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.ico': 'image/x-icon',
    '.map': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
    
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(ROOT, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Error loading ' + url);
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        }
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`SECURE_STATIC_SERVER live on http://localhost:${PORT}`);
});
