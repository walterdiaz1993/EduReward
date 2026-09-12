import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('edureward.db');
    await initTables(dbInstance);
  }
  return dbInstance;
}

async function initTables(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_type TEXT NOT NULL DEFAULT 'child',
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      parent_teacher_id TEXT,
      points INTEGER DEFAULT 0,
      period_type TEXT DEFAULT 'semester',
      grading_system TEXT DEFAULT 'percentage'
    );

    CREATE TABLE IF NOT EXISTS periods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      period_type TEXT DEFAULT 'semester',
      created_by TEXT
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT
    );

    CREATE TABLE IF NOT EXISTS reward_rules (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      min_grade REAL NOT NULL,
      max_grade REAL NOT NULL,
      rule_type TEXT NOT NULL,
      reward_type TEXT NOT NULL,
      reward_value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS period_assignments (
      id TEXT PRIMARY KEY,
      period_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS grades_log (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      period_id TEXT NOT NULL,
      raw_grade TEXT NOT NULL,
      numeric_grade REAL NOT NULL,
      grading_system TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards_log (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      period_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      title TEXT NOT NULL,
      reward_type TEXT NOT NULL,
      reward_value TEXT NOT NULL,
      rule_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}
