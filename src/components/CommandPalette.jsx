import { useState, useRef, useEffect, useMemo, memo } from "react";
import { SearchIcon } from "./Icons";

const S = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: 480, maxHeight: 400, background: "rgb(var(--bg-rgb) / 0.85)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column",
    overflow: "hidden", animation: "fadeIn 0.1s ease",
  },
  inputRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderBottom: "1px solid var(--border)",
  },
  icon: { color: "var(--fg-muted)", flexShrink: 0, display: "flex", alignItems: "center" },
  input: {
    flex: 1, background: "none", border: "none", outline: "none",
    color: "var(--fg)", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 400,
  },
  hint: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--fg-muted)",
    flexShrink: 0, opacity: 0.6,
  },
  list: { flex: 1, overflowY: "auto", padding: "4px 0" },
  empty: {
    padding: "24px 16px", textAlign: "center", color: "var(--fg-muted)",
    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, opacity: 0.6,
  },
  sectionLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--fg-muted)",
    letterSpacing: 1, textTransform: "uppercase", padding: "8px 16px 4px", opacity: 0.6,
  },
  item: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 16px", cursor: "pointer", transition: "background 0.06s",
  },
  itemActive: { background: "rgba(255,255,255,0.06)" },
  itemIcon: { fontSize: 10, width: 16, textAlign: "center", flexShrink: 0 },
  itemText: {
    flex: 1, fontSize: 13, color: "var(--fg)", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.85,
  },
  itemMeta: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--fg-muted)",
    flexShrink: 0,
  },
};

const CommandPalette = memo(function CommandPalette({
  open,
  onClose,
  collections,
  todos,
  onSelectCollection,
  onSelectTodo,
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // defer focus to next frame so modal is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items = [];

    // collections
    const matchedCols = q
      ? collections.filter((c) => c.name.toLowerCase().includes(q))
      : collections;
    for (const col of matchedCols) {
      items.push({ type: "collection", id: col.id, name: col.name, icon: col.icon, color: col.color });
    }

    // todos (pending only)
    const pendingTodos = todos.filter((t) => !t.done);
    const matchedTodos = q
      ? pendingTodos.filter((t) => t.text.toLowerCase().includes(q))
      : pendingTodos;
    for (const todo of matchedTodos.slice(0, 20)) {
      const col = collections.find((c) => c.id === todo.collection_id);
      items.push({
        type: "todo", id: todo.id, name: todo.text,
        collectionId: todo.collection_id,
        collectionName: col?.name || "Inbox",
        collectionColor: col?.color || "var(--fg-muted)",
      });
    }

    return items;
  }, [query, collections, todos]);

  // keep activeIndex in bounds
  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(Math.max(0, results.length - 1));
  }, [results.length, activeIndex]);

  // scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = (item) => {
    if (!item) return;
    if (item.type === "collection") {
      onSelectCollection(item.id);
    } else {
      onSelectTodo(item.collectionId, item.id);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  // split results for section labels
  const colResults = results.filter((r) => r.type === "collection");
  const todoResults = results.filter((r) => r.type === "todo");
  let flatIndex = -1;

  return (
    <div style={S.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={S.inputRow}>
          <span style={S.icon}><SearchIcon size={14} strokeWidth={2} /></span>
          <input
            ref={inputRef}
            style={S.input}
            placeholder="Search collections and tasks..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <span style={S.hint}>esc</span>
        </div>

        <div style={S.list} ref={listRef}>
          {results.length === 0 && (
            <div style={S.empty}>No results</div>
          )}

          {colResults.length > 0 && (
            <div style={S.sectionLabel}>Collections</div>
          )}
          {colResults.map((item) => {
            flatIndex++;
            const idx = flatIndex;
            return (
              <div
                key={`c-${item.id}`}
                style={{ ...S.item, ...(activeIndex === idx ? S.itemActive : {}) }}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => select(item)}
              >
                <span style={{ ...S.itemIcon, color: item.color }}>{item.icon}</span>
                <span style={S.itemText}>{item.name}</span>
              </div>
            );
          })}

          {todoResults.length > 0 && (
            <div style={S.sectionLabel}>Tasks</div>
          )}
          {todoResults.map((item) => {
            flatIndex++;
            const idx = flatIndex;
            return (
              <div
                key={`t-${item.id}`}
                style={{ ...S.item, ...(activeIndex === idx ? S.itemActive : {}) }}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => select(item)}
              >
                <span style={{ ...S.itemIcon, color: "var(--fg-muted)", fontSize: 6 }}>{"\u25A0"}</span>
                <span style={S.itemText}>{item.name}</span>
                <span style={{ ...S.itemMeta, color: item.collectionColor }}>{item.collectionName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default CommandPalette;
