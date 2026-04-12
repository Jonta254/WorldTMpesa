import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ CORRECT PATH
// import "./styles/global.css"; // ❌ TEMP DISABLED

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
