import { useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "../services/orderService";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const data = await getAllOrders();
    setOrders(data);
  };

  useEffect(() => {
    load();
  }, []);

  const complete = async (id) => {
    await updateOrder(id, { status: "completed" });
    load();
  };

  return (
    <div className="container">
      <h2>🧑‍💼 Admin Panel</h2>

      {orders.map(o => (
        <div key={o.id} className="card">
          <p>{o.type} - {o.amount}</p>
          <p>{o.phone}</p>
          <p>Status: {o.status}</p>

          {o.status === "paid" && (
            <button onClick={() => complete(o.id)}>
              Mark Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
