import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthHero from "../../components/auth/AuthHero";
import { signupUser } from "../../services";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      signupUser(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-bg">
      <div className="auth-layout content-grid">
        <AuthHero />
        <section className="auth-card stack">
          <div>
            <span className="brand-kicker">Get started</span>
            <h2>Create your account</h2>
            <p className="muted">
              This signup is only for browser preview mode. Inside World App, wallet auth is the
              preferred entry flow.
            </p>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                placeholder="0712345678"
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
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="button">
              Create Account
            </button>
          </form>

          <p className="muted">
            Already registered? <Link to="/login" className="text-link">Login instead</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default SignupPage;
