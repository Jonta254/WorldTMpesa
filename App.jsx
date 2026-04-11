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

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
        <Route path="/buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
