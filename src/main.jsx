import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import App from "./App";
import "./styles.css";
import { initializeOrders, initializeUsers } from "./services";

initializeUsers();
initializeOrders();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MiniKitProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MiniKitProvider>
  </React.StrictMode>,
);
