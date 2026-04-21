import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthHero from "../../components/auth/AuthHero";
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
  const worldApp = useMemo(() => getWorldAppContext(), []);
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
      <div className="auth-layout content-grid">
        <AuthHero />
        <section className="auth-card stack">
          <div>
            <span className="brand-kicker">Welcome back</span>
            <h2>Enter through TMpesa or browser preview</h2>
            <p className="muted">
              Use wallet auth inside World App for the real mini app flow, or use browser preview
              only for testing the interface.
            </p>
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
                ? "World App detected. You can start with wallet authentication."
                : "Open this app inside World App to use wallet authentication. Browser preview stays available below."}
            </div>
            {!worldApp.isInstalled && settings.worldAppId ? (
              <a href={worldAppLink} className="button-secondary">
                Open in World App
              </a>
            ) : null}
          </div>

          <div className="divider-label">Browser preview</div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
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
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="button">
              Login
            </button>
          </form>

          <div className="notice">
            Admin demo login: <strong>0700000000</strong> / <strong>admin123</strong>
          </div>

          <p className="muted">
            Need a local preview account? <Link to="/signup" className="text-link">Create one</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
