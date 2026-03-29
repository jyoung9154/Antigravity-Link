import { NextResponse } from 'next/server';

const BRIDGE_URL = process.env.LOCAL_BRIDGE_URL;
const BRIDGE_TOKEN = process.env.BRIDGE_API_KEY || 'antigravity-secure-link';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
  }

  try {
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      const bridgeRes = await fetch(`${BRIDGE_URL}/responses?workspaceId=${workspaceId}`, { 
        cache: 'no-store',
        headers: {
          'x-bridge-token': BRIDGE_TOKEN
        }
      });
      if (!bridgeRes.ok) throw new Error('Bridge err');
      const data = await bridgeRes.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ content: 'Bridge Offline or Local Environment' });
  } catch (error) {
    return NextResponse.json({ content: 'Bridge Offline' }, { status: 502 });
  }
}
