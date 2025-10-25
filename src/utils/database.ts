import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let  db: Database | null = null;

export const init = async () => {
  if (db) return db;
  db = await open({
    filename: "../db/silvianna.db",
    driver: sqlite3.Database
  })
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS host_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL
    );
  `);
  
  return db;
}

export const getDB = ()=>{
  if(!db) throw new Error ("DB not initialized");
  return db;
}
