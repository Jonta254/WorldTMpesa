import { useAppSettings } from "../../hooks/useAppSettings";
import { useOrderFlow } from "../../hooks/useOrderFlow";
import { getCurrentUser, openSupportEmail } from "../../services";

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
        <span className="brand-kicker">Buy Flow</span>
        <div>
          <h2>Buy WLD using M-Pesa</h2>
          <p className="muted">
            Place your order, send the payment manually through M-Pesa, then share the transaction
            code so the admin can confirm and send your crypto.
          </p>
          <p className="muted">Current admin rate: KES {exchangeRate} per {asset}.</p>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {step === 1 ? (
          <div className="stack">
            {currentUser?.walletAddress || currentUser?.username ? (
              <div className="info-box">
                <strong>Detected World destination</strong>
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

            <div className="field">
              <label htmlFor="walletAddress">Wallet Address</label>
              <input
                id="walletAddress"
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value)}
                placeholder={currentUser?.walletAddress || "0xYourWalletAddress"}
              />
            </div>

            <div className="amount-line">
              <span>Amount to pay</span>
              <strong>KES {kesAmount.toLocaleString()}</strong>
            </div>

            <button type="button" className="button" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        ) : null}

        {step >= 2 && currentOrder ? (
          <div className="stack">
            <div className="info-box">
              <strong>M-Pesa payment instructions</strong>
              <code>Till Number: {settings.mpesaPaybillNumber}</code>
              <code>Business Name: {settings.mpesaTillName}</code>
              <code>Amount: KES {currentOrder.kesAmount.toLocaleString()}</code>
              {currentOrder.destinationUsername ? <code>Send WLD to: @{currentOrder.destinationUsername}</code> : null}
              {currentOrder.walletAddress ? <code>Destination wallet: {currentOrder.walletAddress}</code> : null}
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
              <div className="notice">
                Order marked as <strong>paid</strong>. The admin will verify your M-Pesa payment and
                send the crypto to your wallet after confirmation.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <aside className="summary-card stack">
        <h3>Buy Instructions</h3>
        <ul className="list-reset">
          <li>1. Choose the asset and amount you want to buy.</li>
          <li>2. Provide the destination wallet address.</li>
          <li>3. Pay the shown KES amount via M-Pesa.</li>
          <li>4. Submit the transaction code to mark the order as paid.</li>
        </ul>
        <div className="button-row">
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
        </div>
      </aside>
    </div>
  );
}

export default BuyPage;
