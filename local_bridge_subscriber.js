require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Initialize Gemini with User API Key or environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCniUsE4fsmsLsJGLDX76dT8sqR4sXsN6U');


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

// ============================================
// Mini Autonomous Agent Loop (Gemini ReAct)
// ============================================
async function executeAgentTask(workspacePath, taskMessage) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "You are an elite coding agent executing tasks inside a specific workspace. You have access to tools to read, edit, and run commands. Complete the user's task accurately. Do not stop until you have verified success (e.g. by running tests, building, or looking at git diff). After completion, you must ALWAYS output your final summary in Korean.",
        tools: [{
            functionDeclarations: [
                {
                    name: "readFile",
                    description: "Read a file from the workspace",
                    parameters: { type: SchemaType.OBJECT, properties: { filePath: { type: SchemaType.STRING, description: "Relative path from workspace root" } }, required: ["filePath"] }
                },
                {
                    name: "writeFile",
                    description: "Write or overwrite a file in the workspace",
                    parameters: { type: SchemaType.OBJECT, properties: { filePath: { type: SchemaType.STRING, description: "Relative path" }, contents: { type: SchemaType.STRING, description: "Full new file contents" } }, required: ["filePath", "contents"] }
                },
                {
                    name: "runCommand",
                    description: "Run a bash terminal command in the workspace directory",
                    parameters: { type: SchemaType.OBJECT, properties: { command: { type: SchemaType.STRING, description: "Bash command to execute" } }, required: ["command"] }
                }
            ]
        }]
    });

    const chat = model.startChat({ history: [] });
    let prompt = `Task: ${taskMessage}\nWorkspace: ${workspacePath}`;
    let isDone = false;
    let finalResponse = "";

    console.log(`[Agent Vibe] 🤖 Waking up to process task in ${workspacePath}...`);

    while (!isDone) {
        try {
            const result = await chat.sendMessage(prompt);
            const calls = result.response.functionCalls ? result.response.functionCalls() : null;
            const call = calls && calls.length > 0 ? calls[0] : null;

            if (call) {
                console.log(`[Agent Tool] 🛠️  ${call.name} called with args => ${JSON.stringify(call.args).substring(0, 80)}...`);
                let funcResult = "";
                try {
                    const fullPath = call.args.filePath ? path.join(workspacePath, call.args.filePath) : '';
                    if (call.name === "readFile") {
                        if (!fs.existsSync(fullPath)) funcResult = "Error: File does not exist";
                        else funcResult = fs.readFileSync(fullPath, 'utf8');
                    } else if (call.name === "writeFile") {
                        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                        fs.writeFileSync(fullPath, call.args.contents);
                        funcResult = "Success: File written";
                    } else if (call.name === "runCommand") {
                        funcResult = await new Promise((resolve) => {
                            exec(call.args.command, { cwd: workspacePath }, (err, stdout, stderr) => {
                                resolve(`STDOUT:\n${stdout}\nSTDERR:\n${stderr}\nError:\n${err ? err.message : 'null'}`);
                            });
                        });
                    }
                } catch (e) {
                    funcResult = `Error: ${e.message}`;
                }

                // Truncate funcResult to avoid token overflow
                funcResult = funcResult.slice(0, 30000);
                
                prompt = [{
                    functionResponse: {
                        name: call.name,
                        response: { result: funcResult }
                    }
                }];
            } else {
                isDone = true;
                finalResponse = result.response.text();
            }
        } catch (error) {
            console.error(`[Agent Fatal Error] 🛑`, error);
            finalResponse = `Agent encountered a fatal error: ${error.message}`;
            isDone = true;
        }
    }
    
    console.log(`[Agent Vibe] ✨ Task completed.`);
    return finalResponse;
}

function getKSTTimestamp() {
    const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().replace('T', ' ').substring(0, 19);
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET') {
        if (parsedUrl.pathname === '/responses') {
            const workspaceId = parsedUrl.query.workspaceId;
            const workspaces = discoverWorkspaces();
            const target = workspaces.find(w => w.id === workspaceId);

            if (!target) {
                res.writeHead(404);
                return res.end(JSON.stringify({ error: 'Workspace not found' }));
            }

            const responseFile = path.join(target.path, 'remote_responses.md');
            let content = '';
            if (fs.existsSync(responseFile)) {
                content = fs.readFileSync(responseFile, 'utf8');
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ content }));
        }

        // Default GET (workspaces list)
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
                fs.writeFileSync(path.join(newPath, 'remote_responses.md'), `Agent responses for ${projectName} will appear here.\n\n---\n\n`);
                
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
                const timestamp = getKSTTimestamp();
                const logEntry = `## [${timestamp}] From: ${sender || 'Mobile User'}\n\n${message}\n\n---\n\n`;

                fs.appendFileSync(taskFile, logEntry);
                console.log(`[${timestamp}] 📡 Signal for ${target.id} - Spawning Autonomous Agent...`);

                // Fire & Forget: Spawn the agent asynchronously
                executeAgentTask(target.path, message).then(finalRes => {
                    const responseFile = path.join(target.path, 'remote_responses.md');
                    const resTimestamp = getKSTTimestamp();
                    const resEntry = `## [${resTimestamp}] Agent Antigravity (Auto)\n\n${finalRes}\n\n---\n\n`;
                    fs.appendFileSync(responseFile, resEntry);
                    console.log(`[${resTimestamp}] ✅ Agent responded to ${target.id}`);
                });

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
    console.log(`\n🚀 Antigravity Link: Bridge with Bidirectional Comm Active`);
    console.log(`🛰️  Listening on port ${PORT}\n`);
});
