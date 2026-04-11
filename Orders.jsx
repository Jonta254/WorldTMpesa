import { useEffect, useState } from "react";
import { getUserOrders } from "../services/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const data = await getUserOrders(user.phone);
      setOrders(data);
    };

    load();
  }, []);

  return (
    <div className="container">
      <h2>📜 My Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="card">
          <p>Type: {o.type}</p>
          <p>Amount: {o.amount}</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </div>
  );
}
