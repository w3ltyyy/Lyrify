// Modernized backend with SQLite and GeoIP
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import geoip from "geoip-lite";

const PORT = Number(process.env.PORT ?? 8080);
const DB_FILE = process.env.DB_FILE ?? path.resolve(process.cwd(), "data", "sync.sqlite");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? ""; 
const ADMIN_DIR = path.resolve(process.cwd(), "admin");

// Initialize DB
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL'); // High-performance concurrent access

// Schema (already initialized by migrate.js, but let's ensure it here too)
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

function nowId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function requireAdmin(req, url) {
  if (!ADMIN_TOKEN) return true;
  const urlToken = url.searchParams.get("token") || "";
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return urlToken === ADMIN_TOKEN || bearerToken === ADMIN_TOKEN;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function sendFile(res, filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".html" ? "text/html; charset=utf-8" :
      ext === ".css" ? "text/css; charset=utf-8" :
      ext === ".js" ? "application/javascript; charset=utf-8" : "application/octet-stream";
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-cache" });
    res.end(data);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

async function readBodyJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } 
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "", `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true, engine: "sqlite" });
      return;
    }

    // --- Public Sync API ---

    if (req.method === "GET" && url.pathname === "/sync") {
      const trackKey = url.searchParams.get("trackKey");
      if (!trackKey) return sendJson(res, 400, { error: "trackKey required" });
      
      const row = db.prepare("SELECT * FROM sync WHERE trackKey = ?").get(trackKey);
      if (!row) return sendJson(res, 200, { found: false });
      
      sendJson(res, 200, { found: true, record: { ...row, lines: JSON.parse(row.lines) } });
      return;
    }

    // Direct /sync post (usually dev or admin tool)
    if (req.method === "POST" && url.pathname === "/sync") {
      if (!requireAdmin(req, url)) return sendJson(res, 403, { error: "forbidden" });
      const body = await readBodyJson(req);
      const { trackKey, lines } = body;
      if (typeof trackKey !== "string" || !Array.isArray(lines)) {
        return sendJson(res, 400, { error: "trackKey and lines required" });
      }

      const existing = db.prepare("SELECT * FROM sync WHERE trackKey = ?").get(trackKey);
      if (existing) {
          db.prepare("INSERT INTO versions (trackKey, lines, updatedAt) VALUES (?, ?, ?)")
            .run(trackKey, existing.lines, existing.updatedAt);
      }

      db.prepare("INSERT OR REPLACE INTO sync (trackKey, lines, updatedAt, authorNickname) VALUES (?, ?, ?, ?)")
        .run(trackKey, JSON.stringify(lines), Date.now(), "Admin");
      
      sendJson(res, 200, { ok: true });
      return;
    }

    // --- Submissions ---

    if (req.method === "POST" && url.pathname === "/submission") {
      const body = await readBodyJson(req);
      const { trackKey, lines, authorId, authorNickname } = body;
      if (!trackKey || !Array.isArray(lines)) return sendJson(res, 400, { error: "bad format" });

      const id = nowId();
      db.prepare("INSERT INTO submissions (id, trackKey, lines, status, createdAt, updatedAt, authorId, authorNickname) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, trackKey, JSON.stringify(lines), "pending", Date.now(), Date.now(), authorId || "", authorNickname || "Anonymous");
      
      sendJson(res, 200, { ok: true, id });
      return;
    }

    if (req.method === "GET" && url.pathname === "/submissions") {
      if (!requireAdmin(req, url)) return sendJson(res, 403, { error: "forbidden" });
      const status = url.searchParams.get("status") || "pending";
      const limit = Number(url.searchParams.get("limit")) || 50;
      
      const rows = (status === "all") 
        ? db.prepare("SELECT * FROM submissions ORDER BY updatedAt DESC LIMIT ?").all(limit)
        : db.prepare("SELECT * FROM submissions WHERE status = ? ORDER BY updatedAt DESC LIMIT ?").all(status, limit);
      
      const parsed = rows.map(r => {
        try {
            return { ...r, lines: JSON.parse(r.lines || "[]") };
        } catch (e) {
            console.error(`[lyrify] Failed to parse lines for submission ${r.id}:`, e);
            return { ...r, lines: [] };
        }
      });
      sendJson(res, 200, { ok: true, submissions: parsed });
      return;
    }

    if (req.method === "POST" && url.pathname === "/submissions/approve") {
      if (!requireAdmin(req, url)) return sendJson(res, 403, { error: "forbidden" });
      const { id, lines: editedLines } = await readBodyJson(req);
      const sub = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
      if (!sub) return sendJson(res, 404, { error: "not found" });

      const finalLines = editedLines ? JSON.stringify(editedLines) : sub.lines;
      const now = Date.now();

      db.transaction(() => {
        // Version existing
        const existing = db.prepare("SELECT * FROM sync WHERE trackKey = ?").get(sub.trackKey);
        if (existing) {
            db.prepare("INSERT INTO versions (trackKey, lines, updatedAt) VALUES (?, ?, ?)")
              .run(sub.trackKey, existing.lines, existing.updatedAt);
        }

        // Promote to sync
        db.prepare("INSERT OR REPLACE INTO sync (trackKey, lines, updatedAt, authorNickname) VALUES (?, ?, ?, ?)")
          .run(sub.trackKey, finalLines, now, sub.authorNickname || "Anonymous");
        
        // Update sub
        db.prepare("UPDATE submissions SET status = 'approved', updatedAt = ? WHERE id = ?").run(now, id);
        
        // Karma
        if (sub.authorId) {
            db.prepare("INSERT OR IGNORE INTO users (authorId, nickname, karma, lastActive) VALUES (?, ?, 0, ?)")
              .run(sub.authorId, sub.authorNickname || "Anonymous", now);
            db.prepare("UPDATE users SET karma = karma + 1, lastActive = ? WHERE authorId = ?").run(now, sub.authorId);
        }
      })();

      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/submissions/reject") {
      if (!requireAdmin(req, url)) return sendJson(res, 403, { error: "forbidden" });
      const { id } = await readBodyJson(req);
      db.prepare("UPDATE submissions SET status = 'rejected', updatedAt = ? WHERE id = ?").run(Date.now(), id);
      sendJson(res, 200, { ok: true });
      return;
    }

    // --- Telemetry & Analytics ---

    if (req.method === "POST" && url.pathname === "/telemetry") {
      const body = await readBodyJson(req);
      const today = new Date().toISOString().split("T")[0];
      const { authorId, authorNickname } = body;
      
      db.transaction(() => {
          db.prepare("INSERT OR IGNORE INTO telemetry (date, dau, requests) VALUES (?, 0, 0)").run(today);
          db.prepare("UPDATE telemetry SET requests = requests + 1 WHERE date = ?").run(today);
          
          if (authorId) {
              // Note: For true DAU we'd need a sub-table of users per day, 
              // but let's keep it simple: if lastActive was != today, increment DAU.
              const user = db.prepare("SELECT lastActive FROM users WHERE authorId = ?").get(authorId);
              const lastDate = user ? new Date(user.lastActive).toISOString().split("T")[0] : "";
              if (lastDate !== today) {
                  db.prepare("UPDATE telemetry SET dau = dau + 1 WHERE date = ?").run(today);
              }

              db.prepare("INSERT OR IGNORE INTO users (authorId, nickname, karma, lastActive) VALUES (?, ?, 0, ?)")
                .run(authorId, authorNickname || "Anonymous", Date.now());
              db.prepare("UPDATE users SET lastActive = ?, nickname = coalesce(?, nickname) WHERE authorId = ?")
                .run(Date.now(), authorNickname, authorId);
          }
      })();
      
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/track-missing") {
        const { trackKey, artist, title } = await readBodyJson(req);
        if (trackKey) {
            db.prepare("INSERT OR IGNORE INTO missingTracks (trackKey, artist, title, count, lastRequested) VALUES (?, ?, ?, 0, ?)")
              .run(trackKey, artist || "", title || "", Date.now());
            db.prepare("UPDATE missingTracks SET count = count + 1, lastRequested = ? WHERE trackKey = ?")
              .run(Date.now(), trackKey);
        }
        sendJson(res, 200, { ok: true });
        return;
    }

    if (req.method === "POST" && url.pathname === "/track-play") {
        const { trackKey, artist, title, hasSynced, uri } = await readBodyJson(req);
        const storageKey = uri || trackKey;
        if (storageKey) {
            db.transaction(() => {
                db.prepare("INSERT OR IGNORE INTO trackActivity (uri, trackKey, artist, title, syncedHits, unsyncedHits, lastPlayed) VALUES (?, ?, ?, ?, 0, 0, ?)")
                  .run(storageKey, trackKey || "", artist || "", title || "", Date.now());
                
                if (hasSynced) {
                    db.prepare("UPDATE trackActivity SET syncedHits = syncedHits + 1, lastPlayed = ? WHERE uri = ?").run(Date.now(), storageKey);
                } else {
                    db.prepare("UPDATE trackActivity SET unsyncedHits = unsyncedHits + 1, lastPlayed = ? WHERE uri = ?").run(Date.now(), storageKey);
                }

                // GeoIP Tracking
                let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                if (Array.isArray(ip)) ip = ip[0];
                if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
                
                const geo = geoip.lookup(ip);
                if (geo && geo.country) {
                    db.prepare("INSERT OR IGNORE INTO geo (countryCode, count) VALUES (?, 0)").run(geo.country);
                    db.prepare("UPDATE geo SET count = count + 1 WHERE countryCode = ?").run(geo.country);
                }
            })();
        }
        sendJson(res, 200, { ok: true });
        return;
    }

    if (req.method === "GET" && url.pathname === "/leaderboard") {
        const rows = db.prepare("SELECT authorId, nickname, karma, lastActive FROM users WHERE karma > 0 ORDER BY karma DESC LIMIT 100").all();
        sendJson(res, 200, { ok: true, leaderboard: rows });
        return;
    }

    if (req.method === "GET" && url.pathname === "/stats") {
      if (!requireAdmin(req, url)) return sendJson(res, 403, { error: "forbidden" });

        const totalSyncs = db.prepare("SELECT count(*) as c FROM sync").get().c;
        const totalSubmissions = db.prepare("SELECT count(*) as c FROM submissions").get().c;
        const pendingSubmissions = db.prepare("SELECT count(*) as c FROM submissions WHERE status = 'pending'").get().c;
        const rejectedSubmissions = db.prepare("SELECT count(*) as c FROM submissions WHERE status = 'rejected'").get().c;
        const totalUniqueUsers = db.prepare("SELECT count(*) as c FROM users").get().c;
        
        const telemetryTimeline = db.prepare("SELECT * FROM telemetry ORDER BY date ASC LIMIT 30").all();
        const topMissing = db.prepare("SELECT * FROM missingTracks ORDER BY count DESC LIMIT 50").all();
        
        const trackStats = db.prepare("SELECT * FROM trackActivity").all();
        const totalSyncedHits = db.prepare("SELECT sum(syncedHits) as s FROM trackActivity").get().s || 0;
        const totalUnsyncedHits = db.prepare("SELECT sum(unsyncedHits) as s FROM trackActivity").get().s || 0;
        
        const topSyncedTracks = db.prepare("SELECT * FROM trackActivity WHERE syncedHits > 0 ORDER BY syncedHits DESC LIMIT 50").all();
        const topUnsyncedTracks = db.prepare("SELECT * FROM trackActivity WHERE unsyncedHits > 0 ORDER BY unsyncedHits DESC LIMIT 50").all();

        const topContributors = db.prepare("SELECT nickname, karma FROM users ORDER BY karma DESC LIMIT 3").all();
        
        const geoStats = db.prepare("SELECT countryCode as id, count as value FROM geo ORDER BY count DESC").all();

        sendJson(res, 200, { ok: true, stats: { 
            totalSyncs, totalSubmissions, pendingSubmissions, rejectedSubmissions, totalUniqueUsers,
            telemetryTimeline, topMissing, topContributors, geoStats,
            playback: { totalSyncedHits, totalUnsyncedHits, topSyncedTracks, topUnsyncedTracks }
        } });
        return;
    }

    if (req.method === "GET" && url.pathname === "/stats/live") {
        // Counting unique users active in the last 5 minutes
        const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
        const result = db.prepare("SELECT count(*) as c FROM users WHERE lastActive > ?").get(fiveMinsAgo);
        sendJson(res, 200, { ok: true, count: result.c });
        return;
    }

    // --- Versioning ---

    if (req.method === "GET" && url.pathname === "/versions") {
        const trackKey = url.searchParams.get("trackKey");
        if (!trackKey) return sendJson(res, 400, { error: "trackKey required" });
        const rows = db.prepare("SELECT id, updatedAt FROM versions WHERE trackKey = ? ORDER BY updatedAt DESC").all();
        sendJson(res, 200, { ok: true, versions: rows });
        return;
    }

    if (req.method === "POST" && url.pathname === "/versions/revert") {
        if (!requireAdmin(req, url)) return sendJson(res, 403, { error: "forbidden" });
        const { trackKey, versionId } = await readBodyJson(req);
        
        const ver = db.prepare("SELECT * FROM versions WHERE id = ?").get(versionId);
        if (!ver) return sendJson(res, 404, { error: "version not found" });

        db.transaction(() => {
            const current = db.prepare("SELECT * FROM sync WHERE trackKey = ?").get(trackKey);
            if (current) {
                db.prepare("INSERT INTO versions (trackKey, lines, updatedAt) VALUES (?, ?, ?)")
                  .run(trackKey, current.lines, current.updatedAt);
            }
            db.prepare("UPDATE sync SET lines = ?, updatedAt = ? WHERE trackKey = ?")
              .run(ver.lines, Date.now(), trackKey);
            db.prepare("DELETE FROM versions WHERE id = ?").run(versionId);
        })();

        sendJson(res, 200, { ok: true });
        return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`[lyrify] SQLite backend listening on http://localhost:${PORT}`);
});
