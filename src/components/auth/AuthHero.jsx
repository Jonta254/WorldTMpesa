import { useAppSettings } from "../../hooks/useAppSettings";

function AuthHero() {
  const settings = useAppSettings();

  return (
    <section className="hero-card hero-card-featured stack">
      <div className="hero-topline">
        <span className="brand-kicker">TMpesa</span>
        <span className="live-badge">Live rates</span>
      </div>
      <div>
        <h1 className="brand-title">Exchange WLD, USDC and KES with M-Pesa settlement.</h1>
        <p className="brand-copy">
          View the current exchange rate, place a sell or buy order, then complete payment through
          World App or M-Pesa. Every order is manually reviewed before completion.
        </p>
      </div>

      <div className="rate-board">
        <div className="rate-card primary-rate">
          <span>WLD rate</span>
          <strong>KES {settings.ratesKes.WLD.toLocaleString()}</strong>
          <small>per 1 WLD</small>
        </div>
        <div className="rate-card">
          <span>USDC rate</span>
          <strong>KES {settings.ratesKes.USDC.toLocaleString()}</strong>
          <small>per 1 USDC</small>
        </div>
      </div>

      <div className="fee-note">
        <div>
          <strong>Fees excluded from the displayed rate</strong>
          <p>
            Final settlement may vary by amount because M-Pesa charges, network fees, or admin
            adjustments are handled during manual confirmation.
          </p>
        </div>
        <span>Manual review</span>
      </div>

      <div className="trust-grid">
        <div>
          <span>Settlement</span>
          <strong>M-Pesa</strong>
        </div>
        <div>
          <span>Wallet</span>
          <strong>World App</strong>
        </div>
        <div>
          <span>Support</span>
          <strong>Gmail help</strong>
        </div>
      </div>
    </section>
  );
}

export default AuthHero;
