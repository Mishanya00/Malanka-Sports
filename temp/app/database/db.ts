import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('malanka.db');

export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        reps TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'pending'
      );
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing DB', error);
  }
};

export const searchExercises = (filters: { query?: string; status?: string }) => {
  let sql = 'SELECT * FROM exercises WHERE 1=1';
  const params: string[] = [];

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