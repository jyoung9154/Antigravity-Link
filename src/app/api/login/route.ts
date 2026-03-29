import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { user, password } = await request.json();

    const expectedUser = process.env.AUTH_USER || 'antigravity';
    const expectedPass = process.env.AUTH_PASS || 'link';

    if (user === expectedUser && password === expectedPass) {
      const cookieStore = await cookies();
      
      // Set a simple session cookie
      cookieStore.set('antigravity_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('antigravity_session');
  return NextResponse.json({ success: true });
}

