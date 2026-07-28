import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';
import { getSessionToken } from '@/lib/auth';

export async function POST() {
  try {
    const token = await getSessionToken();

    if (token) {
      await deleteSession(token);
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
