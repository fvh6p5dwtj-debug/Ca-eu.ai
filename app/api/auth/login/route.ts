import { NextResponse } from 'next/server';
import { getUserByEmail, createSession, verifyPassword } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const session = createSession(user.id);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      token: session.token,
    });

    response.headers.set(
      'Set-Cookie',
      `token=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
