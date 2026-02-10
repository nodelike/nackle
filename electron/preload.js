const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("db", {
  // Collections
  getCollections: () => ipcRenderer.invoke("db:getCollections"),
  getArchivedCollections: () => ipcRenderer.invoke("db:getArchivedCollections"),
  addCollection: (data) => ipcRenderer.invoke("db:addCollection", data),
  updateCollection: (data) => ipcRenderer.invoke("db:updateCollection", data),
  archiveCollection: (id) => ipcRenderer.invoke("db:archiveCollection", id),
  restoreCollection: (id) => ipcRenderer.invoke("db:restoreCollection", id),
  deleteCollection: (id) => ipcRenderer.invoke("db:deleteCollection", id),

  // Todos
  getTodos: () => ipcRenderer.invoke("db:getTodos"),
  addTodo: (data) => ipcRenderer.invoke("db:addTodo", data),
  toggleTodo: (id) => ipcRenderer.invoke("db:toggleTodo", id),
  updateTodo: (data) => ipcRenderer.invoke("db:updateTodo", data),
  setPriority: (data) => ipcRenderer.invoke("db:setPriority", data),
  deleteTodo: (id) => ipcRenderer.invoke("db:deleteTodo", id),
  moveTodo: (data) => ipcRenderer.invoke("db:moveTodo", data),
  reorderTodos: (updates) => ipcRenderer.invoke("db:reorderTodos", updates),
  clearCompleted: (collectionId) => ipcRenderer.invoke("db:clearCompleted", collectionId),

  // Archive
  getArchived: () => ipcRenderer.invoke("db:getArchived"),
  archiveTodo: (id) => ipcRenderer.invoke("db:archiveTodo", id),
  restoreTodo: (id) => ipcRenderer.invoke("db:restoreTodo", id),
  deleteForever: (id) => ipcRenderer.invoke("db:deleteForever", id),
  emptyArchive: () => ipcRenderer.invoke("db:emptyArchive"),

  // App
  getVersion: () => ipcRenderer.invoke("app:getVersion"),

  // Settings
  getSettings: () => ipcRenderer.invoke("app:getSettings"),
  saveSetting: (data) => ipcRenderer.invoke("app:saveSetting", data),
  wipeAllData: () => ipcRenderer.invoke("app:wipeAllData"),
  setDockIcon: (accentColor) => ipcRenderer.invoke("app:setDockIcon", accentColor),
  onSettingsUpdated: (callback) => {
    const handler = (_, settings) => callback(settings);
    ipcRenderer.on("settings:updated", handler);
    return () => ipcRenderer.removeListener("settings:updated", handler);
  },
});
