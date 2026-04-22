import { useState } from "react";
import { useAppSettings } from "../../hooks/useAppSettings";
import { useOrderFlow } from "../../hooks/useOrderFlow";
import {
  canUseWorldPay,
  getWorldAppContext,
  openSupportEmail,
  requestWorldPayment,
  updateOrder,
} from "../../services";

function SellPage() {
  const settings = useAppSettings();
  const worldApp = getWorldAppContext();
  const [sendLoading, setSendLoading] = useState(false);
  const {
    asset,
    setAsset,
    cryptoAmount,
    setCryptoAmount,
    payoutPhoneNumber,
    setPayoutPhoneNumber,
    paymentReference,
    setPaymentReference,
    step,
    setCurrentOrder,
    currentOrder,
    error,
    setError,
    kesAmount,
    exchangeRate,
    placeOrder,
    markAsPaid,
    supportedAssets,
  } = useOrderFlow("sell");
  const canSendInsideMiniApp =
    worldApp.isInstalled &&
    canUseWorldPay(asset) &&
    Boolean(settings.sellWalletAddress?.trim());

  const handleMiniAppSend = async () => {
    if (!currentOrder) {
      return;
    }

    setError("");
    setSendLoading(true);

    try {
      const payment = await requestWorldPayment({
        amount: currentOrder.cryptoAmount,
        asset: currentOrder.asset,
        description: `TMpesa sell order ${currentOrder.id}`,
        to: settings.sellWalletAddress,
      });

      const updated = updateOrder(currentOrder.id, {
        paymentMethod: "world-pay",
        paymentReference: payment.transactionId,
        paymentSummary: payment.verified
          ? `World Pay verified (${payment.transactionStatus})`
          : `World Pay submitted (${payment.transactionStatus})`,
        paymentVerificationStatus: payment.transactionStatus,
        status: "paid",
      });

      setCurrentOrder(updated);
      markAsPaid(payment.transactionId);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="content-grid">
      <section className="panel stack">
        <span className="brand-kicker">Sell WLD/USDC</span>
        <div>
          <h2>Send from World App, receive KES on M-Pesa</h2>
          <p className="muted">
            Enter the amount you want to sell, confirm your payout phone, then send directly from
            your World wallet to the TMpesa receiver. The admin sees your paid order and sends KES
            to your saved M-Pesa number.
          </p>
          <p className="muted">Rate shown now: KES {exchangeRate} per {asset}. Fees are excluded.</p>
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
            <div className="field">
              <label htmlFor="payoutPhoneNumber">M-Pesa payout number</label>
              <input
                id="payoutPhoneNumber"
                value={payoutPhoneNumber}
                onChange={(event) => setPayoutPhoneNumber(event.target.value)}
                placeholder="0712345678"
              />
              <span className="muted field-hint">
                This is where the admin will send KES after your World payment is confirmed.
              </span>
            </div>

            <div className="amount-line">
              <span>You will receive</span>
              <strong>KES {kesAmount.toLocaleString()}</strong>
            </div>

            <button type="button" className="button" onClick={placeOrder}>
              Create Sell Order
            </button>
          </div>
        ) : null}

        {step >= 2 && currentOrder ? (
          <div className="stack">
            {canSendInsideMiniApp ? (
              <div className="highlight-box action-highlight">
                <strong>Step 2: Pay with World App</strong>
                <p className="muted">
                  Tap send and approve the World Pay sheet. The payment goes to the TMpesa
                  Worldchain receiver below and your order moves to admin payout automatically.
                </p>
                <code>Receiver: {settings.sellWalletAddress}</code>
              </div>
            ) : (
              <div className="highlight-box">
                <strong>Manual confirmation required</strong>
                <p className="muted">
                  Open TMpesa inside World App for direct wallet payment. If the World Pay sheet is
                  unavailable, send manually and submit the blockchain transaction hash.
                </p>
                <code>Receiver: {settings.sellWalletAddress}</code>
              </div>
            )}

            <div className="amount-line">
              <span>KES payout</span>
              <strong>KES {currentOrder.kesAmount.toLocaleString()}</strong>
            </div>
            <div className="info-box receipt-card">
              <strong>Your payout destination</strong>
              <span>M-Pesa phone number admin will pay</span>
              <code>{currentOrder.payoutPhoneNumber}</code>
            </div>

            {step === 2 ? (
              <>
                {canSendInsideMiniApp ? (
                  <button
                    type="button"
                    className="button"
                    onClick={handleMiniAppSend}
                    disabled={sendLoading}
                  >
                    {sendLoading ? "Opening World payment..." : `Send ${currentOrder.asset} with World Pay`}
                  </button>
                ) : (
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

                    <button
                      type="button"
                      className="button"
                      onClick={() => markAsPaid(paymentReference)}
                    >
                      I HAVE SENT
                    </button>
                  </>
                )}
              </>
            ) : null}

            {step === 3 ? (
              <div className="success-panel">
                <strong>Payment received for review</strong>
                <p>
                  Your sell order is marked as paid. The admin will confirm the World payment and
                  send KES to <strong>{currentOrder.payoutPhoneNumber}</strong>.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <aside className="summary-card stack">
        <h3>Sell Flow</h3>
        <div className="flow-list">
          <div><span>1</span><p>Choose WLD/USDC and enter the amount.</p></div>
          <div><span>2</span><p>Confirm your M-Pesa payout number.</p></div>
          <div><span>3</span><p>Approve World Pay inside World App.</p></div>
          <div><span>4</span><p>Admin pays KES to your saved phone number.</p></div>
        </div>
        <div className="support-card">
          <strong>Need help?</strong>
          <p className="muted">Open Gmail support for sell questions or delayed payout help.</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              openSupportEmail({
                subject: "TMpesa sell support",
                body: "Hello TMpesa team,\n\nI need help with my sell flow.",
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
                subject: "TMpesa delayed sell payout",
                body: "Hello TMpesa team,\n\nMy sell payout seems delayed. Please assist.",
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

export default SellPage;
