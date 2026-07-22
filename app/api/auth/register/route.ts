import { NextResponse } from 'next/server';
import { createUser, createSession, getUserByEmail } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const user = createUser(name, email, password);
    const session = createSession(user.id);

    const response = NextResponse.json({ user, token: session.token }, { status: 201 });
    response.headers.set(
      'Set-Cookie',
      `token=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
