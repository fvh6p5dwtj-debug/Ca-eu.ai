import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data', 'candyai.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function createUser(nameOrData: string | { name: string; email: string; password?: string; image?: string; provider?: string }, email?: string, password?: string) {
  let name: string, userEmail: string, userPassword: string, userImage: string | undefined;
  if (typeof nameOrData === 'object') {
    name = nameOrData.name;
    userEmail = nameOrData.email;
    userPassword = nameOrData.password || Math.random().toString(36).substring(2);
    userImage = nameOrData.image;
  } else {
    name = nameOrData;
    userEmail = email!;
    userPassword = password!;
  }

  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  const stmt = db!.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  stmt.run([name, userEmail, hashedPassword]);
  stmt.free();

  const idResult = db!.exec('SELECT last_insert_rowid() as id');
  const id = idResult[0]?.values[0]?.[0] as number;
  saveDb();
  return { id, name, email: userEmail, plan: 'free', image: userImage };
}

export function getUserByEmail(email: string) {
  const stmt = db!.prepare('SELECT * FROM users WHERE email = ?');
  stmt.bind([email]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as any;
  }
  stmt.free();
  return null;
}

export function getUserById(id: number) {
  const stmt = db!.prepare('SELECT id, name, email, plan, created_at FROM users WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as any;
  }
  stmt.free();
  return null;
}

export function createSession(userId: number) {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionId = Math.random().toString(36).substring(2);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const stmt = db!.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)');
  stmt.run([sessionId, userId, token, expiresAt]);
  stmt.free();
  saveDb();
  return { token, expiresAt };
}

export function getUserByToken(token: string) {
  const stmt = db!.prepare(`
    SELECT u.id, u.name, u.email, u.plan, u.created_at
    FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `);
  stmt.bind([token]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as any;
  }
  stmt.free();
  return null;
}

export function deleteSession(token: string) {
  const stmt = db!.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run([token]);
  stmt.free();
  saveDb();
}

// Matches a bcrypt hash: "$2a$"/"$2b$"/"$2y$" + two-digit cost + "$".
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$/;

export function verifyPassword(passwordOrEmail: string, hashOrPassword?: string) {
  if (hashOrPassword === undefined) return false;

  // Called as verifyPassword(plainPassword, bcryptHash): compare directly.
  if (BCRYPT_HASH_RE.test(hashOrPassword)) {
    return bcrypt.compareSync(passwordOrEmail, hashOrPassword);
  }

  // Called as verifyPassword(email, plainPassword): look the user up first.
  const user = getUserByEmail(passwordOrEmail);
  if (!user || !user.password) return false;
  return bcrypt.compareSync(hashOrPassword, user.password);
}

export async function initDatabase() {
  await getDb();
}

initDatabase();
