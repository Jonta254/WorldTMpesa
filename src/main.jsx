import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import App from "./App";
import AppErrorBoundary from "./components/layout/AppErrorBoundary";
import "./styles.css";
import { initializeOrders, initializeSettings, initializeUsers } from "./services";

initializeUsers();
initializeOrders();
initializeSettings();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <MiniKitProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MiniKitProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
