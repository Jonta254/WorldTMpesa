import { useState } from "react";
import { Navigate } from "react-router-dom";
import OrderCard from "../../components/orders/OrderCard";
import { getAllOrders, getCurrentUser, updateOrder } from "../../services";

function AdminPage() {
  const user = getCurrentUser();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [orders, setOrders] = useState(getAllOrders());

  const handleStatusUpdate = (orderId, status) => {
    updateOrder(orderId, { status });
    setOrders(getAllOrders());
  };

  return (
    <div className="stack">
      <section className="panel stack">
        <span className="brand-kicker">Admin Simulation</span>
        <div>
          <h2>Manual confirmation panel</h2>
          <p className="muted">
            This page simulates admin review with localStorage only. Use it to advance order
            statuses from pending to paid or completed while the backend is still pending.
          </p>
        </div>
      </section>

      {orders.length ? (
        <section className="order-grid">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order}>
              <div className="action-grid">
                {order.status !== "paid" ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => handleStatusUpdate(order.id, "paid")}
                  >
                    Mark Paid
                  </button>
                ) : null}
                {order.status !== "completed" ? (
                  <button
                    type="button"
                    className="button"
                    onClick={() => handleStatusUpdate(order.id, "completed")}
                  >
                    Mark Completed
                  </button>
                ) : null}
              </div>
            </OrderCard>
          ))}
        </section>
      ) : (
        <section className="panel empty-state">
          <h3>No orders to review</h3>
        </section>
      )}
    </div>
  );
}

export default AdminPage;
