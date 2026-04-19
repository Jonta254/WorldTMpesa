function AuthHero() {
  return (
    <section className="hero-card stack">
      <span className="brand-kicker">World App Mini App</span>
      <div>
        <h1 className="brand-title">Exchange WLD and KES with a simple World App flow.</h1>
        <p className="brand-copy">
          TMpesa is a World App mini app prototype for simple manual exchange flows: place the
          order, follow the instructions, submit your payment reference, and let the admin confirm
          the transaction.
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
