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

      <div className="order-meta">
        <span>{isSell ? "KES payout" : "KES to pay"}: KES {order.kesAmount.toLocaleString()}</span>
        {order.userLabel ? <span>User: {order.userLabel}</span> : null}
        {order.userPhone ? <span>Login phone: {order.userPhone}</span> : null}
        {order.payoutPhoneNumber ? <span>M-Pesa payout: {order.payoutPhoneNumber}</span> : null}
        {user?.isAdmin && order.userWalletAddress ? <span>User wallet: {order.userWalletAddress}</span> : null}
        {order.destinationUsername ? <span>World username: @{order.destinationUsername}</span> : null}
        {order.walletAddress ? <span>Delivery wallet: {order.walletAddress}</span> : null}
        {order.paymentMethod ? <span>Method: {order.paymentMethod}</span> : null}
        {order.paymentSummary ? <span>Payment note: {order.paymentSummary}</span> : null}
        {order.paymentVerificationStatus ? <span>Verification: {order.paymentVerificationStatus}</span> : null}
        {order.paymentReference ? <span>Reference: {order.paymentReference}</span> : null}
        <span>Created: {formatDate(order.createdAt)}</span>
      </div>

      {children}
    </article>
  );
}

export default OrderCard;
