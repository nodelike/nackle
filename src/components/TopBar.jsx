import { useState, useRef, useEffect, memo } from "react";
import { S } from "../styles";

const TopBar = memo(function TopBar({
  activeCollection,
  activeCol,
  isAll,
  isArchive,
  pendingCount,
  completedCount,
  archiveCount,
  sidebarOpen,
  onToggleSidebar,
  onClearCompleted,
  onEmptyArchive,
  onRenameCollection,
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const renameRef = useRef(null);

  useEffect(() => {
    if (editing) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [editing]);

  const isSettings = activeCollection === "__settings__";
  const canRename = !isAll && !isArchive && !isSettings && activeCol && activeCol.id !== "inbox";

  const startRename = () => {
    if (!canRename) return;
    setEditName(activeCol.name);
    setEditing(true);
  };

  const saveRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== activeCol.name) {
      onRenameCollection(activeCol.id, trimmed);
    }
    setEditing(false);
  };

  const displayName = isSettings ? "Settings" : isAll ? "All Tasks" : isArchive ? "Archive" : activeCol?.name;

  return (
    <div style={S.topBar}>
      <button className="toggle-sidebar" style={S.toggleSidebar} onClick={onToggleSidebar}>
        {sidebarOpen ? "\u25C1" : "\u25B7"}
      </button>

      <div style={S.headerGroup}>
        {!isAll && !isArchive && !isSettings && activeCol && (
          <span style={{ ...S.headerIcon, color: activeCol.color }}>{activeCol.icon}</span>
        )}

        {editing ? (
          <input
            ref={renameRef}
            style={{ ...S.titleInput, WebkitAppRegion: "no-drag" }}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <h1
            className={canRename ? "header-title header-title-editable" : ""}
            style={canRename ? { ...S.titleEditable, WebkitAppRegion: "no-drag" } : S.title}
            onClick={canRename ? startRename : undefined}
            title={canRename ? "Click to rename" : undefined}
          >
            {displayName}
          </h1>
        )}

        {!isSettings && (
          <span style={S.countPill}>
            {isArchive
              ? `${archiveCount} item${archiveCount !== 1 ? "s" : ""}`
              : `${pendingCount} task${pendingCount !== 1 ? "s" : ""}`}
          </span>
        )}
      </div>

      {!isArchive && !isSettings && completedCount > 0 && (
        <button className="clear-btn" style={S.clearBtn} onClick={onClearCompleted}>
          Archive done ({completedCount})
        </button>
      )}

      {isArchive && archiveCount > 0 && (
        <button
          className="clear-btn danger-btn"
          style={{ ...S.clearBtn, borderColor: "var(--danger)", opacity: 0.6 }}
          onClick={onEmptyArchive}
        >
          Delete all
        </button>
      )}
    </div>
  );
});

export default TopBar;
