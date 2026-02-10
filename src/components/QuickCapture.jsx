import { useState, useRef, useEffect, useMemo, memo } from "react";

const S = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },
    modal: {
        width: 480,
        background: "rgb(var(--bg-rgb) / 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fadeIn 0.1s ease",
    },
    stepLabel: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 10,
        color: "var(--fg-muted)",
        letterSpacing: 1,
        textTransform: "uppercase",
        padding: "12px 16px 0",
    },
    inputRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px 12px",
    },
    input: {
        flex: 1,
        background: "none",
        border: "none",
        outline: "none",
        color: "var(--fg)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 14,
        fontWeight: 400,
    },
    hint: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 10,
        color: "var(--fg-muted)",
        flexShrink: 0,
        opacity: 0.6,
    },
    list: { maxHeight: 200, overflowY: "auto", borderTop: "1px solid var(--border)" },
    item: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 16px",
        cursor: "pointer",
        transition: "background 0.06s",
        fontSize: 13,
        color: "var(--fg)",
        opacity: 0.85,
    },
    itemActive: { background: "rgba(255,255,255,0.06)" },
    itemIcon: { fontSize: 10, width: 16, textAlign: "center", flexShrink: 0 },
    createItem: { color: "var(--accent-secondary)" },
    selectedBadge: {
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    badgeX: {
        cursor: "pointer",
        color: "var(--fg-muted)",
        fontSize: 12,
        lineHeight: 1,
    },
};

const QuickCapture = memo(function QuickCapture({ open, onClose, collections, onCreateTodo }) {
    const [step, setStep] = useState("collection"); // "collection" | "todo"
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        if (open) {
            setStep("collection");
            setQuery("");
            setActiveIndex(0);
            setSelectedCollection(null);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    // Refocus input on step change
    useEffect(() => {
        if (open) {
            setQuery("");
            setActiveIndex(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [step, open]);

    const filteredCollections = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return collections;
        return collections.filter((c) => c.name.toLowerCase().includes(q));
    }, [query, collections]);

    const showCreate = step === "collection" && query.trim() && !collections.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());

    const items =
        step === "collection"
            ? [...filteredCollections.map((c) => ({ type: "existing", ...c })), ...(showCreate ? [{ type: "create", name: query.trim() }] : [])]
            : [];

    // Keep activeIndex in bounds
    useEffect(() => {
        if (activeIndex >= items.length) setActiveIndex(Math.max(0, items.length - 1));
    }, [items.length, activeIndex]);

    // Scroll active into view
    useEffect(() => {
        const el = listRef.current?.children?.[activeIndex];
        if (el) el.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    const selectCollection = (item) => {
        if (item.type === "create") {
            setSelectedCollection({ id: null, name: item.name, isNew: true });
        } else {
            setSelectedCollection({ id: item.id, name: item.name, color: item.color, icon: item.icon, isNew: false });
        }
        setStep("todo");
    };

    const submitTodo = () => {
        const text = query.trim();
        if (!text) return;
        onCreateTodo(selectedCollection, text);
        onClose();
    };

    const goBackToCollection = () => {
        setSelectedCollection(null);
        setStep("collection");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            if (step === "todo") {
                goBackToCollection();
            } else {
                onClose();
            }
            return;
        }

        if (step === "collection") {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (items[activeIndex]) {
                    selectCollection(items[activeIndex]);
                }
            }
        } else if (step === "todo") {
            if (e.key === "Enter") {
                e.preventDefault();
                submitTodo();
            } else if (e.key === "Backspace" && !query) {
                goBackToCollection();
            }
        }
    };

    if (!open) return null;

    return (
        <div
            style={S.overlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}>
            <div style={S.modal}>
                <div style={S.stepLabel}>{step === "collection" ? "1 \u2014 pick collection" : "2 \u2014 enter task"}</div>

                <div style={S.inputRow}>
                    {step === "todo" && selectedCollection && (
                        <span style={S.selectedBadge}>
                            {selectedCollection.isNew ? "+ " : ""}
                            {selectedCollection.name}
                            <span style={S.badgeX} onClick={goBackToCollection}>
                                &times;
                            </span>
                        </span>
                    )}
                    <input
                        ref={inputRef}
                        style={S.input}
                        placeholder={step === "collection" ? "Collection name..." : "Task description..."}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <span style={S.hint}>{step === "collection" ? "\u21B5 select" : "\u21B5 create"}</span>
                </div>

                {step === "collection" && items.length > 0 && (
                    <div style={S.list} ref={listRef}>
                        {items.map((item, i) => (
                            <div
                                key={item.type === "create" ? "__create__" : item.id}
                                style={{ ...S.item, ...(activeIndex === i ? S.itemActive : {}), ...(item.type === "create" ? S.createItem : {}) }}
                                onMouseEnter={() => setActiveIndex(i)}
                                onClick={() => selectCollection(item)}>
                                {item.type === "create" ? (
                                    <>
                                        <span style={S.itemIcon}>+</span>
                                        <span>Create "{item.name}"</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ ...S.itemIcon, color: item.color }}>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default QuickCapture;
