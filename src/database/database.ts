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
      average REAL DEFAULT 0,
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
      period_id TEXT,
      grading_system TEXT DEFAULT 'percentage',
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

    CREATE TABLE IF NOT EXISTS student_periods (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      period_id TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS period_wheels (
      id TEXT PRIMARY KEY,
      period_id TEXT NOT NULL,
      wheel_key TEXT NOT NULL,
      title TEXT NOT NULL,
      min_grade REAL NOT NULL,
      max_grade REAL NOT NULL,
      color TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS period_wheel_options (
      id TEXT PRIMARY KEY,
      wheel_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_period_spins (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      period_id TEXT NOT NULL,
      wheel_id TEXT NOT NULL,
      prize_text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(student_id, period_id) ON CONFLICT REPLACE
    );
  `);

  // Migrations for existing databases created in previous app sessions
  try {
    await db.execAsync('ALTER TABLE subjects ADD COLUMN period_id TEXT;');
  } catch (e) {
    // Column already exists or table was newly created
  }

  try {
    await db.execAsync("ALTER TABLE subjects ADD COLUMN grading_system TEXT DEFAULT 'percentage';");
  } catch (e) {
    // Column already exists or table was newly created
  }

  try {
    await db.execAsync('ALTER TABLE students ADD COLUMN average REAL DEFAULT 0;');
  } catch (e) {
    // Column already exists or table was newly created
  }

  try {
    await db.execAsync("UPDATE grades_log SET numeric_grade = numeric_grade / 10 WHERE grading_system = 'decimal' AND numeric_grade > 10;");
  } catch (e) {
    // Migration failed or table empty
  }

  try {
    await db.execAsync("UPDATE students SET average = 0 WHERE average > 100;");
  } catch (e) {
    // Migration failed or table empty
  }
}
