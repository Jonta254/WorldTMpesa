import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Sell from "../pages/Sell";
import Buy from "../pages/Buy";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import Login from "../auth/Login";
import Signup from "../auth/Signup";

import ProtectedRoute from "../auth/ProtectedRoute";
import Navbar from "../components/Navbar";

import Fallback from "../components/Fallback";
import NotFound from "../pages/NotFound";

import { initWorld } from "./world/initWorld";

export default function App() {

  useEffect(() => {
    initWorld();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* MAIN APP */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
        <Route path="/buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* SAFETY NET */}
        <Route path="/loading" element={<Fallback />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
