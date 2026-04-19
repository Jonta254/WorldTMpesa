import { APP_CONFIG } from "../../config/appConfig";
import { useOrderFlow } from "../../hooks/useOrderFlow";

function SellPage() {
  const {
    asset,
    setAsset,
    cryptoAmount,
    setCryptoAmount,
    paymentReference,
    setPaymentReference,
    step,
    currentOrder,
    error,
    kesAmount,
    exchangeRate,
    placeOrder,
    markAsPaid,
    supportedAssets,
  } = useOrderFlow("sell");

  return (
    <div className="content-grid">
      <section className="panel stack">
        <span className="brand-kicker">Sell Flow</span>
        <div>
          <h2>Sell crypto for KES</h2>
          <p className="muted">
            This is a manual exchange flow. Once you send crypto and submit your transaction hash,
            the admin will review and complete your payout later.
          </p>
          <p className="muted">Current admin rate: KES {exchangeRate} per WLD.</p>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {step === 1 ? (
          <div className="stack">
            <div className="field">
              <label htmlFor="asset">Asset</label>
              <select id="asset" value={asset} onChange={(event) => setAsset(event.target.value)}>
                {supportedAssets.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="cryptoAmount">Amount of {asset}</label>
              <input
                id="cryptoAmount"
                type="number"
                min="0"
                step="0.01"
                value={cryptoAmount}
                onChange={(event) => setCryptoAmount(event.target.value)}
                placeholder="10"
              />
            </div>

            <div className="amount-line">
              <span>You will receive</span>
              <strong>KES {kesAmount.toLocaleString()}</strong>
            </div>

            <button type="button" className="button" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        ) : null}

        {step >= 2 && currentOrder ? (
          <div className="stack">
            <div className="highlight-box">
              <strong>Send your {currentOrder.asset} to this wallet address</strong>
              <code>{APP_CONFIG.sellWalletAddress}</code>
            </div>

            <div className="amount-line">
              <span>Order value</span>
              <strong>KES {currentOrder.kesAmount.toLocaleString()}</strong>
            </div>

            {step === 2 ? (
              <>
                <div className="field">
                  <label htmlFor="txRef">Transaction Hash (txRef)</label>
                  <input
                    id="txRef"
                    value={paymentReference}
                    onChange={(event) => setPaymentReference(event.target.value)}
                    placeholder="0x1234..."
                  />
                </div>

                <button type="button" className="button" onClick={() => markAsPaid(paymentReference)}>
                  I HAVE SENT
                </button>
              </>
            ) : null}

            {step === 3 ? (
              <div className="notice">
                Order marked as <strong>paid</strong>. The admin will confirm your transfer and mark
                it as completed once the payout is verified.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <aside className="summary-card stack">
        <h3>Sell Instructions</h3>
        <ul className="list-reset">
          <li>1. Enter the amount of WLD you want to sell.</li>
          <li>Use WLD or USDC depending on the asset selected.</li>
          <li>2. Confirm the KES value at the current admin rate.</li>
          <li>3. Send crypto to the displayed wallet address.</li>
          <li>4. Paste the transaction hash and mark the order as paid.</li>
        </ul>
      </aside>
    </div>
  );
}

export default SellPage;
