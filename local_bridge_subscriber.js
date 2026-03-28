const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const PLAYGROUND_ROOT = '/Users/jaeyoung/.gemini/antigravity/playground';
const SEARCH_ROOTS = [
    PLAYGROUND_ROOT,
    '/Users/jaeyoung/바이브코딩'
];

function discoverWorkspaces() {
    const discovered = [];
    discovered.push({ id: 'antigravity-link', name: 'Antigravity Link (Base)', path: '/Users/jaeyoung/.gemini/antigravity/playground/velvet-aphelion' });

    SEARCH_ROOTS.forEach(root => {
        try {
            if (!fs.existsSync(root)) return;
            const items = fs.readdirSync(root);
            items.forEach(item => {
                const fullPath = path.join(root, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    const hasTask = fs.existsSync(path.join(fullPath, 'task.md'));
                    const hasPlan = fs.existsSync(path.join(fullPath, 'implementation_plan.md'));
                    const hasGit = fs.existsSync(path.join(fullPath, '.git'));
                    if (hasTask || hasPlan || hasGit) {
                        if (!discovered.find(d => d.id === item)) {
                            discovered.push({
                                id: item,
                                name: item.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                                path: fullPath,
                                active: hasTask || hasPlan
                            });
                        }
                    }
                }
            });
        } catch (err) {}
    });
    return discovered;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    if (req.method === 'GET') {
        const workspaces = discoverWorkspaces();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ workspaces }));
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const data = JSON.parse(body || '{}');

            if (req.method === 'PATCH') {
                // 신규 프로젝트 생성
                const { projectName } = data;
                if (!projectName) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: 'Project name required' }));
                }

                const newPath = path.join(PLAYGROUND_ROOT, projectName);
                if (fs.existsSync(newPath)) {
                    res.writeHead(409);
                    return res.end(JSON.stringify({ error: 'Project already exists' }));
                }

                fs.mkdirSync(newPath, { recursive: true });
                fs.writeFileSync(path.join(newPath, 'remote_tasks.md'), `# ${projectName}\n\nProject initialized via Antigravity Link.\n`);
                
                console.log(`[Creation] 🆕 New Project created: ${projectName}`);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, id: projectName }));
            }

            if (req.method === 'POST') {
                const { workspaceId, message, sender } = data;
                const workspaces = discoverWorkspaces();
                const target = workspaces.find(w => w.id === workspaceId);

                if (!target) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Workspace not found' }));
                }

                const taskFile = path.join(target.path, 'remote_tasks.md');
                const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const logEntry = `## [${timestamp}] From: ${sender || 'Mobile User'}\n\n${message}\n\n---\n\n`;

                fs.appendFileSync(taskFile, logEntry);
                console.log(`[${timestamp}] 📡 Signal for ${target.id}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, timestamp }));
            }
        } catch (err) {
            console.error('Error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Server Error' }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Antigravity Link: Bridge with Project Creation Active`);
    console.log(`🛰️  Listening on port ${PORT}\n`);
});
