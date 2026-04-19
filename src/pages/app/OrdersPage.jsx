import { Link } from "react-router-dom";
import OrderCard from "../../components/orders/OrderCard";
import { getCurrentUser, getOrdersForCurrentUser } from "../../services";

function OrdersPage() {
  const orders = getOrdersForCurrentUser();
  const user = getCurrentUser();

  return (
    <div className="stack">
      <section className="panel stack">
        <div className="split">
          <div>
            <span className="brand-kicker">Orders</span>
            <h2>Your activity</h2>
            <p className="muted">
              Track every buy and sell order here. New orders begin as pending, then move to paid
              once you submit proof, and completed after admin confirmation.
            </p>
          </div>
          {user?.isAdmin ? <Link to="/admin" className="button-secondary">Open Admin</Link> : null}
        </div>
      </section>

      {orders.length ? (
        <section className="order-grid">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      ) : (
        <section className="panel empty-state stack">
          <h3>No orders yet</h3>
          <p className="muted">Your buy and sell requests will appear here once you place one.</p>
          <div className="action-grid">
            <Link to="/sell" className="button">
              Start Sell Order
            </Link>
            <Link to="/buy" className="button-secondary">
              Start Buy Order
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default OrdersPage;
