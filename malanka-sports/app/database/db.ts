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