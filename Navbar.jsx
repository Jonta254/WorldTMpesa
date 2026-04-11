import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="nav">
      <Link to="/">Home</Link>
      <Link to="/sell">Sell</Link>
      <Link to="/buy">Buy</Link>
      <Link to="/orders">Orders</Link>
      <Link to="/profile">Profile</Link>
    </div>
  );
}
