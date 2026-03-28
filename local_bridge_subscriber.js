const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const SEARCH_ROOTS = [
    '/Users/jaeyoung/.gemini/antigravity/playground',
    '/Users/jaeyoung/바이브코딩'
];

/**
 * 활성화된 워크스페이스를 동적으로 검색합니다.
 */
function discoverWorkspaces() {
    const discovered = [];
    
    // 기본 수동 등록 (검색에 안 걸릴 수 있는 중요 경로)
    discovered.push({ id: 'antigravity-link', name: 'Antigravity Link (Base)', path: '/Users/jaeyoung/.gemini/antigravity/playground/velvet-aphelion' });

    SEARCH_ROOTS.forEach(root => {
        try {
            if (!fs.existsSync(root)) return;
            const items = fs.readdirSync(root);
            
            items.forEach(item => {
                const fullPath = path.join(root, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    // 활성 지표 확인 (task.md, implementation_plan.md 등이 있는지)
                    const hasTask = fs.existsSync(path.join(fullPath, 'task.md'));
                    const hasPlan = fs.existsSync(path.join(fullPath, 'implementation_plan.md'));
                    const hasGit = fs.existsSync(path.join(fullPath, '.git'));
                    
                    if (hasTask || hasPlan || hasGit) {
                        // 중복 방지 (ID는 폴더 이름)
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
        } catch (err) {
            console.error(`Error scanning ${root}:`, err.message);
        }
    });

    return discovered;
}

const server = http.createServer((req, res) => {
    // CORS 헤더 (Vercel에서 직접 부를 때 필요할 수 있음)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'GET') {
        // 워크스페이스 목록 반환
        const workspaces = discoverWorkspaces();
        console.log(`[Discovery] Serving ${workspaces.length} workspaces`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ workspaces }));
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { workspaceId, message, sender } = data;

                // 동적으로 경로 찾기
                const workspaces = discoverWorkspaces();
                const target = workspaces.find(w => w.id === workspaceId);

                if (!target) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Workspace not found in discovery' }));
                }

                const taskFile = path.join(target.path, 'remote_tasks.md');
                const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const logEntry = `## [${timestamp}] From: ${sender || 'Antigravity Link Mobile'}\n\n${message}\n\n---\n\n`;

                fs.appendFileSync(taskFile, logEntry);
                console.log(`[${timestamp}] 📡 Link Signal received for ${target.id}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, timestamp, target: target.id }));
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
    console.log(`\n🚀 Antigravity Link: Dynamic Discovery Bridge is Active`);
    console.log(`🛰️  Listening on port ${PORT}`);
    console.log(`📂 Scanning playground & workspaces...`);
    console.log(`\n[Action] Cloudflare Tunnel을 실행하세요:`);
    console.log(`cloudflared tunnel --url http://localhost:${PORT}\n`);
});
