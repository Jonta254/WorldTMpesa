import { useEffect, useState } from "react";
import { getAllOrders } from "../services/orderService";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getAllOrders();
      setOrders(data);
    };
    load();
  }, []);

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {orders.map(o => (
        <div key={o.id} className="card">
          <p>{o.type} - {o.amount}</p>
          <p>{o.phone}</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </div>
  );
}
