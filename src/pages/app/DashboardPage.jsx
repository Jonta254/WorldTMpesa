import { Link } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import { APP_CONFIG, getCurrentUser, getOrdersForCurrentUser, getWorldAppContext } from "../../services";
import { useExchangeRates } from "../../hooks/useExchangeRate";

function DashboardPage() {
  const user = getCurrentUser();
  const worldApp = getWorldAppContext();
  const exchangeRates = useExchangeRates();
  const settings = useAppSettings();
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
                Welcome {user?.fullName}. TMpesa keeps exchange flows lightweight inside the wallet,
                while your admin still reviews every payout manually.
              </p>
            </div>
            <div className="amount-line">
              <span>Current admin rates</span>
              <strong>WLD: KES {exchangeRates.WLD} | USDT: KES {exchangeRates.USDT}</strong>
            </div>
            <div className="info-grid">
              <div className="info-box">
                <strong>Sell Receiver</strong>
                <code>{settings.sellWalletAddress}</code>
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
            In World App, WLD users can open the native payment sheet and send without leaving
            TMpesa.
          </p>
          <Link to="/sell" className="button">
            Sell WLD
          </Link>
        </article>

        <article className="action-card stack">
          <span className="tag">Buy WLD</span>
          <h3>Cash to crypto</h3>
          <p className="muted">
            The buy flow stays manual: confirm the KES amount, pay via M-Pesa, and submit your
            transaction code.
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
