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
let dbPromise: Promise<Database> | null = null;

// Initialization is async (sql.js loads wasm), so every query must await it.
// getDb() memoizes a single in-flight promise: concurrent first calls share
// one init instead of racing to create two databases, and callers can never
// observe a null db.
function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = initDb();
  }
  return dbPromise;
}

async function initDb(): Promise<Database> {
  // Load the wasm binary directly instead of letting sql.js resolve its own
  // path: under Next.js/Turbopack server bundling initSqlJs() resolves a bogus
  // base (/ROOT/node_modules/...) and fails with ENOENT.
  const SQL = await initSqlJs({
    wasmBinary: fs.readFileSync(
      path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm')
    ),
  });

  const database = fs.existsSync(dbPath)
    ? new SQL.Database(fs.readFileSync(dbPath))
    : new SQL.Database();

  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db = database;
  saveDb();
  return database;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export async function createUser(nameOrData: string | { name: string; email: string; password?: string; image?: string; provider?: string }, email?: string, password?: string) {
  const database = await getDb();
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
  const stmt = database.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  stmt.run([name, userEmail, hashedPassword]);
  stmt.free();

  const idResult = database.exec('SELECT last_insert_rowid() as id');
  const id = idResult[0]?.values[0]?.[0] as number;
  saveDb();
  return { id, name, email: userEmail, plan: 'free', image: userImage };
}

export async function getUserByEmail(email: string) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM users WHERE email = ?');
  stmt.bind([email]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as any;
  }
  stmt.free();
  return null;
}

export async function getUserById(id: number) {
  const database = await getDb();
  const stmt = database.prepare('SELECT id, name, email, plan, created_at FROM users WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as any;
  }
  stmt.free();
  return null;
}

export async function createSession(userId: number) {
  const database = await getDb();
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionId = Math.random().toString(36).substring(2);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const stmt = database.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)');
  stmt.run([sessionId, userId, token, expiresAt]);
  stmt.free();
  saveDb();
  return { token, expiresAt };
}

export async function getUserByToken(token: string) {
  const database = await getDb();
  const stmt = database.prepare(`
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

export async function deleteSession(token: string) {
  const database = await getDb();
  const stmt = database.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run([token]);
  stmt.free();
  saveDb();
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

initDatabase();
