import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Sell from "./Sell";
import Buy from "./Buy";
import Orders from "./Orders";
import Profile from "./Profile";
import Login from "./Login";
import Signup from "./Signup";

import Navbar from "./Navbar";
import Fallback from "./Fallback";
import NotFound from "./NotFound";

import { initWorld } from "./world/initWorld";

export default function App() {

  useEffect(() => {
    try {
      initWorld();
    } catch (e) {
      console.log("World init error:", e);
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* MAIN APP (TEMP NO PROTECTION) */}
        <Route path="/" element={<Home />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />

        {/* SAFETY */}
        <Route path="/loading" element={<Fallback />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
