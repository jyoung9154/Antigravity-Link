import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const BRIDGE_URL = process.env.LOCAL_BRIDGE_URL;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      const bridgeRes = await fetch(BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await bridgeRes.json());
    }
    return NextResponse.json({ error: 'Local write not supported in Vercel mode without Bridge' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      console.log('Forwarding PATCH to Bridge:', BRIDGE_URL);
      const bridgeRes = await fetch(BRIDGE_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await bridgeRes.json());
    }
    return NextResponse.json({ error: 'Bridge Offline' }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (process.env.VERCEL === '1' && BRIDGE_URL) {
      const bridgeRes = await fetch(BRIDGE_URL, { cache: 'no-store' });
      return NextResponse.json(await bridgeRes.json());
    }
    return NextResponse.json({ workspaces: [{ id: 'error', name: 'Bridge Offline' }] });
  } catch (error) {
    return NextResponse.json({ workspaces: [{ id: 'error', name: 'Bridge Offline' }] });
  }
}
