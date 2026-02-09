import { useState, useRef, useEffect, memo } from "react";
import { S } from "../styles";
import { ArchiveIcon, TrashIcon, NackleLogo } from "./Icons";

const SettingsIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const isMac = navigator.platform?.toUpperCase().includes("MAC") || navigator.userAgent?.includes("Mac");

const Kbd = ({ children }) => (
  <span style={S.shortcutKey}>
    {isMac && <span style={{ fontSize: 13, lineHeight: 1, verticalAlign: "-1px", position: "relative", top: 0.5 }}>{"\u2318"}</span>}
    {!isMac && <span>Ctrl+</span>}
    {children}
  </span>
);

const Sidebar = memo(function Sidebar({
  collections,
  todos,
  archived,
  archivedCollections,
  activeCollection,
  sidebarOpen,
  onSelectCollection,
  onAddCollection,
  onEditCollection,
  onArchiveCollection,
  onDeleteCollection,
  onOpenSettings,
}) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const newRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    if (showNew) newRef.current?.focus();
  }, [showNew]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const isAll = activeCollection === "__all__";
  const isArchive = activeCollection === "__archive__";
  const isSettings = activeCollection === "__settings__";
  const allCount = todos.filter((t) => !t.done).length;
  const archiveCount = archived.length + archivedCollections.length;
  const doneCount = todos.filter((t) => t.done).length;

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAddCollection(name);
    setNewName("");
    setShowNew(false);
  };

  const startEdit = (col) => {
    if (col.id === "inbox") return;
    setEditingId(col.id);
    setEditName(col.name);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    onEditCollection(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div
      className="sidebar-bg"
      style={{
        ...S.sidebar,
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        opacity: sidebarOpen ? 1 : 0,
        padding: sidebarOpen ? "24px 12px 16px" : "24px 0 16px",
        overflow: "hidden",
        transition: "width 0.2s ease, min-width 0.2s ease, opacity 0.2s ease, padding 0.2s ease",
      }}
    >
      <div style={S.dragRegion} />

      {/* Logo */}
      <div style={{ ...S.sidebarHeader, justifyContent: "center" }}>
        <span style={{ ...S.logo, color: "var(--accent)", display: "flex", alignItems: "center" }}><NackleLogo size={20} /></span>
        <span style={S.logoText}>ACKLE</span>
      </div>

      {/* ── Navigation ── */}
      <div style={{ marginBottom: 20 }}>
        <div
          className="collection-item"
          style={{ ...S.collectionItem, ...(isAll ? S.collectionItemActive : {}) }}
          onClick={() => onSelectCollection("__all__")}
        >
          <span style={{ ...S.collectionIcon, color: isAll ? "var(--accent)" : "var(--fg)", fontSize: 12 }}>&#9776;</span>
          <span style={{ ...S.collectionName, ...(isAll ? { color: "var(--accent)" } : {}) }}>All Tasks</span>
          {allCount > 0 && <span style={{ ...S.badge, ...(isAll ? { color: "var(--accent)", opacity: 0.7 } : {}) }}>{allCount}</span>}
        </div>

        <div
          className="collection-item"
          style={{ ...S.collectionItem, ...(isArchive ? S.collectionItemActive : {}) }}
          onClick={() => onSelectCollection("__archive__")}
        >
          <span style={{ ...S.collectionIcon, display: "flex", alignItems: "center", justifyContent: "center", color: isArchive ? "var(--accent)" : "var(--fg-muted)" }}>
            <ArchiveIcon size={12} strokeWidth={2} />
          </span>
          <span style={{ ...S.collectionName, ...(isArchive ? { color: "var(--accent)" } : {}) }}>Archive</span>
          {archiveCount > 0 && <span style={{ ...S.badge, ...(isArchive ? { color: "var(--accent)", opacity: 0.7 } : {}) }}>{archiveCount}</span>}
        </div>
      </div>

      {/* ── Collections ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", marginBottom: 6 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
            color: "var(--fg-muted)", letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.5,
          }}>Collections</span>
          <button
            className="add-collection-btn"
            style={{
              background: "none", border: "none", color: "var(--fg-muted)", fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", padding: "0 2px",
              lineHeight: 1, opacity: 0.5, transition: "color 0.15s, opacity 0.15s",
            }}
            onClick={() => setShowNew(true)}
            title="New collection"
          >
            +
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {collections.map((col) => {
            const count = todos.filter((t) => t.collection_id === col.id && !t.done).length;
            const isActive = activeCollection === col.id && !isAll && !isArchive;
            return (
              <div
                key={col.id}
                className="collection-item"
                style={{ ...S.collectionItem, ...(isActive ? S.collectionItemActive : {}) }}
                onClick={() => onSelectCollection(col.id)}
                onDoubleClick={() => startEdit(col)}
              >
                <span style={{ ...S.collectionIcon, color: isActive ? "var(--accent)" : col.color }}>{col.icon}</span>
                {editingId === col.id ? (
                  <input
                    ref={editRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    style={S.inlineEdit}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span style={{ ...S.collectionName, ...(isActive ? { color: "var(--fg)" } : {}) }}>{col.name}</span>
                )}
                {count > 0 && <span style={{ ...S.badge, ...(isActive ? { color: "var(--accent)", opacity: 0.7 } : {}) }}>{count}</span>}
                {isActive && col.id !== "inbox" && (
                  <div className="col-actions" style={S.colActions}>
                    <button
                      className="col-action-btn col-archive-btn"
                      style={S.colActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveCollection(col.id);
                      }}
                      title="Archive collection"
                    >
                      <ArchiveIcon size={11} strokeWidth={2.5} />
                    </button>
                    <button
                      className="col-action-btn col-del-btn"
                      style={S.colActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCollection(col.id);
                      }}
                      title="Delete collection"
                    >
                      <TrashIcon size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* New collection input */}
          {showNew && (
            <div style={{ padding: "4px 10px" }}>
              <input
                ref={newRef}
                style={S.newCollectionInput}
                placeholder="Collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setShowNew(false);
                    setNewName("");
                  }
                }}
                onBlur={() => {
                  if (!newName.trim()) setShowNew(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 16, padding: "0 12px 10px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", justifyContent: "space-between" }}>
          <span style={{ color: "var(--accent)", opacity: 0.5 }}>{allCount} <span style={{ opacity: 0.7 }}>open</span></span>
          <span style={{ color: "var(--accent-secondary)", opacity: 0.4 }}>{doneCount} <span style={{ opacity: 0.7 }}>done</span></span>
          <span style={{ color: "var(--fg-muted)", opacity: 0.35 }}>{collections.length} <span style={{ opacity: 0.7 }}>lists</span></span>
        </div>

        {/* Settings */}
        <div
          className="collection-item"
          style={{
            ...S.collectionItem,
            ...(isSettings ? S.collectionItemActive : {}),
          }}
          onClick={() => onOpenSettings?.()}
        >
          <span style={{ ...S.collectionIcon, display: "flex", alignItems: "center", justifyContent: "center", color: isSettings ? "var(--accent)" : "var(--fg-muted)" }}>
            <SettingsIcon size={12} />
          </span>
          <span style={{ ...S.collectionName, ...(isSettings ? { color: "var(--accent)" } : {}), fontSize: 13 }}>Settings</span>
          <span style={{ ...S.shortcutKey, marginLeft: "auto" }}>
            {isMac ? <span style={{ fontSize: 13, verticalAlign: "-1px", position: "relative", top: 0.5 }}>{"\u2318"}</span> : <span>Ctrl+</span>},
          </span>
        </div>

        {/* Shortcuts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "6px 12px 0", fontSize: 11, color: "var(--fg-muted)", opacity: 0.45 }}>
          <div style={{ display: "flex", alignItems: "center" }}><Kbd>N</Kbd> <span>new task</span></div>
          <div style={{ display: "flex", alignItems: "center" }}><Kbd>P</Kbd> <span>search</span></div>
          <div style={{ display: "flex", alignItems: "center" }}><Kbd>B</Kbd> <span>sidebar</span></div>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;
