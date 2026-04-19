import { useState } from "react";
import { Navigate } from "react-router-dom";
import OrderCard from "../../components/orders/OrderCard";
import { getAllOrders, getCurrentUser, getExchangeRates, updateExchangeRates, updateOrder } from "../../services";
import { useExchangeRates } from "../../hooks/useExchangeRate";

function AdminPage() {
  const user = getCurrentUser();
  const liveRates = useExchangeRates();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [orders, setOrders] = useState(getAllOrders());
  const [rateInputs, setRateInputs] = useState(() =>
    Object.entries(getExchangeRates()).reduce((accumulator, [asset, rate]) => {
      accumulator[asset] = String(rate);
      return accumulator;
    }, {}),
  );
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
      const nextRates = updateExchangeRates(rateInputs);
      setRateInputs(
        Object.entries(nextRates).reduce((accumulator, [asset, rate]) => {
          accumulator[asset] = String(rate);
          return accumulator;
        }, {}),
      );
      setRateMessage("Exchange rates updated successfully.");
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
              Update the current KES rates for WLD and USDT here. Buy and sell calculations will
              use the selected asset rate immediately.
            </p>
          </div>
          <div className="stack">
            <div className="tag">WLD: KES {liveRates.WLD}</div>
            <div className="tag">USDT: KES {liveRates.USDT}</div>
          </div>
        </div>

        {rateError ? <div className="error">{rateError}</div> : null}
        {rateMessage ? <div className="notice">{rateMessage}</div> : null}

        <div className="info-grid">
          <div className="field">
            <label htmlFor="rateWld">KES per WLD</label>
            <input
              id="rateWld"
              type="number"
              min="1"
              step="0.01"
              value={rateInputs.WLD || ""}
              onChange={(event) =>
                setRateInputs((current) => ({ ...current, WLD: event.target.value }))
              }
              placeholder="120"
            />
          </div>

          <div className="field">
            <label htmlFor="rateUsdt">KES per USDT</label>
            <input
              id="rateUsdt"
              type="number"
              min="1"
              step="0.01"
              value={rateInputs.USDT || ""}
              onChange={(event) =>
                setRateInputs((current) => ({ ...current, USDT: event.target.value }))
              }
              placeholder="128"
            />
          </div>
        </div>

        <button type="button" className="button" onClick={handleRateSave}>
          Save Rates
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
