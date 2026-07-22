import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
