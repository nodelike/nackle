import { useState, useRef, useEffect, memo } from "react";
import { S } from "../styles";
import { ArchiveIcon, TrashIcon, RestoreIcon } from "./Icons";

const TodoItem = memo(function TodoItem({
    todo,
    index,
    isDone,
    showCollection,
    canDrag,
    draggedTodo,
    dropIndex,
    priorityLabel,
    priorityColor,
    onToggle,
    onDelete,
    onArchive,
    onRestore,
    onDeleteForever,
    onUpdate,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    getCollectionName,
    getCollectionColor,
    onNavigateCollection,
    isArchived,
}) {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const editRef = useRef(null);

    useEffect(() => {
        if (editing) editRef.current?.focus();
    }, [editing]);

    const startEdit = () => {
        if (isDone || isArchived) return;
        setEditText(todo.text);
        setEditing(true);
    };

    const saveEdit = () => {
        const trimmed = editText.trim();
        if (trimmed && trimmed !== todo.text) {
            onUpdate(todo.id, trimmed);
        }
        setEditing(false);
    };

    const draggable = canDrag && !isDone;

    return (
        <div
            className={`todo-item${draggable ? " draggable" : ""}`}
            style={{
                ...S.todoItem,
                ...(isDone ? S.todoItemDone : {}),
                animationDelay: `${index * 25}ms`,
                ...(dropIndex === index && draggable ? S.dropIndicator : {}),
                ...(isArchived ? { opacity: 0.6 } : {}),
            }}
            draggable={draggable}
            onDragStart={(e) => {
                if (!draggable) return;
                onDragStart?.(todo);
                e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => onDragEnd?.()}
            onDragOver={(e) => {
                if (!draggable || !draggedTodo) return;
                e.preventDefault();
                onDragOver?.(index);
            }}
            onDrop={(e) => {
                if (!draggable || !draggedTodo) return;
                e.preventDefault();
                e.stopPropagation();
                onDrop?.(index);
            }}>
            {/* Checkbox */}
            <button className="checkbox" style={isDone ? S.checkboxDone : S.checkbox} onClick={() => (isArchived ? null : onToggle(todo.id))}>
                {isDone ? (
                    <span style={S.checkmark}>&#10003;</span>
                ) : isArchived ? (
                    <span style={{ width: 8, height: 8, background: "var(--border)", display: "block" }} />
                ) : (
                    <span className="checkbox-inner" style={S.checkboxInner} />
                )}
            </button>

            {/* Text */}
            {editing ? (
                <input
                    ref={editRef}
                    style={S.editInput}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditing(false);
                    }}
                />
            ) : (
                <span
                    style={isDone ? S.todoTextDone : isArchived ? { ...S.todoText, color: "var(--fg-muted)", cursor: "default" } : S.todoText}
                    onClick={startEdit}>
                    {todo.text}
                </span>
            )}

            {/* Positional priority pill */}
            {!isArchived && !isDone && priorityLabel && (
                <span
                    className="priority-pill"
                    style={{
                        ...S.priorityPill,
                        color: priorityColor,
                        borderColor: priorityColor + "40",
                    }}>
                    {priorityLabel}
                </span>
            )}

            {/* Collection badge */}
            {showCollection && (
                <span
                    style={{
                        ...S.todoBadge,
                        color: getCollectionColor(todo.collection_id),
                        opacity: isDone ? 0.5 : 1,
                        cursor: "pointer",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigateCollection?.(todo.collection_id);
                    }}
                    title={`Go to ${getCollectionName(todo.collection_id)}`}>
                    {getCollectionName(todo.collection_id)}
                </span>
            )}

            {/* Actions */}
            <div className="todo-actions" style={S.todoActions}>
                {isArchived ? (
                    <>
                        <button className="action-btn restore-btn" style={S.actionBtn} onClick={() => onRestore(todo.id)} title="Restore">
                            <RestoreIcon />
                        </button>
                        <button className="action-btn del-btn" style={S.actionBtn} onClick={() => onDeleteForever(todo.id)} title="Delete forever">
                            <TrashIcon />
                        </button>
                    </>
                ) : (
                    <>
                        <button className="action-btn archive-btn" style={S.actionBtn} onClick={() => onArchive(todo.id)} title="Archive">
                            <ArchiveIcon />
                        </button>
                        <button className="action-btn del-btn" style={S.actionBtn} onClick={() => onDelete(todo.id)} title="Delete">
                            <TrashIcon />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default TodoItem;
