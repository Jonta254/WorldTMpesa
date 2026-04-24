import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import {
  APP_CONFIG,
  buildWorldAppDeeplink,
  getCurrentUser,
  getOrdersForCurrentUser,
  getWorldAppContext,
  openSupportEmail,
  updateCurrentUserProfile,
} from "../../services";
import { useExchangeRates } from "../../hooks/useExchangeRate";

function formatLaunchSource(location) {
  if (!location) {
    return "Browser";
  }

  if (typeof location === "string") {
    return location;
  }

  if (typeof location === "object") {
    return location.open_origin || location.source || "World App";
  }

  return "World App";
}

function DashboardPage() {
  const initialUser = getCurrentUser();
  const [user, setUser] = useState(initialUser);
  const [profilePhone, setProfilePhone] = useState(initialUser?.mpesaPhoneNumber || initialUser?.phone || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const worldApp = getWorldAppContext();
  const exchangeRates = useExchangeRates();
  const settings = useAppSettings();
  const orders = getOrdersForCurrentUser();
  const worldAppLink = buildWorldAppDeeplink("/");
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const paidOrders = orders.filter((order) => order.status === "paid").length;
  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const launchSource = formatLaunchSource(worldApp.location);
  const hasWorldSession = user?.authMethod === "world-app" || Boolean(user?.username);

  const handleProfileSave = () => {
    setProfileError("");
    setProfileMessage("");

    if (!profilePhone.trim()) {
      setProfileError("Enter the M-Pesa phone number you want payouts sent to.");
      return;
    }

    const nextUser = updateCurrentUserProfile({ mpesaPhoneNumber: profilePhone.trim() });
    setUser(nextUser);
    setProfileMessage("Payout phone saved. Sell orders will use this number.");
  };

  return (
    <div className="stack">
      {!user?.isAdmin && !user?.mpesaPhoneNumber ? (
        <section className="panel stack">
          <span className="brand-kicker">Payout Setup</span>
          <div>
            <h3>Add your M-Pesa payout number</h3>
            <p className="muted">
              TMpesa saves this number for sell orders. When you sell WLD or USDC, the admin uses
              it to send your KES payout after confirming your World payment.
            </p>
          </div>
          {profileError ? <div className="error">{profileError}</div> : null}
          {profileMessage ? <div className="notice">{profileMessage}</div> : null}
          <div className="field">
            <label htmlFor="profileMpesaPhone">M-Pesa Phone Number</label>
            <input
              id="profileMpesaPhone"
              value={profilePhone}
              onChange={(event) => setProfilePhone(event.target.value)}
              placeholder="0712345678"
            />
          </div>
          <button type="button" className="button" onClick={handleProfileSave}>
            Save Payout Number
          </button>
        </section>
      ) : null}

      <section className="hero-card">
        <div className="hero-grid">
          <div className="stack">
            <span className="brand-kicker">{hasWorldSession ? "World account active" : "Inside World App"}</span>
            <div>
              <h2 className="brand-title">{APP_CONFIG.appName} exchange desk.</h2>
              <p className="brand-copy">
                Welcome {user?.fullName}. Start by keeping your M-Pesa payout number updated, then
                choose whether you want to sell crypto for KES or buy crypto with M-Pesa.
              </p>
            </div>
            <div className="amount-line">
              <span>Current rates</span>
              <strong>WLD: KES {exchangeRates.WLD} | USDC: KES {exchangeRates.USDC}</strong>
            </div>
            <div className="info-grid">
              <div className="info-box">
                <strong>Sell receiver wallet</strong>
                <code>{settings.sellWalletAddress}</code>
              </div>
              <div className="info-box">
                <strong>Your payout number</strong>
                <code>{user?.mpesaPhoneNumber || "Not added yet"}</code>
              </div>
            </div>
            {!hasWorldSession && !worldApp.isInstalled && worldAppLink ? (
              <a href={worldAppLink} className="button-secondary">
                Open in World App
              </a>
            ) : null}
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
              <div className="mini-stat">
                Launch
                <strong>{launchSource}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gold-guide-card">
        <div className="gold-guide-head">
          <span className="gold-guide-badge">User guide</span>
          <span className="gold-guide-accent">Smooth steps</span>
        </div>
        <h3>Your TMpesa flow in brief</h3>
        <div className="gold-guide-list">
          <div>
            <strong>1. Keep your payout number ready</strong>
            <p>
              Add the M-Pesa number you want to receive KES on. TMpesa keeps it attached to your
              account for sell orders.
            </p>
          </div>
          <div>
            <strong>2. Sell from your World account</strong>
            <p>
              Enter the amount, confirm the order, then send WLD or USDC. Your World username stays
              linked to the order for review.
            </p>
          </div>
          <div>
            <strong>3. Buy with M-Pesa when needed</strong>
            <p>
              Enter the amount you want to buy, pay the shown till number, then mark the order as
              paid so the admin can complete delivery.
            </p>
          </div>
          <div>
            <strong>4. Track everything in Orders</strong>
            <p>
              Watch your status move from pending to paid to completed, and contact support if a
              settlement takes longer than expected.
            </p>
          </div>
        </div>
      </section>

      <section className="action-grid">
        <article className="action-card stack">
          <span className="tag">Sell WLD/USDC</span>
          <h3>Send crypto, receive KES</h3>
          <p className="muted">
            World Pay sends your asset to TMpesa. Admin then pays KES to your saved M-Pesa number.
          </p>
          <Link to="/sell" className="button">
            Sell Crypto
          </Link>
        </article>

        <article className="action-card stack">
          <span className="tag">Buy WLD/USDC</span>
          <h3>Pay M-Pesa, receive crypto</h3>
          <p className="muted">
            TMpesa records your World username or wallet, then shows the till and amount to pay.
          </p>
          <Link to="/buy" className="button">
            Buy Crypto
          </Link>
        </article>
      </section>

      <section className="support-footer">
        <div>
          <strong>Support</strong>
          <p>Questions or delayed payment? Contact TMpesa support by email.</p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() =>
            openSupportEmail({
              subject: "TMpesa support",
              body: "Hello TMpesa team,\n\nI need help with my account or order.",
            })
          }
        >
          Email Support
        </button>
      </section>
    </div>
  );
}

export default DashboardPage;
