import { Link } from "react-router-dom";
import RateBox from "../components/RateBox";

export default function Home() {
  return (
    <div className="container">
      <h1>🌍 WorldTMpesa</h1>
      <p className="sub">Bridge $WLD, USDC & KES instantly</p>

      <RateBox />

      <div className="grid">
        <Link className="card" to="/sell">💸 Sell WLD</Link>
        <Link className="card" to="/buy">🟢 Buy WLD</Link>
        <Link className="card" to="/orders">📜 Orders</Link>
        <Link className="card" to="/profile">👤 Profile</Link>
      </div>
    </div>
  );
}
