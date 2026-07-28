import { describe, it, expect } from 'vitest';

// Not BASE_URL: Vite defines that itself (default '/'), which silently turns
// every request into a relative path.
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Probed at module scope, not in beforeAll — describe.runIf is evaluated during
// collection, which happens before any hook runs.
const serverUp = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) })
  .then((r) => r.ok)
  .catch(() => false);

if (!serverUp) console.warn(`\n  no server at ${BASE} — skipping API tests\n`);

const json = { 'Content-Type': 'application/json' };
const creds = () => ({ name: 'Test', email: `t${Date.now()}${Math.random().toString(36).slice(2)}@example.com`, password: 'test123' });

async function register() {
  const c = creds();
  const res = await fetch(`${BASE}/api/auth/register`, { method: 'POST', headers: json, body: JSON.stringify(c) });
  return { res, creds: c, body: await res.json() };
}

// Every chat call below uses an unknown characterId or no session, so the suite
// exercises auth, rate limiting and routing without ever reaching OpenRouter.
// A test suite should not bill you per run. The one real generation is opt-in.
function chat(cookie?: string, characterId = '__no_such_character__') {
  return fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: cookie ? { ...json, Cookie: cookie } : json,
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], characterId }),
  });
}

describe.runIf(serverUp)('auth lifecycle', () => {
  it('registers, logs in, and identifies the user', async () => {
    const { res, creds: c, body } = await register();
    expect(res.status).toBe(201);
    expect(body.token).toBeTruthy();

    const login = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: json, body: JSON.stringify({ email: c.email, password: c.password }) });
    expect(login.status).toBe(200);
    const { token } = await login.json();

    const me = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: `token=${token}` } });
    expect(me.status).toBe(200);
    expect((await me.json()).user.email).toBe(c.email);
  });

  it('rejects a wrong password', async () => {
    const { creds: c } = await register();
    const res = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: json, body: JSON.stringify({ email: c.email, password: 'wrong' }) });
    expect(res.status).toBe(401);
  });

  it('invalidates the session on logout, for both /me and /api/chat', async () => {
    const { body } = await register();
    const cookie = `token=${body.token}`;
    expect((await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } })).status).toBe(200);
    expect((await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } })).status).toBe(401);
    // Before the gate existed, chat kept working after logout.
    expect((await chat(cookie)).status).toBe(401);
  });
});

describe.runIf(serverUp)('/api/chat authorization', () => {
  // The regression: this returned 200 and a full generated reply, billed to us.
  it('refuses a request with no session', async () => {
    expect((await chat()).status).toBe(401);
  });

  it('refuses a made-up token', async () => {
    expect((await chat('token=not-a-real-token')).status).toBe(401);
  });

  // The old cookie parser matched /token=([^;]+)/ against the raw header, which
  // is unanchored — so a csrf_token= value earlier in the header was read as the
  // session token. A valid token parked there must not authenticate.
  it('does not accept a valid token parked in a decoy cookie', async () => {
    const { body } = await register();
    expect((await chat(`csrf_token=${body.token}; token=junk`)).status).toBe(401);
  });

  it('404s an unknown character for an authenticated user', async () => {
    const { body } = await register();
    expect((await chat(`token=${body.token}`)).status).toBe(404);
  });

  it('rate limits a single account', async () => {
    const { body } = await register();
    const cookie = `token=${body.token}`;
    const codes: number[] = [];
    for (let i = 0; i < 25; i++) codes.push((await chat(cookie)).status);
    expect(codes).toContain(429);
    // The cap should not be so tight that ordinary use trips it immediately.
    expect(codes.filter((c) => c === 404).length).toBeGreaterThanOrEqual(15);
  });
});

describe.runIf(serverUp)('page routing', () => {
  it('redirects an unauthenticated visitor away from a chat page', async () => {
    const res = await fetch(`${BASE}/chat/sophia`, { redirect: 'manual' });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/signin');
  });

  it('serves the chat page to a session holder', async () => {
    const { body } = await register();
    const res = await fetch(`${BASE}/chat/sophia`, { headers: { Cookie: `token=${body.token}` } });
    expect(res.status).toBe(200);
  });
});

// Costs real API credits. Opt in with RUN_LIVE_CHAT=1.
describe.runIf(serverUp && process.env.RUN_LIVE_CHAT === "1")('live generation', () => {
  it('streams a reply for a real character', async () => {
    const { body } = await register();
    const res = await chat(`token=${body.token}`, 'sophia');
    expect(res.status).toBe(200);
    expect((await res.text()).trim().length).toBeGreaterThan(0);
  }, 60_000);
});
