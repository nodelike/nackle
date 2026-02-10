export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
:root { --bg-alpha: 1; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: transparent !important; }
.app-shell { background: rgb(var(--bg-rgb) / var(--bg-alpha)); min-height: 100vh; }
.sidebar-bg { background: rgb(0 0 0 / calc(var(--bg-alpha) * 0.25)); }
::selection { background: var(--selection); }
input::placeholder { color: var(--fg-muted); }
*:focus-visible { outline: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 0; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

.todo-item:hover { background: rgba(255,255,255,0.025); }
.todo-item:last-child { border-bottom: none !important; }
.todo-item:has(+ :not(.todo-item)) { border-bottom: none !important; }
.todo-item.draggable { cursor: grab; }
.todo-item.draggable:active { cursor: grabbing; }

.action-btn { opacity: 0.4; transition: opacity 0.12s, color 0.12s; }
.todo-item:hover .action-btn { opacity: 0.7; }
.action-btn:hover { opacity: 1 !important; }
.archive-btn:hover { color: #C47B3A !important; }
.restore-btn:hover { color: var(--accent-secondary) !important; }
.del-btn:hover { color: var(--danger) !important; }

.priority-pill { transition: opacity 0.12s; }

.collection-item:hover { background: color-mix(in srgb, var(--accent) 5%, transparent); }
.collection-item:hover .col-actions { opacity: 1; }
.col-action-btn { opacity: 0; transition: opacity 0.12s, color 0.12s; }
.collection-item:hover .col-action-btn { opacity: 0.5; }
.col-action-btn:hover { opacity: 1 !important; }
.col-archive-btn:hover { color: #C47B3A !important; }
.col-del-btn:hover { color: var(--danger) !important; }

.add-collection-btn:hover { color: var(--accent) !important; }
.clear-btn:hover { border-color: var(--fg-muted) !important; color: var(--fg) !important; }
.danger-btn:hover { border-color: var(--danger) !important; color: var(--danger) !important; }
.toggle-sidebar:hover { color: var(--fg) !important; }
.checkbox:hover { border-color: var(--accent) !important; }
.checkbox:hover .checkbox-inner { background: color-mix(in srgb, var(--accent) 15%, transparent) !important; }

.header-title:hover { color: var(--fg) !important; }
.header-title-editable:hover { border-bottom-color: var(--fg-muted) !important; }

.theme-switching, .theme-switching *, .theme-switching *::before, .theme-switching *::after { transition: none !important; }
`;

export const S = {
    // Layout
    container: { display: "flex", height: "100vh", color: "var(--fg)", fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace", overflow: "hidden" },

    // Sidebar
    sidebar: { display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", flexShrink: 0, position: "relative" },
    dragRegion: { position: "absolute", top: 0, left: 0, right: 0, height: 28, WebkitAppRegion: "drag" },
    sidebarHeader: { display: "flex", alignItems: "center", gap: 5, marginBottom: 28, paddingLeft: 4, paddingTop: 8 },
    logo: { fontSize: 18 },
    logoText: { fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, letterSpacing: 3, color: "var(--accent)" },
    sidebarSection: { flex: 1, display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" },
    sidebarDivider: { height: 1, background: "var(--border)", margin: "6px 8px" },
    collectionItem: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 0,
        cursor: "pointer",
        transition: "background 0.15s ease",
        fontSize: 13,
        fontWeight: 400,
        position: "relative",
        borderLeftWidth: 2,
        borderLeftStyle: "solid",
        borderLeftColor: "transparent",
    },
    collectionItemActive: { background: "color-mix(in srgb, var(--accent) 8%, transparent)", fontWeight: 500, borderLeftColor: "var(--accent)" },
    collectionIcon: { fontSize: 10, width: 16, textAlign: "center", flexShrink: 0 },
    collectionName: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    badge: { fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace", fontSize: 11, color: "var(--fg-muted)", minWidth: 18, textAlign: "right", flexShrink: 0 },
    colActions: {
        display: "flex",
        gap: 2,
        opacity: 0,
        transition: "opacity 0.12s",
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
    },
    colActionBtn: {
        background: "none",
        border: "none",
        color: "var(--fg-muted)",
        cursor: "pointer",
        padding: "0 2px",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
    },
    inlineEdit: {
        flex: 1,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 0,
        color: "var(--fg)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 13,
        padding: "2px 6px",
        outline: "none",
    },
    addCollectionArea: { paddingTop: 8, borderTop: "1px solid var(--border)", marginTop: 8 },
    addCollectionBtn: {
        background: "none",
        border: "none",
        color: "var(--fg-muted)",
        fontSize: 13,
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        cursor: "pointer",
        padding: "6px 10px",
        borderRadius: 0,
        width: "100%",
        textAlign: "left",
        transition: "color 0.15s",
    },
    newCollectionInput: {
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 0,
        color: "var(--fg)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 13,
        padding: "7px 10px",
        outline: "none",
    },
    shortcuts: { marginTop: 12, fontSize: 11, color: "var(--fg-muted)", lineHeight: 2, paddingLeft: 4, opacity: 0.6 },
    shortcutKey: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 10,
        background: "color-mix(in srgb, var(--accent) 8%, transparent)",
        padding: "1px 5px",
        borderRadius: 0,
        marginRight: 6,
        color: "var(--accent)",
        opacity: 0.7,
    },

    // Main
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topBar: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 32px 12px",
        borderBottom: "1px solid var(--border)",
        WebkitAppRegion: "drag",
    },
    toggleSidebar: {
        background: "none",
        border: "none",
        color: "var(--fg-muted)",
        fontSize: 12,
        cursor: "pointer",
        padding: "4px 6px",
        borderRadius: 0,
        transition: "color 0.15s",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        WebkitAppRegion: "no-drag",
    },
    headerGroup: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
    headerIcon: { fontSize: 12 },
    title: { fontSize: 16, fontWeight: 600, color: "var(--fg)", letterSpacing: -0.3 },
    titleEditable: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--fg)",
        letterSpacing: -0.3,
        cursor: "pointer",
        borderBottom: "1px solid transparent",
        transition: "border-color 0.15s, color 0.15s",
        paddingBottom: 1,
    },
    titleInput: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--fg)",
        letterSpacing: -0.3,
        background: "none",
        border: "none",
        borderBottom: "1px solid var(--fg-muted)",
        outline: "none",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        padding: "0 0 1px 0",
        width: "auto",
        minWidth: 80,
    },
    countPill: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 11,
        color: "var(--fg-muted)",
        background: "rgba(255,255,255,0.03)",
        padding: "2px 8px",
        borderRadius: 0,
    },
    clearBtn: {
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
        fontSize: 12,
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        padding: "4px 12px",
        borderRadius: 0,
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
        WebkitAppRegion: "no-drag",
    },

    // Todo list
    todoList: { flex: 1, overflowY: "auto", padding: "12px 32px 32px" },
    empty: { textAlign: "center", paddingTop: 80 },
    emptyIcon: { fontSize: 32, color: "var(--border)", marginBottom: 12 },
    emptyText: { fontSize: 15, color: "var(--fg-muted)", fontWeight: 500 },
    emptyHint: { fontSize: 13, color: "var(--fg-muted)", marginTop: 6, opacity: 0.5 },
    sectionLabel: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 11,
        color: "var(--fg-muted)",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 8,
        paddingLeft: 8,
    },

    // Todo item
    todoItem: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 8px",
        borderRadius: 0,
        cursor: "default",
        transition: "background 0.1s",
        animation: "fadeIn 0.25s ease both",
        borderBottom: "1px solid rgba(255,255,255,0.02)",
    },
    todoItemDone: { opacity: 0.4 },
    dropIndicator: { borderTop: "2px solid rgba(255,255,255,0.15)" },

    // Checkbox
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 0,
        border: "1.5px solid color-mix(in srgb, var(--accent) 40%, transparent)",
        background: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "border-color 0.15s",
        padding: 0,
    },
    checkboxInner: { width: 8, height: 8, borderRadius: 0, background: "transparent", transition: "background 0.15s" },
    checkboxDone: {
        width: 20,
        height: 20,
        borderRadius: 0,
        border: "1.5px solid var(--accent)",
        background: "color-mix(in srgb, var(--accent) 12%, transparent)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
    },
    checkmark: { fontSize: 11, color: "var(--accent)" },

    // Todo text
    todoText: { flex: 1, fontSize: 13, lineHeight: 1.5, cursor: "pointer", color: "var(--fg)" },
    todoTextDone: { flex: 1, fontSize: 13, textDecoration: "line-through", color: "var(--fg-muted)", cursor: "default" },
    editInput: {
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 0,
        color: "var(--fg)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 13,
        padding: "4px 10px",
        outline: "none",
    },

    // Priority
    priorityPill: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        padding: "1px 6px",
        borderRadius: 0,
        border: "1px solid",
        background: "none",
        cursor: "default",
        flexShrink: 0,
        lineHeight: "16px",
    },

    // Badges & actions
    todoBadge: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 10,
        padding: "2px 7px",
        borderRadius: 0,
        background: "rgba(255,255,255,0.03)",
        flexShrink: 0,
    },
    todoActions: { display: "flex", gap: 2, flexShrink: 0 },
    actionBtn: {
        background: "none",
        border: "none",
        color: "var(--fg-muted)",
        cursor: "pointer",
        padding: "2px 4px",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
    },

    // Completed section
    completedSection: { marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" },
    completedLabel: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 11,
        color: "var(--fg-muted)",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 8,
        paddingLeft: 8,
        opacity: 0.5,
    },
};
