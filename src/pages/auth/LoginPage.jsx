import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import {
  buildWorldAppDeeplink,
  checkWorldHumanVerification,
  connectWithWorldAppWallet,
  findUserByUsername,
  getCurrentUser,
  findUserByWalletAddress,
  getWorldAppContext,
  isUserAccessVerified,
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
  const [authStatus, setAuthStatus] = useState("");
  const [authStage, setAuthStage] = useState("idle");
  const targetPath = location.state?.from?.pathname || "/";

  const finalizeSessionRedirect = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      throw new Error("TMpesa could not save your login session. Please try again.");
    }

    if (!currentUser.isAdmin && !isUserAccessVerified(currentUser)) {
      navigate("/", {
        replace: true,
        state: {
          requiresVerification: true,
          from: location.state?.from || { pathname: targetPath },
        },
      });
      return;
    }

    navigate(targetPath, { replace: true });

    window.setTimeout(() => {
      const latestUser = getCurrentUser();

      if (latestUser && window.location.pathname === "/login") {
        window.location.replace(
          !latestUser.isAdmin && !isUserAccessVerified(latestUser) ? "/" : targetPath,
        );
      }
    }, 120);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser) {
      navigate(
        !currentUser.isAdmin && !isUserAccessVerified(currentUser) ? "/" : targetPath,
        { replace: true },
      );
    }
  }, [navigate, targetPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      loginUser(form);
      finalizeSessionRedirect();
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
      const existingUser =
        findUserByWalletAddress(profile.walletAddress) || findUserByUsername(profile.username);
      const needsFirstAccessVerification = !isUserAccessVerified(existingUser);
      const isAlreadyHumanVerified = needsFirstAccessVerification
        ? await checkWorldHumanVerification(profile.walletAddress)
        : false;

      setAuthStage("unlock");
      setAuthStatus(
        needsFirstAccessVerification && !isAlreadyHumanVerified
          ? "Opening TMpesa and preparing your first-access verification..."
          : "Opening your TMpesa session...",
      );
      loginWithWorldApp(profile, {
        firstAccessVerified: existingUser?.firstAccessVerified || isAlreadyHumanVerified,
        firstAccessVerifiedAt:
          existingUser?.firstAccessVerifiedAt ||
          (isAlreadyHumanVerified ? new Date().toISOString() : null),
        firstAccessVerificationLevel:
          existingUser?.firstAccessVerificationLevel || (isAlreadyHumanVerified ? "address-book" : ""),
      });

      finalizeSessionRedirect();
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
                Sign in with your World wallet, then complete the required first-access World check
                the first time you enter TMpesa.
              </p>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}
          {location.state?.requiresVerification ? (
            <div className="notice">
              Your World session is connected, but TMpesa still needs the first-access World check
              before your session can open.
            </div>
          ) : null}
          {authStatus ? <div className="notice">{authStatus}</div> : null}

          <div className="secure-access-card">
            <div className="secure-access-head">
              <span className="secure-access-badge">Secure access</span>
              <span className="secure-access-trust">World login protected</span>
            </div>
            <h3>Login with Wallet Auth</h3>
            <p className="muted">
              TMpesa uses Wallet Auth as the primary sign-in. If this is your first time, TMpesa
              will open and then ask you to complete one World verification before trading.
            </p>
            <div className="secure-step-list">
              <div className={authStage === "wallet" ? "active" : ""}>
                <strong>1. Wallet Auth</strong>
                <p>Confirm your World wallet and username.</p>
              </div>
              <div className={authStage === "unlock" ? "active" : ""}>
                <strong>2. App unlock</strong>
                <p>TMpesa opens immediately after Wallet Auth succeeds.</p>
              </div>
              <div>
                <strong>3. First-access verification</strong>
                <p>New users complete one World human check inside TMpesa before trading.</p>
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
                ? "World App detected. TMpesa will run Wallet Auth first, then ask new users for a one-time first-access verification inside the app."
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
                <strong>Verified first access</strong>
                <p>New World users complete a one-time World check before TMpesa unlocks.</p>
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
