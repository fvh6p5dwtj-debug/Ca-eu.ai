import { cookies } from 'next/headers';
import { getUserByToken } from './db';

// Session lookup for Route Handlers. The `token` cookie is set by
// app/api/auth/login; Proxy only checks that it exists, so anything that
// actually acts on a user's behalf must validate it here.
export async function getSessionToken() {
  return (await cookies()).get('token')?.value;
}

export async function getSessionUser() {
  const token = await getSessionToken();
  return token ? getUserByToken(token) : null;
}
