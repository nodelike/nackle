import { memo } from "react";
import { S } from "../styles";
import { ArchiveIcon, TrashIcon, RestoreIcon } from "./Icons";
import TodoItem from "./TodoItem";

const ArchiveView = memo(function ArchiveView({
  archived,
  archivedCollections,
  archiveCount,
  onRestoreTodo,
  onDeleteForever,
  onRestoreCollection,
  onDeleteCollection,
  onNavigateCollection,
  getCollectionName,
  getCollectionColor,
}) {
  return (
    <div style={S.todoList}>
      {archiveCount === 0 && (
        <div style={S.empty}>
          <span style={{ color: "var(--border)" }}>
            <ArchiveIcon size={36} strokeWidth={1.5} />
          </span>
          <div style={{ ...S.emptyText, marginTop: 12 }}>Archive is empty</div>
          <div style={S.emptyHint}>Archived tasks and collections appear here</div>
        </div>
      )}

      {/* Archived collections */}
      {archivedCollections.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={S.sectionLabel}>Collections</div>
          {archivedCollections.map((col) => (
            <div key={col.id} className="todo-item" style={{ ...S.todoItem, opacity: 0.6 }}>
              <span style={{ ...S.collectionIcon, color: col.color }}>{col.icon}</span>
              <span style={{ ...S.todoText, color: "var(--fg-muted)", cursor: "default" }}>{col.name}</span>
              <button
                className="action-btn restore-btn"
                style={S.actionBtn}
                onClick={() => onRestoreCollection(col.id)}
                title="Restore collection"
              >
                <RestoreIcon />
              </button>
              <button
                className="action-btn del-btn"
                style={S.actionBtn}
                onClick={() => onDeleteCollection(col.id)}
                title="Delete forever"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Archived todos — no priority pills (position is meaningless here) */}
      {archived.length > 0 && (
        <div>
          {archivedCollections.length > 0 && <div style={S.sectionLabel}>Tasks</div>}
          {archived.map((todo, i) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              index={i}
              isDone={false}
              isArchived={true}
              showCollection={true}
              canDrag={false}
              onToggle={() => {}}
              onDelete={() => {}}
              onArchive={() => {}}
              onRestore={onRestoreTodo}
              onDeleteForever={onDeleteForever}
              onUpdate={() => {}}
              onNavigateCollection={onNavigateCollection}
              getCollectionName={getCollectionName}
              getCollectionColor={getCollectionColor}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ArchiveView;
