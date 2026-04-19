import { useState } from "react";
import { Navigate } from "react-router-dom";
import OrderCard from "../../components/orders/OrderCard";
import { getAllOrders, getCurrentUser, getExchangeRate, updateExchangeRate, updateOrder } from "../../services";
import { useExchangeRate } from "../../hooks/useExchangeRate";

function AdminPage() {
  const user = getCurrentUser();
  const liveRate = useExchangeRate();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [orders, setOrders] = useState(getAllOrders());
  const [rateInput, setRateInput] = useState(String(getExchangeRate()));
  const [rateMessage, setRateMessage] = useState("");
  const [rateError, setRateError] = useState("");

  const handleStatusUpdate = (orderId, status) => {
    updateOrder(orderId, { status });
    setOrders(getAllOrders());
  };

  const handleRateSave = () => {
    setRateError("");
    setRateMessage("");

    try {
      const nextRate = updateExchangeRate(rateInput);
      setRateInput(String(nextRate));
      setRateMessage(`Exchange rate updated to KES ${nextRate} per WLD.`);
    } catch (error) {
      setRateError(error.message);
    }
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

      <section className="panel stack">
        <div className="split">
          <div>
            <h3>Exchange Rate Control</h3>
            <p className="muted">
              Update the current WLD to KES rate here. Buy and sell calculations will use this
              value immediately.
            </p>
          </div>
          <div className="tag">Live rate: KES {liveRate}</div>
        </div>

        {rateError ? <div className="error">{rateError}</div> : null}
        {rateMessage ? <div className="notice">{rateMessage}</div> : null}

        <div className="field">
          <label htmlFor="exchangeRate">KES per WLD</label>
          <input
            id="exchangeRate"
            type="number"
            min="1"
            step="0.01"
            value={rateInput}
            onChange={(event) => setRateInput(event.target.value)}
            placeholder="120"
          />
        </div>

        <button type="button" className="button" onClick={handleRateSave}>
          Save Exchange Rate
        </button>
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
