import { useAppSettings } from "../../hooks/useAppSettings";
import { useOrderFlow } from "../../hooks/useOrderFlow";
import { getCurrentUser, openSupportEmail, openWorldReportPage } from "../../services";

function BuyPage() {
  const settings = useAppSettings();
  const currentUser = getCurrentUser();
  const {
    asset,
    setAsset,
    cryptoAmount,
    setCryptoAmount,
    walletAddress,
    setWalletAddress,
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
  } = useOrderFlow("buy");

  return (
    <div className="content-grid">
      <section className="panel stack">
        <span className="brand-kicker">Buy WLD/USDC</span>
        <div>
          <h2>Pay with M-Pesa, receive crypto to your World account</h2>
          <p className="muted">
            TMpesa records your World username or wallet destination when you place the order. Pay
            the shown KES amount to the till, then submit your M-Pesa code for admin confirmation.
          </p>
          <p className="muted">Rate shown now: KES {exchangeRate} per {asset}. Fees are excluded.</p>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {step === 1 ? (
          <div className="stack">
            {currentUser?.walletAddress || currentUser?.username ? (
              <div className="info-box receipt-card">
                <strong>World destination detected</strong>
                <span>Admin will use this to send your crypto after M-Pesa confirmation.</span>
                {currentUser?.username ? <code>Username: @{currentUser.username}</code> : null}
                {currentUser?.walletAddress ? <code>Wallet: {currentUser.walletAddress}</code> : null}
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="buyAsset">Asset</label>
              <select id="buyAsset" value={asset} onChange={(event) => setAsset(event.target.value)}>
                {supportedAssets.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="buyAmount">Amount of {asset}</label>
              <input
                id="buyAmount"
                type="number"
                min="0"
                step="0.01"
                value={cryptoAmount}
                onChange={(event) => setCryptoAmount(event.target.value)}
                placeholder="25"
              />
            </div>

            {!currentUser?.walletAddress && !currentUser?.username ? (
              <div className="field">
                <label htmlFor="walletAddress">Destination wallet address</label>
                <input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(event) => setWalletAddress(event.target.value)}
                  placeholder="0xYourWalletAddress"
                />
                <span className="muted field-hint">
                  Open with World App to detect this automatically.
                </span>
              </div>
            ) : null}

            <div className="amount-line">
              <span>Amount to pay</span>
              <strong>KES {kesAmount.toLocaleString()}</strong>
            </div>

            <button type="button" className="button" onClick={placeOrder}>
              Create Buy Order
            </button>
          </div>
        ) : null}

        {step >= 2 && currentOrder ? (
          <div className="stack">
            <div className="payment-card">
              <span>Pay to till</span>
              <strong>{settings.mpesaPaybillNumber}</strong>
              <p>KES {currentOrder.kesAmount.toLocaleString()}</p>
            </div>

            <div className="info-box receipt-card">
              <strong>Crypto delivery destination</strong>
              <span>Admin will send after your M-Pesa code is confirmed.</span>
              {currentOrder.destinationUsername ? <code>@{currentOrder.destinationUsername}</code> : null}
              {currentOrder.walletAddress ? <code>{currentOrder.walletAddress}</code> : null}
            </div>

            <div className="notice">
              Copy the till number, leave World App to pay in M-Pesa, then return and submit your
              M-Pesa transaction code here or from the Orders page.
            </div>

            <div className="sr-only">
              <code>Till Number: {settings.mpesaPaybillNumber}</code>
              <code>Amount: KES {currentOrder.kesAmount.toLocaleString()}</code>
            </div>

            {step === 2 ? (
              <>
                <div className="field">
                  <label htmlFor="mpesaCode">M-Pesa Transaction Code</label>
                  <input
                    id="mpesaCode"
                    value={paymentReference}
                    onChange={(event) => setPaymentReference(event.target.value)}
                    placeholder="QWE123XYZ"
                  />
                </div>

                <button type="button" className="button" onClick={() => markAsPaid(paymentReference)}>
                  I HAVE PAID
                </button>
              </>
            ) : null}

            {step === 3 ? (
              <div className="success-panel">
                <strong>M-Pesa payment submitted</strong>
                <p>
                  The admin will verify your code and send {currentOrder.asset} to your recorded
                  World destination.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <aside className="summary-card stack">
        <h3>Buy Flow</h3>
        <div className="flow-list">
          <div><span>1</span><p>Choose WLD/USDC and enter the amount.</p></div>
          <div><span>2</span><p>TMpesa records your World username or wallet.</p></div>
          <div><span>3</span><p>Pay the KES amount to till {settings.mpesaPaybillNumber}.</p></div>
          <div><span>4</span><p>Submit your M-Pesa code for admin delivery.</p></div>
        </div>
        <div className="support-card">
          <strong>Need help?</strong>
          <p className="muted">
            Open Gmail support for buy questions, or visit World.org for World App/account help.
          </p>
          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              openSupportEmail({
                subject: "TMpesa buy support",
                body: "Hello TMpesa team,\n\nI need help with my buy order.",
              })
            }
          >
            Support
          </button>
          <button
            type="button"
            className="button-ghost"
            onClick={() =>
              openSupportEmail({
                subject: "TMpesa delayed buy order",
                body: "Hello TMpesa team,\n\nMy buy order is delayed. Please assist.",
              })
            }
          >
            Payment Delay
          </button>
          <button type="button" className="button-ghost" onClick={openWorldReportPage}>
            Open World.org
          </button>
        </div>
      </aside>
    </div>
  );
}

export default BuyPage;
