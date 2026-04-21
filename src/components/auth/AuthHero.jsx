function AuthHero() {
  return (
    <section className="hero-card stack">
      <span className="brand-kicker">TMpesa</span>
      <div>
        <h1 className="brand-title">Exchange WLD and KES with a clean TMpesa flow.</h1>
        <p className="brand-copy">
          TMpesa is a mobile-first exchange flow for WLD, USDC, KES, and M-Pesa. Sell-side World
          Pay can stay inside the mini app, while buy orders remain simple and manually confirmed.
        </p>
      </div>

      <div className="stats-grid">
        <div className="mini-stat">
          Admin-set rate
          <strong>Editable in dashboard</strong>
        </div>
        <div className="mini-stat">
          Wallet layer
          <strong>World App</strong>
        </div>
        <div className="mini-stat">
          Order mode
          <strong>Manual review</strong>
        </div>
      </div>
    </section>
  );
}

export default AuthHero;
