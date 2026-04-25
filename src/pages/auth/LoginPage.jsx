import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import {
  APP_CONFIG,
  buildWorldAppDeeplink,
  connectWithWorldAppWallet,
  findUserByWalletAddress,
  getWorldAppContext,
  isUserAccessVerified,
  loginUser,
  loginWithWorldApp,
  requestWorldVerification,
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
  const [authStatus, setAuthStatus] = useState("");

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
    setAuthStatus("Connecting your World wallet...");

    try {
      const profile = await connectWithWorldAppWallet();
      const existingUser = findUserByWalletAddress(profile.walletAddress);

      if (!isUserAccessVerified(existingUser)) {
        setAuthStatus("Completing your one-time human check...");
        const verification = await requestWorldVerification({
          action: APP_CONFIG.firstAccessVerificationAction,
          signal: `first-access:${profile.walletAddress.toLowerCase()}`,
          verificationLevel: "device",
        });

        loginWithWorldApp(profile, {
          firstAccessVerified: true,
          firstAccessVerifiedAt: new Date().toISOString(),
          firstAccessVerificationLevel: verification.verificationLevel,
        });
      } else {
        loginWithWorldApp(profile);
      }

      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthStatus("");
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
                Connect your World account, complete the required first-time human check, then use
                TMpesa to buy WLD or USDC with M-Pesa or sell and receive KES settlement.
              </p>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}
          {location.state?.requiresVerification ? (
            <div className="notice">
              Your World session is connected, but TMpesa needs a one-time human check before first
              access.
            </div>
          ) : null}
          {authStatus ? <div className="notice">{authStatus}</div> : null}

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
                ? "World App detected. Wallet Auth is first, then TMpesa runs a one-time human check for first access."
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
                <strong>One-time verified access</strong>
                <p>New users complete a World human check the first time they open TMpesa.</p>
              </div>
            </div>
            <div>
              <span className="auth-feature-icon auth-feature-gold">S</span>
              <div>
                <strong>Safe trading flow</strong>
                <p>Place orders quickly, keep your M-Pesa payout number saved, and track review safely.</p>
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
