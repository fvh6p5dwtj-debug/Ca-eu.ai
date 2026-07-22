import { NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
