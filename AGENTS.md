# AGENTS.md

Guidelines for AI coding agents operating in this repository.

## Project Overview

Nackle is a fast, minimal, shortcut-driven macOS todo app. Electron 33 + React 19 + SQLite (better-sqlite3) + Vite 6. No TypeScript. No test framework. No linter/formatter configured.

## Build & Run Commands

```bash
npm run dev          # Start Vite dev server + Electron
npm run build        # Compile frontend + electron via Vite
npm run pack         # Build + package .app (no installer)
npm run dist         # Build + package DMG/ZIP
npm run release      # Build + publish to GitHub Releases
npm run postinstall  # Rebuild native modules (runs automatically after npm install)
```

There are **no tests, no linter, no formatter**. Do not attempt to run test/lint commands.

### CI/CD

Tag-triggered release (`v*` tags). GitHub Actions builds x64 + arm64 DMGs, publishes to GitHub Releases, then updates the Homebrew cask in `nodelike/homebrew-tap`.

```bash
npm version patch    # Bump version + create tag
git push && git push --tags  # Triggers CI
```

### Native Module

The `native/` directory contains an Objective-C++ N-API addon for macOS window blur. Rebuild with:

```bash
npx node-gyp rebuild   # Run from native/ directory
```

## Architecture

```
src/                    # React renderer (ESM)
  main.jsx              # Entry point
  TodoApp.jsx           # Root component — ALL app state lives here
  constants.js          # ID generation, theme definitions, utility functions
  styles.js             # Global CSS string (CSS) + inline style objects (S)
  components/           # Child components (all wrapped in React.memo)
electron/               # Electron main process (CommonJS)
  main.js               # DB, IPC handlers, window management, auto-updater
  preload.js            # Context bridge — exposes window.db API
native/                 # Objective-C++ vibrancy addon (macOS only)
build/                  # Build scripts (DMG, cask generator, afterPack hook)
```

### State Management

All state is centralized in `TodoApp.jsx` and passed down via props. No Redux, no Context, no external state library. Pure prop-drilling.

**Optimistic update pattern** for all CRUD operations:

```javascript
const toggleTodo = useCallback(async (id) => {
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: t.done ? 0 : 1 } : t)));
  try { await window.db.toggleTodo(id); } catch (e) { console.error(e); }
}, []);
```

Update local state first, fire-and-forget the DB call, catch and log errors.

### IPC / Database

- Renderer calls `window.db.*` (exposed via `preload.js` context bridge)
- Main process handles via `ipcMain.handle("db:*", ...)` and `ipcMain.handle("app:*", ...)`
- Channel naming: `namespace:action` — e.g. `db:getTodos`, `app:saveSetting`
- SQLite with WAL mode, synchronous=NORMAL, foreign keys ON
- Three tables: `collections`, `todos`, `settings`

## Code Style

### Formatting

- **Double quotes** everywhere (single quotes only inside CSS template literals)
- **Semicolons** always
- **2-space indentation**, no tabs
- **Trailing commas** in multi-line arrays, objects, and parameter lists

### Module System

- **ESM** in `src/` — `import`/`export`
- **CommonJS** in `electron/` and `build/` — `require()`/`module.exports`

### Import Order

1. React / library imports
2. Local utility / constant imports
3. Style imports (`CSS`, `S`)
4. Component imports

```javascript
import { useState, useEffect, useCallback } from "react";
import { generateId, priorityColor, getTheme } from "./constants";
import { CSS, S } from "./styles";
import Sidebar from "./components/Sidebar";
```

### Exports

- **Components**: `export default` at bottom of file (not inline)
- **Icons**: Named exports only (`export function ArchiveIcon`)
- **Utilities/constants**: Named exports (`export function generateId`, `export const themes`)
- **Exception**: `TodoApp.jsx` uses inline `export default function TodoApp()`

### Components

All functional. All child components wrapped in `React.memo` with named function:

```javascript
const Sidebar = memo(function Sidebar({ collections, activeCollection, onSelect }) {
  // ...
});
export default Sidebar;
```

Root `TodoApp` is NOT wrapped in memo.

**Hooks used**: `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo`, `memo`

### Functions

- **Arrow functions** for callbacks and inline handlers
- **`function` declarations** for exported utilities, icon components, and Electron main process top-level functions
- **Handlers in parent**: `handle*` prefix (`handleReorderDrop`, `handleSaveSetting`)
- **Callbacks as props**: `on*` prefix (`onToggle`, `onDelete`, `onArchive`, `onClose`)

### Naming

- **Files (components)**: PascalCase `.jsx` — `TodoItem.jsx`, `CommandPalette.jsx`
- **Files (utilities)**: camelCase `.js` — `constants.js`, `styles.js`
- **Files (build scripts)**: kebab-case `.js` — `make-dmg.js`, `update-cask.js`
- **Variables/functions**: camelCase — `activeCollection`, `handleQuickCapture`
- **Booleans**: `is*` or `can*` prefix — `isAll`, `isArchive`, `canDrag`
- **Constants**: camelCase (not UPPER_CASE) — `defaultTheme`, `themeAccents`
- **IPC channels**: `namespace:action` — `db:getCollections`, `app:saveSetting`

### Error Handling

Minimal. Single-line try/catch with `console.error`:

```javascript
try { await window.db.deleteTodo(id); } catch (e) { console.error(e); }
```

No user-facing error messages. No error boundaries. No retry logic.

### Styling

**No CSS files. No Tailwind. No CSS modules.** Two-layer system:

1. **`CSS`** — global CSS template string injected via `<style>{CSS}</style>`, handles resets, scrollbars, animations, hover states
2. **`S`** — object of inline style objects applied via `style={S.todoItem}`

Some components define local style objects (`S` or `st`) at file top.

**Design rules**:
- `borderRadius: 0` everywhere — sharp corners, no rounding
- CSS custom properties for theming (`--fg`, `--bg-rgb`, `--accent`, `--border`, etc.)
- Fonts: `Outfit` (UI text), `JetBrains Mono` (monospace/badges)
- 13 color themes defined in `constants.js`, each with 12 color properties

### Comments

Section dividers with box-drawing characters:

```javascript
// ── Todo CRUD ──
// ── Collections ──
// ── Derived state ──
```

JSX section labels: `{/* ── Navigation ── */}`

Brief inline comments for non-obvious logic. No JSDoc.

### Conditional Rendering

- Ternary for either/or
- `&&` for conditional display
- Early `return null` for closed modals (`if (!open) return null`)
- Chained ternaries for multi-branch view switching

### Things to Avoid

- Do not add TypeScript — this is a pure JS codebase
- Do not add CSS files or CSS modules — use inline styles
- Do not add external state management — keep state in TodoApp
- Do not add rounded corners (`borderRadius` must be `0`)
- Do not use UPPER_CASE for constants
- Do not add JSDoc comments — keep comments brief
- Do not create class components — functional only
