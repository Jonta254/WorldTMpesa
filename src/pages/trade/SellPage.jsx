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
    asset === "WLD" &&
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
        reference: currentOrder.id,
        to: settings.sellWalletAddress,
      });

      const updated = updateOrder(currentOrder.id, {
        paymentMethod: "world-pay",
        paymentReference: payment.transactionId,
        paymentSummary: `World Pay ref ${payment.reference}`,
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
        <span className="brand-kicker">Sell Flow</span>
        <div>
          <h2>Sell crypto for KES</h2>
          <p className="muted">
            Sell requests stay simple: place the order, send WLD inside TMpesa when available, and
            let the admin confirm your payout to M-Pesa manually.
          </p>
          <p className="muted">Current admin rate: KES {exchangeRate} per {asset}.</p>
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
            {canSendInsideMiniApp ? (
              <div className="highlight-box">
                <strong>Send {currentOrder.asset} without leaving TMpesa</strong>
                <p className="muted">
                  Tap the button below and World App will open the payment sheet using your wallet
                  balance. After a successful send, your order is marked as paid automatically.
                </p>
                <code>{settings.sellWalletAddress}</code>
              </div>
            ) : (
              <div className="highlight-box">
                <strong>Send your {currentOrder.asset} to this wallet address</strong>
                <p className="muted">
                  Browser preview and non-WLD assets still use the manual confirmation flow.
                </p>
                <code>{settings.sellWalletAddress}</code>
              </div>
            )}

            <div className="amount-line">
              <span>Order value</span>
              <strong>KES {currentOrder.kesAmount.toLocaleString()}</strong>
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
                    {sendLoading ? "Opening World payment..." : "Send WLD in TMpesa"}
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
          <li>1. Enter the amount of crypto you want to sell.</li>
          <li>Use WLD or USDT depending on the asset selected.</li>
          <li>2. Confirm the KES value at the current admin rate.</li>
          <li>3. For WLD inside World App, tap send and complete the payment sheet in-app.</li>
          <li>4. For browser preview or USDT, send manually and submit the transaction hash.</li>
        </ul>
        <div className="button-row">
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
