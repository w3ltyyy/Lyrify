import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "sync.json");
const DB_FILE = path.join(__dirname, "data", "sync.sqlite");

if (!fs.existsSync(DATA_FILE)) {
    console.log("No sync.json found. Skipping migration.");
    process.exit(0);
}

const raw = fs.readFileSync(DATA_FILE, "utf8");
const store = JSON.parse(raw);

const db = new Database(DB_FILE);

// Initialize Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS sync (
        trackKey TEXT PRIMARY KEY,
        lines TEXT,
        updatedAt INTEGER,
        authorNickname TEXT
    );
    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        trackKey TEXT,
        lines TEXT,
        status TEXT,
        createdAt INTEGER,
        updatedAt INTEGER,
        authorId TEXT,
        authorNickname TEXT
    );
    CREATE TABLE IF NOT EXISTS telemetry (
        date TEXT PRIMARY KEY,
        dau INTEGER DEFAULT 0,
        requests INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS missingTracks (
        trackKey TEXT PRIMARY KEY,
        artist TEXT,
        title TEXT,
        count INTEGER DEFAULT 0,
        lastRequested INTEGER
    );
    CREATE TABLE IF NOT EXISTS trackActivity (
        uri TEXT PRIMARY KEY,
        trackKey TEXT,
        artist TEXT,
        title TEXT,
        syncedHits INTEGER DEFAULT 0,
        unsyncedHits INTEGER DEFAULT 0,
        lastPlayed INTEGER
    );
    CREATE TABLE IF NOT EXISTS users (
        authorId TEXT PRIMARY KEY,
        nickname TEXT,
        karma INTEGER DEFAULT 0,
        lastActive INTEGER
    );
    CREATE TABLE IF NOT EXISTS geo (
        countryCode TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trackKey TEXT,
        lines TEXT,
        updatedAt INTEGER
    );
`);

console.log("Migrating data...");

const insertSync = db.prepare("INSERT OR REPLACE INTO sync (trackKey, lines, updatedAt, authorNickname) VALUES (?, ?, ?, ?)");
const insertSub = db.prepare("INSERT OR REPLACE INTO submissions (id, trackKey, lines, status, createdAt, updatedAt, authorId, authorNickname) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
const insertTel = db.prepare("INSERT OR REPLACE INTO telemetry (date, dau, requests) VALUES (?, ?, ?)");
const insertMiss = db.prepare("INSERT OR REPLACE INTO missingTracks (trackKey, artist, title, count, lastRequested) VALUES (?, ?, ?, ?, ?)");
const insertAct = db.prepare("INSERT OR REPLACE INTO trackActivity (uri, trackKey, artist, title, syncedHits, unsyncedHits, lastPlayed) VALUES (?, ?, ?, ?, ?, ?, ?)");
const insertUser = db.prepare("INSERT OR REPLACE INTO users (authorId, nickname, karma, lastActive) VALUES (?, ?, ?, ?)");

db.transaction(() => {
    // Sync
    if (store.sync) {
        for (const [k, v] of Object.entries(store.sync)) {
            insertSync.run(k, JSON.stringify(v.lines || []), v.updatedAt || Date.now(), v.authorNickname || "Anonymous");
        }
    }
    // Submissions
    if (store.submissions) {
        for (const [k, v] of Object.entries(store.submissions)) {
            insertSub.run(k, JSON.stringify(v.lines || []), v.trackKey, v.status || "pending", v.createdAt || Date.now(), v.updatedAt || Date.now(), v.authorId || "", v.authorNickname || "Anonymous");
        }
    }
    // Telemetry
    if (store.telemetry) {
        for (const [k, v] of Object.entries(store.telemetry)) {
            insertTel.run(k, v.dau || 0, v.requests || 0);
        }
    }
    // Missing Tracks
    if (store.missingTracks) {
        for (const [k, v] of Object.entries(store.missingTracks)) {
            insertMiss.run(k, v.artist || "", v.title || "", v.count || 0, v.lastRequested || Date.now());
        }
    }
    // Track Activity
    if (store.trackActivity) {
        for (const [k, v] of Object.entries(store.trackActivity)) {
            insertAct.run(k, v.trackKey || k, v.artist || "", v.title || "", v.syncedHits || 0, v.unsyncedHits || 0, v.lastPlayed || Date.now());
        }
    }
    // Users
    if (store.users) {
        for (const [k, v] of Object.entries(store.users)) {
            insertUser.run(k, v.nickname || "Anonymous", v.karma || 0, v.lastActive || Date.now());
        }
    }
})();

console.log("Migration complete. Database is at: " + DB_FILE);
db.close();
