import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 워크스페이스 목록
const WORKSPACES = [
  { id: 'playground', name: 'Playground', path: '/Users/jaeyoung/.gemini/antigravity/playground/velvet-aphelion' },
  { id: 'vibecoding', name: 'Vibe Coding', path: '/Users/jaeyoung/바이브코딩' },
];

const BRIDGE_URL = process.env.LOCAL_BRIDGE_URL;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { workspaceId, message, sender } = data;

    // Vercel 환경일 경우 로컬 PC 브릿지로 전달
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      console.log('Forwarding to Antigravity Link Bridge:', BRIDGE_URL);
      const bridgeRes = await fetch(BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await bridgeRes.json());
    }

    // 로컬 환경일 경우 직접 파일 쓰기
    const workspace = WORKSPACES.find(w => w.id === workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const taskFile = path.join(workspace.path, 'remote_tasks.md');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let content = '';
    try { await fs.access(taskFile); } catch { content = '# Antigravity Link: Mobile Tasks\n\n'; }

    const logEntry = `## [${timestamp}] From: ${sender || 'Mobile Web'}\n\n${message}\n\n---\n\n`;
    await fs.appendFile(taskFile, content + logEntry);

    return NextResponse.json({ success: true, timestamp });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ workspaces: WORKSPACES.map(w => ({ id: w.id, name: w.name })) });
}
