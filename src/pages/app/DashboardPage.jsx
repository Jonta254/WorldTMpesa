import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import {
  APP_CONFIG,
  buildWorldAppDeeplink,
  getCurrentUser,
  getOrdersForCurrentUser,
  getWorldAppContext,
  updateCurrentUserProfile,
} from "../../services";
import { useExchangeRates } from "../../hooks/useExchangeRate";

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
              TMpesa uses this phone number when you sell WLD so the admin knows exactly where to
              send your KES payout.
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
            <span className="brand-kicker">Inside World App</span>
            <div>
              <h2 className="brand-title">{APP_CONFIG.appName} for WLD, USDC and M-Pesa.</h2>
              <p className="brand-copy">
                Welcome {user?.fullName}. TMpesa keeps exchange flows lightweight inside the wallet,
                while your admin still reviews every payout manually.
              </p>
            </div>
            <div className="amount-line">
              <span>Current admin rates</span>
              <strong>WLD: KES {exchangeRates.WLD} | USDC: KES {exchangeRates.USDC}</strong>
            </div>
            <div className="info-grid">
              <div className="info-box">
                <strong>Sell Receiver</strong>
                <code>{settings.sellWalletAddress}</code>
              </div>
              <div className="info-box">
                <strong>Your payout number</strong>
                <code>{user?.mpesaPhoneNumber || "Not added yet"}</code>
              </div>
            </div>
            {!worldApp.isInstalled && worldAppLink ? (
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
                <strong>{worldApp.location || "browser"}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="action-grid">
        <article className="action-card stack">
          <span className="tag">Sell WLD/USDC</span>
          <h3>Crypto to cash</h3>
          <p className="muted">
            In World App, users can open the native payment sheet and send without leaving
            TMpesa.
          </p>
          <Link to="/sell" className="button">
            Sell Crypto
          </Link>
        </article>

        <article className="action-card stack">
          <span className="tag">Buy WLD/USDC</span>
          <h3>Cash to crypto</h3>
          <p className="muted">
            The buy flow stays manual: confirm the KES amount, pay via M-Pesa, and submit your
            transaction code.
          </p>
          <Link to="/buy" className="button">
            Buy Crypto
          </Link>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
