import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = any>(): { results: T[]; success: boolean; meta?: any };
  get<T = any>(): T | undefined;
  run(): { success: boolean; meta: { changes: number; last_row_id: number | bigint } };
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): { count: number; duration: number };
  batch(statements: D1PreparedStatement[]): Promise<any[]>;
}

class LumoD1Database implements D1Database {
  private sqlite!: DatabaseSync;
  private dbPath: string;

  constructor(dbPath?: string) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (dbPath || path.join(dataDir, 'lumo-d1.sqlite'));
    try {
      this.initConnection();
      this.initMigrations();
      this.ensureSchemaIntegrity();
    } catch (err: any) {
      if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
        console.error('LumoD1Database constructor detected corrupt/malformed DB, recovering...', err);
        this.recreateDb();
      } else {
        throw err;
      }
    }
  }

  private initConnection() {
    this.sqlite = new DatabaseSync(this.dbPath);
    this.sqlite.exec('PRAGMA busy_timeout = 5000;');
    this.sqlite.exec('PRAGMA journal_mode = WAL;');
    this.sqlite.exec('PRAGMA synchronous = NORMAL;');
    this.sqlite.exec('PRAGMA foreign_keys = ON;');
  }

  public recreateDb() {
    try {
      if (this.sqlite && typeof (this.sqlite as any).close === 'function') {
        try {
          (this.sqlite as any).close();
        } catch {}
      }
    } catch {}

    const filesToDelete = [
      this.dbPath,
      `${this.dbPath}-wal`,
      `${this.dbPath}-shm`
    ];
    for (const f of filesToDelete) {
      try {
        if (fs.existsSync(f)) {
          fs.unlinkSync(f);
        }
      } catch (e) {
        console.warn(`Could not delete sqlite file ${f}:`, e);
      }
    }

    this.initConnection();
    this.initMigrations();
    this.ensureSchemaIntegrity();
  }

  public ensureSchemaIntegrity() {
    try {
      const userCols = (this.sqlite.prepare("PRAGMA table_info(users)").all() as any[]).map(c => c.name);
      if (!userCols.includes('password_hash')) this.sqlite.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
      if (!userCols.includes('department')) this.sqlite.exec("ALTER TABLE users ADD COLUMN department TEXT;");
      if (!userCols.includes('staff_id')) this.sqlite.exec("ALTER TABLE users ADD COLUMN staff_id TEXT;");
      if (!userCols.includes('status')) this.sqlite.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE';");
      if (!userCols.includes('invite_token')) this.sqlite.exec("ALTER TABLE users ADD COLUMN invite_token TEXT;");
      if (!userCols.includes('invite_expires_at')) this.sqlite.exec("ALTER TABLE users ADD COLUMN invite_expires_at TEXT;");
      if (!userCols.includes('invite_accepted_at')) this.sqlite.exec("ALTER TABLE users ADD COLUMN invite_accepted_at TEXT;");
      if (!userCols.includes('password_reset_token')) this.sqlite.exec("ALTER TABLE users ADD COLUMN password_reset_token TEXT;");
      if (!userCols.includes('password_reset_code')) this.sqlite.exec("ALTER TABLE users ADD COLUMN password_reset_code TEXT;");
      if (!userCols.includes('password_reset_expires')) this.sqlite.exec("ALTER TABLE users ADD COLUMN password_reset_expires TEXT;");
      if (!userCols.includes('failed_attempts')) this.sqlite.exec("ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0;");
      if (!userCols.includes('locked_until')) this.sqlite.exec("ALTER TABLE users ADD COLUMN locked_until TEXT;");
    } catch (retryErr) {
      console.warn('SQLite ensureSchemaIntegrity notice:', retryErr);
    }
  }

  private initMigrations() {
    const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      try {
        this.sqlite.exec(sql);
      } catch (err: any) {
        // If table exists with older schema, run column migrations first and retry
        this.ensureSchemaIntegrity();
        try {
          this.sqlite.exec(sql);
        } catch (retryErr) {
          console.warn('SQLite initMigrations fallback notice:', retryErr);
        }
      }
    }
  }

  public prepare(query: string): D1PreparedStatement {
    const self = this;
    let boundValues: any[] = [];

    const stmtObj: D1PreparedStatement = {
      bind(...values: any[]) {
        boundValues = values.map(v => {
          if (v === undefined) return null;
          if (typeof v === 'boolean') return v ? 1 : 0;
          if (typeof v === 'object' && v !== null) return JSON.stringify(v);
          return v;
        });
        return stmtObj;
      },
      all<T = any>() {
        try {
          const stmt = self.sqlite.prepare(query);
          const rows = stmt.all(...boundValues) as T[];
          return {
            results: rows,
            success: true,
            meta: { changes: 0, last_row_id: 0 }
          };
        } catch (err: any) {
          if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
            console.error('LumoD1Database prepare.all detected corrupt/malformed DB, recreating...', err);
            self.recreateDb();
            const stmt = self.sqlite.prepare(query);
            const rows = stmt.all(...boundValues) as T[];
            return {
              results: rows,
              success: true,
              meta: { changes: 0, last_row_id: 0 }
            };
          }
          throw err;
        }
      },
      get<T = any>() {
        try {
          const stmt = self.sqlite.prepare(query);
          return stmt.get(...boundValues) as T | undefined;
        } catch (err: any) {
          if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
            console.error('LumoD1Database prepare.get detected corrupt/malformed DB, recreating...', err);
            self.recreateDb();
            const stmt = self.sqlite.prepare(query);
            return stmt.get(...boundValues) as T | undefined;
          }
          throw err;
        }
      },
      run() {
        try {
          const stmt = self.sqlite.prepare(query);
          const result = stmt.run(...boundValues);
          return {
            success: true,
            meta: {
              changes: Number(result.changes),
              last_row_id: result.lastInsertRowid
            }
          };
        } catch (err: any) {
          if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
            console.error('LumoD1Database prepare.run detected corrupt/malformed DB, recreating...', err);
            self.recreateDb();
            const stmt = self.sqlite.prepare(query);
            const result = stmt.run(...boundValues);
            return {
              success: true,
              meta: {
                changes: Number(result.changes),
                last_row_id: result.lastInsertRowid
              }
            };
          }
          throw err;
        }
      }
    };

    return stmtObj;
  }

  public exec(query: string) {
    const start = Date.now();
    try {
      this.sqlite.exec(query);
    } catch (err: any) {
      if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
        console.error('LumoD1Database exec detected corrupt/malformed DB, recreating...', err);
        this.recreateDb();
        this.sqlite.exec(query);
      } else {
        throw err;
      }
    }
    return { count: 1, duration: Date.now() - start };
  }

  public async batch(statements: D1PreparedStatement[]) {
    const results = [];
    try {
      this.sqlite.exec('BEGIN TRANSACTION;');
    } catch (err: any) {
      if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
        console.error('LumoD1Database batch transaction start detected corrupt/malformed DB, recreating...', err);
        this.recreateDb();
        this.sqlite.exec('BEGIN TRANSACTION;');
      } else {
        throw err;
      }
    }

    try {
      for (const stmt of statements) {
        results.push(stmt.run());
      }
      this.sqlite.exec('COMMIT;');
      return results;
    } catch (err: any) {
      try {
        this.sqlite.exec('ROLLBACK;');
      } catch {}
      if (err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
        console.error('LumoD1Database batch execution detected corrupt/malformed DB, recreating...', err);
        this.recreateDb();
      }
      throw err;
    }
  }

  public getRawDb(): DatabaseSync {
    return this.sqlite;
  }
}

// Export singleton D1 instance
export const d1 = new LumoD1Database();
