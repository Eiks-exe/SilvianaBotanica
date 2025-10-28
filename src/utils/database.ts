import sqlite3  from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from "fs";
let  db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initDB = async () => {
  console.log("initializing DataBase...")
  const dbDir = path.join(__dirname, "./db")
  const dbPath = path.join(dbDir, "silvianna.db")
  /*if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }*/
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  

  await db.exec(`
    CREATE TABLE IF NOT EXISTS host_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      parent_category_id TEXTNULL
    );
  `);
  
  console.log("Database initialized")
}

export function getDB() : Database<sqlite3.Database, sqlite3.Statement> {
  if (!db) throw new Error("Database not initialized");
  return db;
}
