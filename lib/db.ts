import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Database backend, in order of preference:
// 1. Turso / remote libSQL when TURSO_DATABASE_URL is set (persistent — use in
//    production; serverless filesystems don't keep local files).
// 2. A local SQLite file otherwise: ./data/candyai.db in dev, /tmp on Vercel
//    (the only writable path there; per-instance and ephemeral, demo only).
function resolveDbUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL) return 'file:/tmp/candyai.db';
  const dbPath = path.join(process.cwd(), 'data', 'candyai.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  return `file:${dbPath}`;
}

let dbPromise: Promise<Client> | null = null;

// Schema init is async, so every query must await it. getDb() memoizes a
// single in-flight promise: concurrent first calls share one init instead of
// racing, and callers can never observe an uninitialized database.
function getDb(): Promise<Client> {
  if (!dbPromise) {
    dbPromise = initDb();
  }
  return dbPromise;
}

async function initDb(): Promise<Client> {
  const client = createClient({
    url: resolveDbUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  return client;
}

export async function createUser(name: string, email: string, password: string) {
  const db = await getDb();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = await db.execute({
    sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    args: [name, email, hashedPassword],
  });
  const id = Number(result.lastInsertRowid);
  return { id, name, email, plan: 'free' };
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  return (result.rows[0] as any) ?? null;
}

export async function createSession(userId: number) {
  const db = await getDb();
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionId = Math.random().toString(36).substring(2);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: 'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    args: [sessionId, userId, token, expiresAt],
  });
  return { token, expiresAt };
}

export async function getUserByToken(token: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: `
      SELECT u.id, u.name, u.email, u.plan, u.created_at
      FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `,
    args: [token],
  });
  return (result.rows[0] as any) ?? null;
}

export async function deleteSession(token: string) {
  const db = await getDb();
  await db.execute({
    sql: 'DELETE FROM sessions WHERE token = ?',
    args: [token],
  });
}

// Matches a bcrypt hash: "$2a$"/"$2b$"/"$2y$" + two-digit cost + "$".
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$/;

export async function verifyPassword(passwordOrEmail: string, hashOrPassword?: string) {
  if (hashOrPassword === undefined) return false;

  // Called as verifyPassword(plainPassword, bcryptHash): compare directly.
  if (BCRYPT_HASH_RE.test(hashOrPassword)) {
    return bcrypt.compareSync(passwordOrEmail, hashOrPassword);
  }

  // Called as verifyPassword(email, plainPassword): look the user up first.
  const user = await getUserByEmail(passwordOrEmail);
  if (!user || !user.password) return false;
  return bcrypt.compareSync(hashOrPassword, user.password);
}

export async function initDatabase() {
  await getDb();
}
