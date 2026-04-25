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
        <section className="auth-card stack auth-entry-card">
          <span className="brand-kicker">TMpesa</span>
          <div>
            <h2>Connect and start exchanging</h2>
            <p className="muted">
              Sign in with World App to place a sell or buy order. TMpesa will use your World
              username on each order and your saved M-Pesa details for settlement.
            </p>
          </div>

          <div className="auth-steps">
            <div>
              <strong>1. Connect your World account</strong>
              <p>Use wallet authentication so TMpesa can recognize your World username.</p>
            </div>
            <div>
              <strong>2. Place a buy or sell order</strong>
              <p>Choose the amount, review the current rate, and confirm the request.</p>
            </div>
            <div>
              <strong>3. Track completion in Orders</strong>
              <p>Every request moves from pending to paid to completed after manual confirmation.</p>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="stack">
            <button
              type="button"
              className="button"
              onClick={handleWorldAppLogin}
              disabled={!worldApp.isInstalled || worldLoading}
            >
              {worldLoading ? "Connecting wallet..." : "Continue with World App"}
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
