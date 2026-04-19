import StatusPill from "./StatusPill";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString();
}

function OrderCard({ order, children }) {
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
        <span>KES Value: KES {order.kesAmount.toLocaleString()}</span>
        {order.userLabel ? <span>User: {order.userLabel}</span> : null}
        {order.userPhone ? <span>User Phone: {order.userPhone}</span> : null}
        {order.userWalletAddress ? <span>Wallet: {order.userWalletAddress}</span> : null}
        {order.walletAddress ? <span>Destination: {order.walletAddress}</span> : null}
        {order.paymentReference ? <span>Reference: {order.paymentReference}</span> : null}
        <span>Created: {formatDate(order.createdAt)}</span>
      </div>

      {children}
    </article>
  );
}

export default OrderCard;
