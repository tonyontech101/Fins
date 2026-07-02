import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('fintracker.db');
  }
  return db;
}

export async function initDB() {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id            TEXT PRIMARY KEY NOT NULL,
      institutionId TEXT,
      name          TEXT NOT NULL,
      type          TEXT NOT NULL,
      currency      TEXT NOT NULL,
      balance       REAL NOT NULL DEFAULT 0,
      color         TEXT,
      createdAt     INTEGER NOT NULL,
      updatedAt     INTEGER
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY NOT NULL,
      type        TEXT NOT NULL,
      accountId   TEXT NOT NULL,
      toAccountId TEXT,
      category    TEXT,
      amount      REAL NOT NULL,
      note        TEXT,
      date        INTEGER NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_account
      ON transactions(accountId);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_to_account
      ON transactions(toAccountId);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date);
  `);

  await ensureColumn(database, 'accounts', 'updatedAt', 'INTEGER');
}

async function ensureColumn(database, table, column, definition) {
  const columns = await database.getAllAsync(`PRAGMA table_info(${table})`);
  if (!columns.some(c => c.name === column)) {
    await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function normalizeAccount(row) {
  return {
    ...row,
    balance: Number(row.balance),
  };
}

function normalizeTransaction(row) {
  return {
    ...row,
    amount: Number(row.amount),
    toAccountId: row.toAccountId ?? null,
    category: row.category ?? '',
    note: row.note ?? '',
  };
}

export async function dbGetAccounts() {
  const database = await getDb();
  const rows = await database.getAllAsync(
    'SELECT * FROM accounts ORDER BY createdAt ASC'
  );
  return rows.map(normalizeAccount);
}

export async function dbGetTransactions() {
  const database = await getDb();
  const rows = await database.getAllAsync(
    'SELECT * FROM transactions ORDER BY date ASC'
  );
  return rows.map(normalizeTransaction);
}

export async function dbUpsertAccount(account, database = null) {
  const conn = database ?? await getDb();

  await conn.runAsync(
    `INSERT INTO accounts (
       id, institutionId, name, type, currency, balance, color, createdAt, updatedAt
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       institutionId = excluded.institutionId,
       name = excluded.name,
       type = excluded.type,
       currency = excluded.currency,
       balance = excluded.balance,
       color = excluded.color,
       updatedAt = excluded.updatedAt`,
    [
      account.id,
      account.institutionId ?? null,
      account.name,
      account.type,
      account.currency,
      Number(account.balance) || 0,
      account.color ?? null,
      account.createdAt,
      account.updatedAt ?? Date.now(),
    ]
  );
}

export async function dbDeleteAccount(id) {
  const database = await getDb();

  await database.withExclusiveTransactionAsync(async txn => {
    await txn.runAsync(
      'DELETE FROM transactions WHERE accountId = ? OR toAccountId = ?',
      [id, id]
    );
    await txn.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
  });
}

export async function dbInsertTransaction(transaction, database = null) {
  const conn = database ?? await getDb();

  await conn.runAsync(
    `INSERT INTO transactions (
       id, type, accountId, toAccountId, category, amount, note, date
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.type,
      transaction.accountId,
      transaction.toAccountId ?? null,
      transaction.category ?? '',
      Number(transaction.amount) || 0,
      transaction.note ?? '',
      transaction.date,
    ]
  );
}

export async function dbSaveTransactionState(transaction, accounts) {
  const database = await getDb();

  await database.withExclusiveTransactionAsync(async txn => {
    await dbInsertTransaction(transaction, txn);
    for (const account of accounts) {
      await dbUpsertAccount(account, txn);
    }
  });
}

export async function dbClearAll() {
  const database = await getDb();

  await database.withExclusiveTransactionAsync(async txn => {
    await txn.runAsync('DELETE FROM transactions');
    await txn.runAsync('DELETE FROM accounts');
  });
}
