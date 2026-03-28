import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const BRIDGE_URL = process.env.LOCAL_BRIDGE_URL;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Vercel 환경일 경우 로컬 PC 브릿지로 전달
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      console.log('Forwarding POST to Antigravity Link Bridge:', BRIDGE_URL);
      const bridgeRes = await fetch(BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await bridgeRes.json());
    }

    // 로컬 환경일 경우 (기존 방식 유지 또는 브레드크럼)
    const { workspaceId, message, sender } = data;
    const taskFile = path.join('/Users/jaeyoung/.gemini/antigravity/playground', workspaceId, 'remote_tasks.md');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `## [${timestamp}] From: ${sender || 'Mobile Web'}\n\n${message}\n\n---\n\n`;
    
    await fs.mkdir(path.dirname(taskFile), { recursive: true });
    await fs.appendFile(taskFile, logEntry);

    return NextResponse.json({ success: true, timestamp });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Vercel 환경일 경우 로컬 PC 브릿지에서 동적으로 가져옴
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      console.log('Fetching dynamic workspaces from Bridge:', BRIDGE_URL);
      const bridgeRes = await fetch(BRIDGE_URL, { cache: 'no-store' });
      return NextResponse.json(await bridgeRes.json());
    }

    // 로컬 환경일 경우 정적 또는 기본 반환
    return NextResponse.json({ 
      workspaces: [
        { id: 'playground', name: 'Local Playground' }
      ] 
    });
  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json({ workspaces: [{ id: 'error', name: 'Bridge Offline' }] });
  }
}
