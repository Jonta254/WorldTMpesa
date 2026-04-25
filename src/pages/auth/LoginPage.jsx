import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import {
  buildWorldAppDeeplink,
  connectWithWorldAppWallet,
  getWorldAppContext,
  loginUser,
  loginWithWorldApp,
} from "../../services";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useAppSettings();
  const worldApp = getWorldAppContext();
  const worldAppLink = buildWorldAppDeeplink(location.state?.from?.pathname || "/");
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [worldLoading, setWorldLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      loginUser(form);
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWorldAppLogin = async () => {
    setError("");
    setWorldLoading(true);

    try {
      const profile = await connectWithWorldAppWallet();
      loginWithWorldApp(profile);
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorldLoading(false);
    }
  };

  return (
    <div className="page-bg">
      <div className="auth-layout auth-layout-single">
        <section className="auth-card stack auth-entry-card auth-splash-card">
          <div className="auth-splash-top">
            <div className="auth-logo-frame">
              <img src="/tmpesa-icon.svg" alt="TMpesa" className="auth-logo-mark" />
            </div>
            <div className="auth-splash-copy">
              <h2>TMpesa</h2>
              <p className="muted">
                Connect your World account to buy WLD or USDC with M-Pesa, or sell and receive KES
                settlement to your saved payout number.
              </p>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="stack auth-cta-block">
            <button
              type="button"
              className="button auth-connect-button"
              onClick={handleWorldAppLogin}
              disabled={!worldApp.isInstalled || worldLoading}
            >
              {worldLoading ? "Connecting wallet..." : "Connect Wallet"}
            </button>
            <div className="notice">
              {worldApp.isInstalled
                ? "World App detected. Continue directly into TMpesa."
                : "Open TMpesa inside World App to continue with wallet authentication."}
            </div>
            {!worldApp.isInstalled && settings.worldAppId ? (
              <a href={worldAppLink} className="button-secondary">
                Open in World App
              </a>
            ) : null}
          </div>

          <div className="auth-feature-list">
            <div>
              <span className="auth-feature-icon auth-feature-blue">T</span>
              <div>
                <strong>Direct wallet sign-in</strong>
                <p>Use Wallet Auth so TMpesa can recognize your World username immediately.</p>
              </div>
            </div>
            <div>
              <span className="auth-feature-icon auth-feature-green">K</span>
              <div>
                <strong>Buy with KES, sell to M-Pesa</strong>
                <p>Place orders quickly and track each one from pending to completion.</p>
              </div>
            </div>
            <div>
              <span className="auth-feature-icon auth-feature-gold">S</span>
              <div>
                <strong>Manual review for safety</strong>
                <p>Rates are clear, settlement is reviewed, and support stays available by email.</p>
              </div>
            </div>
          </div>

          <details className="admin-access-panel">
            <summary>Admin access</summary>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="phone">Admin Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="0700000000"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Admin Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="button-secondary">
                Open Admin
              </button>
            </form>
          </details>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
