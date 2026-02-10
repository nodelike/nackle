import { useState, useEffect, useCallback } from "react";
import { generateId, priorityColor, getTheme, hexToRgbStr, themes, defaultTheme } from "./constants";
import { CSS, S } from "./styles";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import TodoItem from "./components/TodoItem";
import ArchiveView from "./components/ArchiveView";
import CommandPalette from "./components/CommandPalette";
import QuickCapture from "./components/QuickCapture";
import Settings from "./components/Settings";

export default function TodoApp() {
    const [collections, setCollections] = useState([]);
    const [archivedCollections, setArchivedCollections] = useState([]);
    const [todos, setTodos] = useState([]);
    const [archived, setArchived] = useState([]);
    const [activeCollection, setActiveCollection] = useState("inbox");
    const [loaded, setLoaded] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [draggedTodo, setDraggedTodo] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [captureOpen, setCaptureOpen] = useState(false);
    const [appSettings, setAppSettings] = useState({});
    const [appVersion, setAppVersion] = useState("");

    // ── Load ──
    useEffect(() => {
        (async () => {
            try {
                const [cols, archCols, tds, arch, settings, version] = await Promise.all([
                    window.db.getCollections(),
                    window.db.getArchivedCollections(),
                    window.db.getTodos(),
                    window.db.getArchived(),
                    window.db.getSettings(),
                    window.db.getVersion(),
                ]);
                setCollections(cols);
                setArchivedCollections(archCols);
                setTodos(tds);
                setArchived(arch);
                setAppSettings(settings);
                setAppVersion(version);
            } catch (e) {
                console.error("Load failed:", e);
            }
            setLoaded(true);
        })();
    }, []);

    // ── Apply theme CSS variables to :root ──
    const themeName = appSettings.theme || defaultTheme;
    const theme = getTheme(themeName);

    useEffect(() => {
        const root = document.documentElement;

        // Kill all transitions during theme switch to prevent white flash
        root.classList.add("theme-switching");

        root.style.setProperty("--fg", theme.foreground);
        root.style.setProperty("--fg-muted", theme.foregroundMuted);
        root.style.setProperty("--border", theme.border);
        root.style.setProperty("--bg-rgb", hexToRgbStr(theme.background));
        root.style.setProperty("--bg-secondary-rgb", hexToRgbStr(theme.backgroundSecondary));
        root.style.setProperty("--surface", theme.surface);
        root.style.setProperty("--accent", theme.accent);
        root.style.setProperty("--accent-secondary", theme.accentSecondary);
        root.style.setProperty("--danger", theme.danger);
        root.style.setProperty("--warning", theme.warning);
        root.style.setProperty("--selection", theme.selection);

        // Re-enable transitions after one frame so all CSS vars have settled
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.remove("theme-switching");
            });
        });

        // Update dock icon to match theme accent
        window.db.setDockIcon?.(theme.accent);
    }, [theme]);

    // ── Apply background opacity CSS variable ──
    useEffect(() => {
        const alpha = parseFloat(appSettings["background-opacity"]);
        const val = isNaN(alpha) ? 1 : Math.max(0, Math.min(1, alpha));
        document.documentElement.style.setProperty("--bg-alpha", String(val));
    }, [appSettings["background-opacity"]]);

    // ── Listen for settings pushed from main process ──
    useEffect(() => {
        if (!window.db.onSettingsUpdated) return;
        const unsub = window.db.onSettingsUpdated((settings) => {
            setAppSettings(settings);
        });
        return unsub;
    }, []);

    // ── Keyboard shortcuts ──
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "n") {
                e.preventDefault();
                setCaptureOpen(true);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "b") {
                e.preventDefault();
                setSidebarOpen((p) => !p);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "p") {
                e.preventDefault();
                setPaletteOpen((p) => !p);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === ",") {
                e.preventDefault();
                setActiveCollection("__settings__");
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // ── Todo CRUD ──
    const addTodoToCollection = useCallback(async (collectionId, text) => {
        const id = generateId();
        const newItem = {
            id,
            text,
            done: 0,
            collection_id: collectionId,
            created_at: Date.now(),
            sort_order: 0,
            archived_at: null,
        };
        setTodos((prev) => [newItem, ...prev]);
        try {
            await window.db.addTodo({ id, text, collectionId, priority: -1 });
        } catch (e) {
            console.error(e);
        }
    }, []);

    const toggleTodo = useCallback(async (id) => {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: t.done ? 0 : 1 } : t)));
        try {
            await window.db.toggleTodo(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const deleteTodo = useCallback(async (id) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        try {
            await window.db.deleteTodo(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const archiveTodo = useCallback(async (id) => {
        setTodos((prev) => {
            const todo = prev.find((t) => t.id === id);
            if (todo) setArchived((a) => [{ ...todo, archived_at: Date.now() }, ...a]);
            return prev.filter((t) => t.id !== id);
        });
        try {
            await window.db.archiveTodo(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const restoreTodo = useCallback(async (id) => {
        setArchived((prev) => {
            const todo = prev.find((t) => t.id === id);
            if (todo) setTodos((ts) => [{ ...todo, archived_at: null }, ...ts]);
            return prev.filter((t) => t.id !== id);
        });
        try {
            await window.db.restoreTodo(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const deleteForever = useCallback(async (id) => {
        setArchived((prev) => prev.filter((t) => t.id !== id));
        try {
            await window.db.deleteForever(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const emptyArchive = useCallback(async () => {
        setArchived([]);
        setArchivedCollections([]);
        try {
            await window.db.emptyArchive();
        } catch (e) {
            console.error(e);
        }
    }, []);

    const updateTodo = useCallback(async (id, text) => {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
        try {
            await window.db.updateTodo({ id, text });
        } catch (e) {
            console.error(e);
        }
    }, []);

    // ── Collection CRUD ──
    const createCollectionRaw = useCallback(
        async (name) => {
            const colors = ["#E8A87C", "#85B8CB", "#C38D9E", "#41B3A3", "#D4A574", "#7FB685", "#CB8589", "#6C9BC2"];
            const id = generateId();
            const color = colors[collections.length % colors.length];
            const col = { id, name, icon: "\u25C6", color, sort_order: collections.length, archived_at: null };
            setCollections((prev) => [...prev, col]);
            try {
                await window.db.addCollection({ id, name, icon: "\u25C6", color });
            } catch (e) {
                console.error(e);
            }
            return id;
        },
        [collections.length],
    );

    const addCollection = useCallback(
        async (name) => {
            const id = await createCollectionRaw(name);
            setActiveCollection(id);
        },
        [createCollectionRaw],
    );

    const renameCollection = useCallback(async (id, name) => {
        setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
        try {
            await window.db.updateCollection({ id, name });
        } catch (e) {
            console.error(e);
        }
    }, []);

    const archiveCollection = useCallback(
        async (id) => {
            if (id === "inbox") return;
            const col = collections.find((c) => c.id === id);
            if (!col) return;
            const now = Date.now();
            setCollections((prev) => prev.filter((c) => c.id !== id));
            setArchivedCollections((prev) => [{ ...col, archived_at: now }, ...prev]);
            setTodos((prev) => {
                const moving = prev.filter((t) => t.collection_id === id);
                if (moving.length) setArchived((a) => [...moving.map((t) => ({ ...t, archived_at: now })), ...a]);
                return prev.filter((t) => t.collection_id !== id);
            });
            setActiveCollection((prev) => (prev === id ? "inbox" : prev));
            try {
                await window.db.archiveCollection(id);
            } catch (e) {
                console.error(e);
            }
        },
        [collections],
    );

    const restoreCollection = useCallback(
        async (id) => {
            const col = archivedCollections.find((c) => c.id === id);
            if (!col) return;
            setArchivedCollections((prev) => prev.filter((c) => c.id !== id));
            setCollections((prev) => [...prev, { ...col, archived_at: null }]);
            setArchived((prev) => {
                const restoring = prev.filter((t) => t.collection_id === id);
                if (restoring.length) setTodos((ts) => [...restoring.map((t) => ({ ...t, archived_at: null })), ...ts]);
                return prev.filter((t) => t.collection_id !== id);
            });
            try {
                await window.db.restoreCollection(id);
            } catch (e) {
                console.error(e);
            }
        },
        [archivedCollections],
    );

    const deleteCollection = useCallback(async (id) => {
        if (id === "inbox") return;
        setCollections((prev) => prev.filter((c) => c.id !== id));
        setArchivedCollections((prev) => prev.filter((c) => c.id !== id));
        setTodos((prev) => prev.filter((t) => t.collection_id !== id));
        setArchived((prev) => prev.filter((t) => t.collection_id !== id));
        setActiveCollection((prev) => (prev === id ? "inbox" : prev));
        try {
            await window.db.deleteCollection(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    // ── Drag & Drop ──
    const handleReorderDrop = useCallback(
        async (targetIndex, listItems) => {
            if (!draggedTodo) return;
            const fromIndex = listItems.findIndex((t) => t.id === draggedTodo.id);
            if (fromIndex === -1 || fromIndex === targetIndex) {
                setDropIndex(null);
                return;
            }
            const reordered = [...listItems];
            const [moved] = reordered.splice(fromIndex, 1);
            reordered.splice(targetIndex > fromIndex ? targetIndex - 1 : targetIndex, 0, moved);
            const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }));
            setTodos((prev) => {
                const updated = new Map(updates.map((u) => [u.id, u.sort_order]));
                return prev.map((t) => (updated.has(t.id) ? { ...t, sort_order: updated.get(t.id) } : t));
            });
            setDropIndex(null);
            setDraggedTodo(null);
            try {
                await window.db.reorderTodos(updates);
            } catch (e) {
                console.error(e);
            }
        },
        [draggedTodo],
    );

    const clearCompleted = useCallback(async () => {
        const colId = activeCollection;
        const now = Date.now();
        setTodos((prev) => {
            const toArchive = prev.filter((t) => t.done && (colId === "__all__" || t.collection_id === colId));
            if (toArchive.length) setArchived((a) => [...toArchive.map((t) => ({ ...t, archived_at: now })), ...a]);
            return prev.filter((t) => !toArchive.find((a) => a.id === t.id));
        });
        try {
            await window.db.clearCompleted(colId);
        } catch (e) {
            console.error(e);
        }
    }, [activeCollection]);

    // ── Quick capture handler ──
    const handleQuickCapture = useCallback(
        async (collection, todoText) => {
            let colId;
            if (collection.isNew) {
                colId = await createCollectionRaw(collection.name);
            } else {
                colId = collection.id;
            }
            await addTodoToCollection(colId, todoText);
            setActiveCollection(colId);
        },
        [createCollectionRaw, addTodoToCollection],
    );

    // ── Settings handlers ──
    const handleSaveSetting = useCallback(async (key, value) => {
        setAppSettings((prev) => ({ ...prev, [key]: value }));
        try {
            await window.db.saveSetting({ key, value });
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleWipeAllData = useCallback(async () => {
        try {
            await window.db.wipeAllData();
            const [cols, tds, arch, archCols] = await Promise.all([
                window.db.getCollections(),
                window.db.getTodos(),
                window.db.getArchived(),
                window.db.getArchivedCollections(),
            ]);
            setCollections(cols);
            setTodos(tds);
            setArchived(arch);
            setArchivedCollections(archCols);
            setActiveCollection("inbox");
        } catch (e) {
            console.error(e);
        }
    }, []);

    // ── Command palette handlers ──
    const handlePaletteSelectCollection = useCallback((id) => {
        setActiveCollection(id);
    }, []);

    const handlePaletteSelectTodo = useCallback((collectionId) => {
        setActiveCollection(collectionId);
    }, []);

    // ── Derived state ──
    const activeCol = collections.find((c) => c.id === activeCollection) || collections[0];
    const isAll = activeCollection === "__all__";
    const isArchive = activeCollection === "__archive__";
    const isSettings = activeCollection === "__settings__";
    const canDrag = !isAll && !isArchive && !isSettings;

    const sortTodos = (list) =>
        [...list].sort((a, b) => {
            if (a.done !== b.done) return a.done - b.done;
            if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
            return b.created_at - a.created_at;
        });

    const activeTodos = isAll ? sortTodos(todos) : sortTodos(todos.filter((t) => t.collection_id === activeCollection));
    const pending = activeTodos.filter((t) => !t.done);
    const completed = activeTodos.filter((t) => t.done);
    const archiveCount = archived.length + archivedCollections.length;

    const getCollectionName = useCallback(
        (id) => {
            const c = collections.find((c) => c.id === id) || archivedCollections.find((c) => c.id === id);
            return c?.name || "Inbox";
        },
        [collections, archivedCollections],
    );

    const getCollectionColor = useCallback(
        (id) => {
            const c = collections.find((c) => c.id === id) || archivedCollections.find((c) => c.id === id);
            return c?.color || "#8B8B8B";
        },
        [collections, archivedCollections],
    );

    if (!loaded) return null;

    const pendingCount = pending.length;

    return (
        <div className="app-shell" style={S.container}>
            <style>{CSS}</style>

            <CommandPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                collections={collections}
                todos={todos}
                onSelectCollection={handlePaletteSelectCollection}
                onSelectTodo={handlePaletteSelectTodo}
            />

            <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} collections={collections} onCreateTodo={handleQuickCapture} />

            <Sidebar
                collections={collections}
                todos={todos}
                archived={archived}
                archivedCollections={archivedCollections}
                activeCollection={activeCollection}
                sidebarOpen={sidebarOpen}
                onSelectCollection={setActiveCollection}
                onAddCollection={addCollection}
                onEditCollection={renameCollection}
                onArchiveCollection={archiveCollection}
                onDeleteCollection={deleteCollection}
                onOpenSettings={() => setActiveCollection("__settings__")}
            />

            <div style={S.main}>
                <TopBar
                    activeCollection={activeCollection}
                    activeCol={activeCol}
                    isAll={isAll}
                    isArchive={isArchive}
                    pendingCount={pendingCount}
                    completedCount={completed.length}
                    archiveCount={archiveCount}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen((p) => !p)}
                    onClearCompleted={clearCompleted}
                    onEmptyArchive={emptyArchive}
                    onRenameCollection={renameCollection}
                />

                {/* Settings, Archive, or Normal view */}
                {isSettings ? (
                    <Settings
                        settings={appSettings}
                        onSaveSetting={handleSaveSetting}
                        onWipeAllData={handleWipeAllData}
                        themes={themes}
                        currentTheme={themeName}
                        appVersion={appVersion}
                    />
                ) : isArchive ? (
                    <ArchiveView
                        archived={archived}
                        archivedCollections={archivedCollections}
                        archiveCount={archiveCount}
                        onRestoreTodo={restoreTodo}
                        onDeleteForever={deleteForever}
                        onRestoreCollection={restoreCollection}
                        onDeleteCollection={deleteCollection}
                        onNavigateCollection={setActiveCollection}
                        getCollectionName={getCollectionName}
                        getCollectionColor={getCollectionColor}
                    />
                ) : (
                    <div
                        style={S.todoList}
                        onDragOver={(e) => {
                            if (canDrag && draggedTodo) e.preventDefault();
                        }}
                        onDrop={(e) => {
                            if (!canDrag || !draggedTodo) return;
                            e.preventDefault();
                            if (dropIndex === null) handleReorderDrop(pending.length, pending);
                        }}>
                        {pending.length === 0 && completed.length === 0 && (
                            <div style={S.empty}>
                                <div style={S.emptyIcon}>&#10003;</div>
                                <div style={S.emptyText}>{isAll ? "No tasks yet" : "All clear"}</div>
                                <div style={S.emptyHint}>{isAll ? "Press \u2318N to add a task" : "Press \u2318N to add a task"}</div>
                            </div>
                        )}

                        {pending.map((todo, i) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                index={i}
                                isDone={false}
                                showCollection={isAll}
                                canDrag={canDrag}
                                draggedTodo={draggedTodo}
                                dropIndex={dropIndex}
                                priorityLabel={`P${i}`}
                                priorityColor={priorityColor(i, pendingCount, theme)}
                                onNavigateCollection={setActiveCollection}
                                onToggle={toggleTodo}
                                onDelete={deleteTodo}
                                onArchive={archiveTodo}
                                onUpdate={updateTodo}
                                onDragStart={setDraggedTodo}
                                onDragEnd={() => {
                                    setDraggedTodo(null);
                                    setDropIndex(null);
                                }}
                                onDragOver={setDropIndex}
                                onDrop={(idx) => handleReorderDrop(idx, pending)}
                                getCollectionName={getCollectionName}
                                getCollectionColor={getCollectionColor}
                            />
                        ))}

                        {completed.length > 0 && (
                            <div style={S.completedSection}>
                                <div style={S.completedLabel}>Completed</div>
                                {completed.map((todo, i) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        index={i}
                                        isDone={true}
                                        showCollection={isAll}
                                        canDrag={false}
                                        onNavigateCollection={setActiveCollection}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onArchive={archiveTodo}
                                        onUpdate={updateTodo}
                                        getCollectionName={getCollectionName}
                                        getCollectionColor={getCollectionColor}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
