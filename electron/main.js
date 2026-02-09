const { app, BrowserWindow, ipcMain, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const Database = require("better-sqlite3");

let vibrancy;
try {
  vibrancy = require(path.join(__dirname, "../native/build/Release/vibrancy.node"));
} catch (e) {
  console.warn("Native vibrancy module not available:", e.message);
}

let db;
let win;

// ── Dynamic dock icon ──
const iconSvgPath = path.join(__dirname, "../assets/icon-dock.svg");
const iconPngFallback = path.join(__dirname, "../assets/icon.png");
let iconSvgTemplate = null;
let rsvgPath = null;

try {
  iconSvgTemplate = fs.readFileSync(iconSvgPath, "utf-8");
  // Find rsvg-convert — check common locations
  const candidates = ["/opt/homebrew/bin/rsvg-convert", "/usr/local/bin/rsvg-convert", "/usr/bin/rsvg-convert"];
  for (const p of candidates) {
    if (fs.existsSync(p)) { rsvgPath = p; break; }
  }
} catch (e) {
  console.warn("Could not load icon SVG template:", e.message);
}

function setDockIcon(accentColor) {
  if (process.platform !== "darwin" || !app.dock) return;

  // If we can dynamically render, do it
  if (iconSvgTemplate && rsvgPath && accentColor) {
    try {
      // Replace hardcoded accent (#a277ff) with the theme's accent color
      const svg = iconSvgTemplate.replace(/#a277ff/gi, accentColor);
      const pngBuf = execFileSync(rsvgPath, ["-w", "512", "-h", "512", "/dev/stdin"], {
        input: svg,
        maxBuffer: 1024 * 1024,
      });
      const img = nativeImage.createFromBuffer(pngBuf);
      app.dock.setIcon(img);
      return;
    } catch (e) {
      console.warn("Dynamic dock icon failed, falling back to static:", e.message);
    }
  }

  // Fallback: static PNG
  try {
    app.dock.setIcon(iconPngFallback);
  } catch (e) {
    console.warn("Static dock icon fallback failed:", e.message);
  }
}

function initDB() {
  const dbPath = path.join(app.getPath("userData"), "nackle.db");
  db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");

  // Create tables (columns include all fields for fresh DBs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '◆',
      color TEXT NOT NULL DEFAULT '#8B8B8B',
      sort_order INTEGER NOT NULL DEFAULT 0,
      archived_at INTEGER DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      collection_id TEXT NOT NULL DEFAULT 'inbox',
      created_at INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      archived_at INTEGER DEFAULT NULL,
      priority INTEGER NOT NULL DEFAULT -1
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_todos_collection ON todos(collection_id);
    CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done);
  `);

  // Migrations for existing DBs (idempotent)
  const todoCols = db.prepare("PRAGMA table_info(todos)").all();
  const colCols = db.prepare("PRAGMA table_info(collections)").all();

  if (!todoCols.find((c) => c.name === "archived_at")) {
    db.exec("ALTER TABLE todos ADD COLUMN archived_at INTEGER DEFAULT NULL");
  }
  if (!todoCols.find((c) => c.name === "priority")) {
    db.exec("ALTER TABLE todos ADD COLUMN priority INTEGER NOT NULL DEFAULT -1");
  }
  if (!colCols.find((c) => c.name === "archived_at")) {
    db.exec("ALTER TABLE collections ADD COLUMN archived_at INTEGER DEFAULT NULL");
  }

  // Indexes on migrated columns
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_todos_archived ON todos(archived_at);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
    CREATE INDEX IF NOT EXISTS idx_collections_archived ON collections(archived_at);
  `);

  // Ensure inbox exists
  const inbox = db.prepare("SELECT id FROM collections WHERE id = 'inbox'").get();
  if (!inbox) {
    db.prepare("INSERT INTO collections (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)").run(
      "inbox", "Inbox", "○", "#8B8B8B", 0
    );
  }

  // Default settings (matches Ghostty-style config)
  const defaults = {
    frameless: "false",
    "background-opacity": "0.6",
    "background-blur": "true",
    "background-blur-radius": "20",
    theme: "aura",
  };
  const upsert = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(defaults)) {
    upsert.run(k, v);
  }
}

function getSettings() {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const s = {};
  for (const { key, value } of rows) s[key] = value;
  return s;
}

function registerIPC() {
  // ── Collections ──
  ipcMain.handle("db:getCollections", () => {
    return db.prepare("SELECT * FROM collections WHERE archived_at IS NULL ORDER BY sort_order, rowid").all();
  });

  ipcMain.handle("db:getArchivedCollections", () => {
    return db.prepare("SELECT * FROM collections WHERE archived_at IS NOT NULL ORDER BY archived_at DESC").all();
  });

  ipcMain.handle("db:addCollection", (_, { id, name, icon, color }) => {
    const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM collections").get().m;
    db.prepare("INSERT INTO collections (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)").run(
      id, name, icon, color, maxOrder + 1
    );
    return { id, name, icon, color, sort_order: maxOrder + 1 };
  });

  ipcMain.handle("db:updateCollection", (_, { id, name }) => {
    db.prepare("UPDATE collections SET name = ? WHERE id = ?").run(name, id);
  });

  ipcMain.handle("db:archiveCollection", (_, id) => {
    const now = Date.now();
    const archiveAll = db.transaction(() => {
      db.prepare("UPDATE collections SET archived_at = ? WHERE id = ?").run(now, id);
      db.prepare("UPDATE todos SET archived_at = ? WHERE collection_id = ? AND archived_at IS NULL").run(now, id);
    });
    archiveAll();
  });

  ipcMain.handle("db:restoreCollection", (_, id) => {
    const restoreAll = db.transaction(() => {
      db.prepare("UPDATE collections SET archived_at = NULL WHERE id = ?").run(id);
      db.prepare("UPDATE todos SET archived_at = NULL WHERE collection_id = ? AND archived_at IS NOT NULL").run(id);
    });
    restoreAll();
  });

  ipcMain.handle("db:deleteCollection", (_, id) => {
    const deleteAll = db.transaction(() => {
      db.prepare("DELETE FROM todos WHERE collection_id = ?").run(id);
      db.prepare("DELETE FROM collections WHERE id = ?").run(id);
    });
    deleteAll();
  });

  // ── Todos ──
  ipcMain.handle("db:getTodos", () => {
    return db.prepare(`
      SELECT t.* FROM todos t
      JOIN collections c ON t.collection_id = c.id
      WHERE t.archived_at IS NULL AND c.archived_at IS NULL
      ORDER BY t.done ASC, t.sort_order ASC, t.created_at DESC
    `).all();
  });

  ipcMain.handle("db:getArchived", () => {
    return db.prepare("SELECT * FROM todos WHERE archived_at IS NOT NULL ORDER BY archived_at DESC").all();
  });

  ipcMain.handle("db:addTodo", (_, { id, text, collectionId, priority }) => {
    const now = Date.now();
    const p = priority ?? -1;
    db.prepare("INSERT INTO todos (id, text, done, collection_id, created_at, sort_order, priority) VALUES (?, ?, 0, ?, ?, 0, ?)").run(
      id, text, collectionId, now, p
    );
    return { id, text, done: 0, collection_id: collectionId, created_at: now, sort_order: 0, priority: p, archived_at: null };
  });

  ipcMain.handle("db:toggleTodo", (_, id) => {
    db.prepare("UPDATE todos SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ?").run(id);
    return db.prepare("SELECT done FROM todos WHERE id = ?").get(id);
  });

  ipcMain.handle("db:updateTodo", (_, { id, text }) => {
    db.prepare("UPDATE todos SET text = ? WHERE id = ?").run(text, id);
  });

  ipcMain.handle("db:setPriority", (_, { id, priority }) => {
    db.prepare("UPDATE todos SET priority = ? WHERE id = ?").run(priority, id);
  });

  ipcMain.handle("db:archiveTodo", (_, id) => {
    db.prepare("UPDATE todos SET archived_at = ? WHERE id = ?").run(Date.now(), id);
  });

  ipcMain.handle("db:restoreTodo", (_, id) => {
    db.prepare("UPDATE todos SET archived_at = NULL WHERE id = ?").run(id);
  });

  ipcMain.handle("db:deleteTodo", (_, id) => {
    db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  });

  ipcMain.handle("db:deleteForever", (_, id) => {
    db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  });

  ipcMain.handle("db:emptyArchive", () => {
    const purge = db.transaction(() => {
      db.prepare("DELETE FROM todos WHERE archived_at IS NOT NULL").run();
      const archivedCols = db.prepare("SELECT id FROM collections WHERE archived_at IS NOT NULL").all();
      for (const col of archivedCols) {
        db.prepare("DELETE FROM todos WHERE collection_id = ?").run(col.id);
      }
      db.prepare("DELETE FROM collections WHERE archived_at IS NOT NULL").run();
    });
    purge();
  });

  ipcMain.handle("db:moveTodo", (_, { id, collectionId }) => {
    db.prepare("UPDATE todos SET collection_id = ? WHERE id = ?").run(collectionId, id);
  });

  ipcMain.handle("db:reorderTodos", (_, updates) => {
    const reorder = db.transaction(() => {
      const stmt = db.prepare("UPDATE todos SET sort_order = ? WHERE id = ?");
      for (const { id, sort_order } of updates) {
        stmt.run(sort_order, id);
      }
    });
    reorder();
  });

  ipcMain.handle("db:clearCompleted", (_, collectionId) => {
    const now = Date.now();
    if (collectionId === "__all__") {
      db.prepare("UPDATE todos SET archived_at = ? WHERE done = 1 AND archived_at IS NULL").run(now);
    } else {
      db.prepare("UPDATE todos SET archived_at = ? WHERE done = 1 AND collection_id = ? AND archived_at IS NULL").run(now, collectionId);
    }
  });

  // ── Settings ──
  ipcMain.handle("app:getSettings", () => {
    return getSettings();
  });

  ipcMain.handle("app:saveSetting", (_, { key, value }) => {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    applyWindowSettings();
  });

  ipcMain.handle("app:setDockIcon", (_, accentColor) => {
    setDockIcon(accentColor);
  });

  ipcMain.handle("app:wipeAllData", () => {
    db.transaction(() => {
      db.prepare("DELETE FROM todos").run();
      db.prepare("DELETE FROM collections").run();
      // Re-create inbox
      db.prepare("INSERT INTO collections (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)").run(
        "inbox", "Inbox", "○", "#8B8B8B", 0
      );
    })();
    return true;
  });
}

function applyWindowSettings() {
  if (!win) return;
  const s = getSettings();

  const bgOpacity = parseFloat(s["background-opacity"]);
  const opacity = isNaN(bgOpacity) ? 1 : Math.max(0.001, Math.min(1, bgOpacity));
  const blurRadius = parseInt(s["background-blur-radius"]) || 0;

  // Apply native transparency + blur (Ghostty approach: CGSSetWindowBackgroundBlurRadius)
  if (vibrancy && process.platform === "darwin") {
    const handle = win.getNativeWindowHandle();
    if (opacity < 1) {
      vibrancy.setVibrancy(handle, { blur: blurRadius > 0, blurRadius });
    } else {
      vibrancy.disableTransparency(handle);
    }
  }

  // Push to renderer for CSS background tint
  win.webContents.send("settings:updated", s);
}

function createWindow() {
  const s = getSettings();
  const isFrameless = s.frameless === "true";

  const winOpts = {
    width: 960,
    height: 680,
    minWidth: 640,
    minHeight: 480,
    icon: path.join(__dirname, "../assets/icon.png"),
    backgroundColor: "#00000000",
    transparent: true,
    hasShadow: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (isFrameless) {
    winOpts.frame = false;
  } else {
    winOpts.titleBarStyle = "hiddenInset";
    winOpts.trafficLightPosition = { x: 16, y: 16 };
  }

  win = new BrowserWindow(winOpts);

  win.once("ready-to-show", () => {
    applyWindowSettings();
    win.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// Theme accent lookup — must match constants.js themes
const themeAccents = {
  aura: "#a277ff", catppuccinMocha: "#89b4fa", catppuccinMacchiato: "#8aadf4",
  catppuccinFrappe: "#8caaee", tokyoNight: "#7aa2f7", rosePine: "#c4a7e7",
  rosePineMoon: "#c4a7e7", dracula: "#bd93f9", gruvbox: "#fabd2f",
  nord: "#81a1c1", ayuDark: "#e6b450", ayuMirage: "#ffcc66", midnight: "#E0E0E0",
};

app.whenReady().then(() => {
  initDB();
  registerIPC();
  createWindow();

  // Set dock icon with current theme's accent on startup
  const s = getSettings();
  const accent = themeAccents[s.theme] || themeAccents.aura;
  setDockIcon(accent);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (db) db.close();
  if (process.platform !== "darwin") app.quit();
});
