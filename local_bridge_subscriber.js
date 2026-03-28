const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001; 

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { workspaceId, message, sender } = data;

        const WORKSPACES = {
          'playground': '/Users/jaeyoung/.gemini/antigravity/playground/velvet-aphelion',
          'vibecoding': '/Users/jaeyoung/바이브코딩'
        };

        const targetPath = WORKSPACES[workspaceId];
        if (!targetPath) {
          res.writeHead(404);
          return res.end(JSON.stringify({ error: 'Workspace path not found' }));
        }

        const taskFile = path.join(targetPath, 'remote_tasks.md');
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const logEntry = `## [${timestamp}] From: ${sender || 'Antigravity Link Mobile'}\n\n${message}\n\n---\n\n`;

        fs.appendFileSync(taskFile, logEntry);
        console.log(`[${timestamp}] 📡 Link Signal received for ${workspaceId}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, timestamp }));
      } catch (err) {
        console.error('Error processing Link signal:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Antigravity Link: Local Bridge is Active`);
  console.log(`🛰️  Listening on port ${PORT}\n`);
  console.log(`[Action] Cloudflare Tunnel을 실행하세요:`);
  console.log(`cloudflared tunnel --url http://localhost:${PORT}\n`);
});
