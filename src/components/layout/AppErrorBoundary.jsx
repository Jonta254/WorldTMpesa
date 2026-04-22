import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-bg">
          <section className="auth-layout">
            <div className="auth-card stack">
              <span className="brand-kicker">TMpesa</span>
              <h1 className="brand-title">Reload TMpesa</h1>
              <p className="muted">
                World App had trouble loading this session. Close and reopen TMpesa, or tap reload.
              </p>
              <button type="button" className="button" onClick={() => window.location.reload()}>
                Reload App
              </button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
