import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function createWishStore(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS wishes (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL,
      created_at INTEGER NOT NULL, visitor_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS wish_translations (wish_id TEXT PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL, language TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS wishes_created_idx ON wishes(created_at);
    CREATE INDEX IF NOT EXISTS wishes_visitor_idx ON wishes(visitor_hash,created_at);`);
  return {
    get(id) {
      return db.prepare('SELECT id,name,message,created_at AS createdAt FROM wishes WHERE id=?').get(id);
    },
    translation(id) {
      return db.prepare('SELECT name,message,language FROM wish_translations WHERE wish_id=?').get(id);
    },
    saveTranslation(id, translation) {
      db.prepare('INSERT OR IGNORE INTO wish_translations(wish_id,name,message,language,created_at) VALUES(?,?,?,?,?)').run(id,translation.name,translation.message,translation.language,Date.now());
    },
    list() {
      return db.prepare('SELECT id,name,message,created_at AS createdAt FROM wishes ORDER BY created_at DESC LIMIT 100').all();
    },
    page({ query = '', order = 'newest', page = 1 } = {}) {
      const pageSize = 12;
      const search = '%' + query.trim().slice(0, 100).replace(/[\\%_]/g, '\\$&') + '%';
      const where = "WHERE name LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\'";
      const total = Number(db.prepare('SELECT COUNT(*) AS count FROM wishes').get().count);
      const matched = Number(db.prepare(`SELECT COUNT(*) AS count FROM wishes ${where}`).get(search, search).count);
      const pages = Math.max(1, Math.ceil(matched / pageSize));
      const currentPage = Math.min(pages, Math.max(1, Number.isSafeInteger(page) ? page : 1));
      const direction = order === 'oldest' ? 'ASC' : 'DESC';
      const wishes = db.prepare(`SELECT id,name,message,created_at AS createdAt FROM wishes ${where} ORDER BY created_at ${direction},id ${direction} LIMIT ? OFFSET ?`).all(search, search, pageSize, (currentPage - 1) * pageSize);
      return { wishes, total, matched, page: currentPage, pages, pageSize };
    },
    add({id,name,message,visitorHash,createdAt}) {
      db.exec('BEGIN IMMEDIATE');
      try {
        let result;
        if (db.prepare('SELECT id FROM wishes WHERE id=?').get(id)) result='duplicate';
        else if (db.prepare('SELECT id FROM wishes WHERE visitor_hash=? AND created_at>? LIMIT 1').get(visitorHash,createdAt-60000)) result='limited';
        else {
          db.prepare('INSERT INTO wishes(id,name,message,visitor_hash,created_at) VALUES(?,?,?,?,?)').run(id,name,message,visitorHash,createdAt);
          result='created';
        }
        db.exec('COMMIT');
        return result;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    close() { db.close(); }
  };
}
let store;
export function getWishStore() {
  if (!store) {
    if (process.env.RENDER && !process.env.SQLITE_PATH) throw new Error('SQLITE_PATH must point to the Render persistent disk');
    store=createWishStore(process.env.SQLITE_PATH || '.data/wishes.sqlite');
  }
  return store;
}
