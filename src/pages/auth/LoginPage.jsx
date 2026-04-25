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
  const [authStage, setAuthStage] = useState("idle");

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
    setAuthStage("wallet");
    setAuthStatus("Connecting your World wallet...");

    try {
      const profile = await connectWithWorldAppWallet();
      const existingUser = findUserByWalletAddress(profile.walletAddress);
      const isFirstAccess = !isUserAccessVerified(existingUser);

      setAuthStage("verify");
      setAuthStatus(
        isFirstAccess
          ? "Completing your first TMpesa human verification..."
          : "Running secure TMpesa access verification...",
      );
      const verification = await requestWorldVerification({
        action: APP_CONFIG.firstAccessVerificationAction,
        signal: isFirstAccess
          ? `first-access:${profile.walletAddress.toLowerCase()}`
          : `login-access:${profile.walletAddress.toLowerCase()}:${Date.now()}`,
        verificationLevel: "device",
      });

      setAuthStage("unlock");
      setAuthStatus("Unlocking your secure TMpesa session...");
      loginWithWorldApp(profile, {
        firstAccessVerified: true,
        firstAccessVerifiedAt:
          existingUser?.firstAccessVerifiedAt || new Date().toISOString(),
        firstAccessVerificationLevel:
          existingUser?.firstAccessVerificationLevel || verification.verificationLevel,
        lastLoginVerificationAt: new Date().toISOString(),
        lastLoginVerificationLevel: verification.verificationLevel,
      });

      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthStage("idle");
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
                Sign in with your World wallet and complete the secure TMpesa access check before
                you buy WLD or USDC with M-Pesa or sell and receive KES settlement.
              </p>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}
          {location.state?.requiresVerification ? (
            <div className="notice">
              Your World session is connected, but TMpesa still needs the secure access check to
              finish login.
            </div>
          ) : null}
          {authStatus ? <div className="notice">{authStatus}</div> : null}

          <div className="secure-access-card">
            <div className="secure-access-head">
              <span className="secure-access-badge">Secure access</span>
              <span className="secure-access-trust">World login protected</span>
            </div>
            <h3>Login with Wallet Auth and World verification</h3>
            <p className="muted">
              TMpesa uses Wallet Auth as the primary sign-in, then finishes login with a World human
              check before your session opens.
            </p>
            <div className="secure-step-list">
              <div className={authStage === "wallet" ? "active" : ""}>
                <strong>1. Wallet Auth</strong>
                <p>Confirm your World wallet and username.</p>
              </div>
              <div className={authStage === "verify" ? "active" : ""}>
                <strong>2. Human verification</strong>
                <p>Complete the World access check at login.</p>
              </div>
              <div className={authStage === "unlock" ? "active" : ""}>
                <strong>3. Session unlock</strong>
                <p>TMpesa opens after the secure check succeeds.</p>
              </div>
            </div>
          </div>

          <div className="stack auth-cta-block">
            <button
              type="button"
              className="button auth-connect-button"
              onClick={handleWorldAppLogin}
              disabled={!worldApp.isInstalled || worldLoading}
            >
              {worldLoading ? "Securing login..." : "Continue with World App"}
            </button>
            <div className="notice">
              {worldApp.isInstalled
                ? "World App detected. TMpesa will run Wallet Auth first and then complete verification before login opens."
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
                <strong>Verified login gate</strong>
                <p>World users pass through the TMpesa access check during login.</p>
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
