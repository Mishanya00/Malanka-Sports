import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('malanka.db');

export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL DEFAULT 0,
        title TEXT NOT NULL,
        reps TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        is_deleted INTEGER DEFAULT 0,
        updated_at INTEGER DEFAULT 0
      );
    `);

    const cols = db.getAllSync(`PRAGMA table_info(exercises);`) as Array<{ name: string }>;
    const names = new Set(cols.map((c) => c.name));
    if (!names.has('is_deleted')) {
      db.execSync(`ALTER TABLE exercises ADD COLUMN is_deleted INTEGER DEFAULT 0;`);
    }
    if (!names.has('updated_at')) {
      db.execSync(`ALTER TABLE exercises ADD COLUMN updated_at INTEGER DEFAULT 0;`);
    }
    if (!names.has('user_id')) {
      db.execSync(`ALTER TABLE exercises ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0;`);
    }

    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing DB', error);
  }
};

export const searchExercises = (userId: number, filters: { query?: string; status?: string }) => {
  let sql = 'SELECT * FROM exercises WHERE is_deleted = 0 AND user_id = ?';
  const params: (string | number)[] = [userId];

  if (filters.query) {
    sql += ' AND title LIKE ?';
    params.push(`%${filters.query}%`);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  sql += ' ORDER BY date DESC';
  return db.getAllSync(sql, params);
};
