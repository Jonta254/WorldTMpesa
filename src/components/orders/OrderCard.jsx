import { getCurrentUser } from "../../services";
import StatusPill from "./StatusPill";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString();
}

function OrderCard({ order, children }) {
  const user = getCurrentUser();
  const isSell = order.type === "sell";

  return (
    <article className="order-card stack">
      <div className="split">
        <div>
          <span className="tag">{order.type}</span>
          <h3>
            {order.cryptoAmount} {order.asset}
          </h3>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <span>{isSell ? "KES payout" : "KES to pay"}</span>
          <strong>KES {order.kesAmount.toLocaleString()}</strong>
        </div>
        {order.userLabel ? (
          <div className="detail-item">
            <span>User</span>
            <strong>{order.userLabel}</strong>
          </div>
        ) : null}
        {order.destinationUsername ? (
          <div className="detail-item">
            <span>World username</span>
            <strong>@{order.destinationUsername}</strong>
          </div>
        ) : null}
        {order.payoutPhoneNumber ? (
          <div className="detail-item">
            <span>M-Pesa payout</span>
            <strong>{order.payoutPhoneNumber}</strong>
          </div>
        ) : null}
        {order.paymentReference ? (
          <div className="detail-item">
            <span>Reference</span>
            <strong>{order.paymentReference}</strong>
          </div>
        ) : null}
      </div>

      <div className="order-meta">
        {order.userPhone ? <span>Login phone: {order.userPhone}</span> : null}
        {user?.isAdmin && order.userWalletAddress ? <span>User wallet: {order.userWalletAddress}</span> : null}
        {order.walletAddress ? <span>Delivery wallet: {order.walletAddress}</span> : null}
        {order.paymentMethod ? <span>Method: {order.paymentMethod}</span> : null}
        {order.paymentSummary ? <span>Payment note: {order.paymentSummary}</span> : null}
        {order.paymentVerificationStatus ? <span>Verification: {order.paymentVerificationStatus}</span> : null}
        <span>Created: {formatDate(order.createdAt)}</span>
      </div>

      {children}
    </article>
  );
}

export default OrderCard;
