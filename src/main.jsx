import React from "react";
import { createRoot } from "react-dom/client";
import TodoApp from "./TodoApp";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TodoApp />
  </React.StrictMode>
);
