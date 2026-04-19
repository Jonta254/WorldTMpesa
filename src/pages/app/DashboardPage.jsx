import { Link } from "react-router-dom";
import { APP_CONFIG, getCurrentUser, getOrdersForCurrentUser, getWorldAppContext } from "../../services";
import { useExchangeRates } from "../../hooks/useExchangeRate";

function DashboardPage() {
  const user = getCurrentUser();
  const worldApp = getWorldAppContext();
  const exchangeRates = useExchangeRates();
  const orders = getOrdersForCurrentUser();
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const paidOrders = orders.filter((order) => order.status === "paid").length;
  const completedOrders = orders.filter((order) => order.status === "completed").length;

  return (
    <div className="stack">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="stack">
            <span className="brand-kicker">Inside World App</span>
            <div>
              <h2 className="brand-title">{APP_CONFIG.appName} for WLD, USDT and M-Pesa.</h2>
              <p className="brand-copy">
                Welcome {user?.fullName}. This mini app keeps the exchange flow lightweight inside
                World App while the admin confirms each order manually.
              </p>
            </div>
            <div className="amount-line">
              <span>Current admin rates</span>
              <strong>WLD: KES {exchangeRates.WLD} | USDT: KES {exchangeRates.USDT}</strong>
            </div>
            <div className="info-grid">
              <div className="info-box">
                <strong>Session</strong>
                <code>{user?.authMethod === "world-app" ? "Wallet-auth prototype" : "Local browser login"}</code>
              </div>
              <div className="info-box">
                <strong>Launch Context</strong>
                <code>{worldApp.location || "browser"}</code>
              </div>
            </div>
          </div>

          <div className="summary-card stack">
            <h3>Quick Summary</h3>
            <div className="stats-grid">
              <div className="mini-stat">
                Pending
                <strong>{pendingOrders}</strong>
              </div>
              <div className="mini-stat">
                Paid
                <strong>{paidOrders}</strong>
              </div>
              <div className="mini-stat">
                Completed
                <strong>{completedOrders}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="action-grid">
        <article className="action-card stack">
          <span className="tag">Sell WLD</span>
          <h3>Crypto to cash</h3>
          <p className="muted">
            Enter the amount of WLD, get the KES value instantly, send crypto to the wallet, and
            submit your transaction hash.
          </p>
          <Link to="/sell" className="button">
            Sell WLD
          </Link>
        </article>

        <article className="action-card stack">
          <span className="tag">Buy WLD</span>
          <h3>Cash to crypto</h3>
          <p className="muted">
            Enter the amount you want to buy, confirm the KES amount, pay via M-Pesa, and submit
            your transaction code.
          </p>
          <Link to="/buy" className="button">
            Buy WLD
          </Link>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
